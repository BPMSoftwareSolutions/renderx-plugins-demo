"""
Manifest Audit Domain

Handles auditing manifests against desktop implementations.
Compares web manifest declarations with desktop component availability.
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Optional, Any, Set

from .models import DesktopComponent


class ManifestAuditor:
    """Audits manifest declarations against desktop implementations."""
    
    @staticmethod
    def audit_manifests(plugin_name: str, desktop_components: List[DesktopComponent]) -> Dict[str, List[Dict[str, Any]]]:
        """Load manifests and compute declared vs desktop-present audit for the plugin."""
        base_name = ''.join(word.capitalize() for word in plugin_name.split('-'))
        plugin_id_candidates = {
            plugin_name,
            base_name + 'Plugin',
            base_name,
            base_name + 'ComponentPlugin',
            plugin_name + '-component'
        }
        desktop_names = {c.name for c in desktop_components}
        audit: Dict[str, List[Dict[str, Any]]] = {
            'interactions': [],
            'topics': [],
            'layout': [],
            'runtime_plugins': []
        }

        def resolve_manifest_path(filename: str) -> Optional[Path]:
            candidates = [
                Path(filename),
                Path(__file__).resolve().parent.parent.parent / filename
            ]
            for c in candidates:
                if c.exists():
                    return c
            return None

        # Interaction manifest
        try:
            im_path = resolve_manifest_path('interaction-manifest.json')
            if im_path:
                im = json.loads(im_path.read_text(encoding='utf-8'))
                for route, meta in (im.get('routes') or {}).items():
                    pid = meta.get('pluginId')
                    if any(p.lower() == (pid or '').lower() for p in plugin_id_candidates):
                        expected_prefix = (pid or '').replace('Plugin', '')
                        component_present = any(d.lower().startswith(expected_prefix.lower()) for d in desktop_names)
                        
                        # Check if plugin CLASS file exists (for runtime-only plugins)
                        class_name = pid.split('.')[-1]
                        plugin_class_present = ManifestAuditor._check_class_exists(class_name)
                        
                        # Plugin is present if either AXAML component OR plugin class file exists
                        plugin_present = component_present or plugin_class_present
                        
                        sequence_likely_present = False
                        if plugin_present:
                            seq_id = meta.get('sequenceId') or ''
                            route_normalized = route.replace('.', ':').lower()
                            plugin_folder = Path('src') / f'RenderX.Plugins.{expected_prefix.replace(" ", "")}'
                            if plugin_folder.exists():
                                for cs_file in plugin_folder.rglob('*SequenceRegistration.cs'):
                                    try:
                                        content = cs_file.read_text(encoding='utf-8', errors='ignore')
                                        if route_normalized in content.lower() or route.lower() in content.lower() or seq_id.lower() in content.lower():
                                            sequence_likely_present = True
                                            break
                                    except Exception:
                                        continue
                            if not sequence_likely_present and plugin_present:
                                sequence_likely_present = True
                        
                        audit['interactions'].append({
                            'route': route,
                            'pluginId': pid,
                            'sequenceId': meta.get('sequenceId'),
                            'status': 'present' if (plugin_present and sequence_likely_present) else 'missing'
                        })
        except Exception:
            pass

        # Topics manifest
        try:
            tm_path = resolve_manifest_path('topics-manifest.json')
            if tm_path:
                tm = json.loads(tm_path.read_text(encoding='utf-8'))
                for topic, tmeta in (tm.get('topics') or {}).items():
                    for r in tmeta.get('routes') or []:
                        pid = r.get('pluginId')
                        if any(p.lower() == (pid or '').lower() for p in plugin_id_candidates):
                            expected_prefix = (pid or '').replace('Plugin', '')
                            component_present = any(d.lower().startswith(expected_prefix.lower()) for d in desktop_names)
                            
                            class_name = pid.split('.')[-1]
                            plugin_class_present = ManifestAuditor._check_class_exists(class_name)
                            plugin_present = component_present or plugin_class_present
                            
                            topic_normalized = topic.replace('.', ':').lower()
                            sequence_likely_present = False
                            if plugin_present:
                                plugin_folder = Path('src') / f'RenderX.Plugins.{expected_prefix.replace(" ", "")}'
                                seq_id = r.get('sequenceId') or ''
                                if plugin_folder.exists():
                                    for cs_file in plugin_folder.rglob('*.cs'):
                                        try:
                                            content = cs_file.read_text(encoding='utf-8', errors='ignore')
                                            if topic_normalized in content.lower() or topic.lower() in content.lower() or seq_id.lower() in content.lower():
                                                sequence_likely_present = True
                                                break
                                        except Exception:
                                            continue
                                if not sequence_likely_present and plugin_present:
                                    sequence_likely_present = True
                            
                            audit['topics'].append({
                                'topic': topic,
                                'pluginId': pid,
                                'sequenceId': r.get('sequenceId'),
                                'status': 'present' if (plugin_present and sequence_likely_present) else 'missing'
                            })
        except Exception:
            pass

        # Layout manifest (record slots for context)
        try:
            lm_path = resolve_manifest_path('layout-manifest.json')
            if lm_path:
                lm = json.loads(lm_path.read_text(encoding='utf-8'))
                slots = [s.get('name') for s in lm.get('slots') or [] if s.get('name')]
                for s in slots:
                    audit['layout'].append({'slot': s})
        except Exception:
            pass

        # Runtime plugin audit (from Shell plugin-manifest.json)
        try:
            pm_path = resolve_manifest_path(str(Path('src') / 'RenderX.Shell.Avalonia' / 'plugins' / 'plugin-manifest.json')) or resolve_manifest_path('plugins/plugin-manifest.json')
            plugin_loader_path = Path('src') / 'RenderX.Shell.Avalonia' / 'Infrastructure' / 'Plugins' / 'PluginLoader.cs'
            mainwindow_path = Path('src') / 'RenderX.Shell.Avalonia' / 'MainWindow.axaml.cs'

            loader_support = plugin_loader_path.exists() and ('LoadRuntimePluginsAsync' in plugin_loader_path.read_text(encoding='utf-8', errors='ignore'))
            callsite_support = mainwindow_path.exists() and ('LoadRuntimePluginsAsync' in mainwindow_path.read_text(encoding='utf-8', errors='ignore'))

            if pm_path and pm_path.exists():
                pm = json.loads(pm_path.read_text(encoding='utf-8'))
                for p in pm.get('plugins', []):
                    pid = p.get('id')
                    rt = p.get('runtime') or {}
                    module = rt.get('module')
                    export = rt.get('export')
                    if not (pid and module and export):
                        continue
                    class_name = export.split('.')[-1]
                    if any(cand.lower() == (pid or '').lower() for cand in plugin_id_candidates):
                        present_type = ManifestAuditor._check_class_exists(class_name)
                        status = 'present' if (present_type and loader_support and callsite_support) else 'missing'
                        reason = None
                        if status == 'missing':
                            missing_bits = []
                            if not present_type:
                                missing_bits.append('type not found in src')
                            if not loader_support:
                                missing_bits.append('loader lacks runtime support')
                            if not callsite_support:
                                missing_bits.append('MainWindow does not invoke runtime loader')
                            reason = ', '.join(missing_bits)
                        audit['runtime_plugins'].append({
                            'pluginId': pid,
                            'module': module,
                            'export': export,
                            'class': class_name,
                            'status': status,
                            'reason': reason
                        })
        except Exception:
            pass

        return audit
    
    @staticmethod
    def _check_class_exists(class_name: str) -> bool:
        """Check if a class exists in the src folder."""
        patterns = [f'{class_name}.cs', f'{class_name}.axaml.cs']
        for pattern in patterns:
            for cs in Path('src').rglob(pattern):
                try:
                    content = cs.read_text(encoding='utf-8', errors='ignore')
                    if re.search(rf'class\s+{re.escape(class_name)}\b', content):
                        return True
                except Exception:
                    continue
        return False
