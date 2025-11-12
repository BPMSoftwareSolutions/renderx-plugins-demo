#!/usr/bin/env python3
"""
OgraphX Artifact Manager

Manages organized storage and retrieval of codebase graph artifacts.
Each codebase gets a dedicated folder with all its artifacts organized by type.

Structure:
  .ographx/
  ├── artifacts/
  │   ├── renderx-web/
  │   │   ├── config.json (codebase configuration)
  │   │   ├── ir/
  │   │   │   └── graph.json (intermediate representation)
  │   │   ├── sequences/
  │   │   │   ├── sequences.json
  │   │   │   └── orchestration.json
  │   │   ├── visualization/
  │   │   │   ├── diagrams/
  │   │   │   │   ├── *.mmd
  │   │   │   │   └── *.svg
  │   │   │   └── metadata.json
  │   │   ├── analysis/
  │   │   │   ├── analysis.json
  │   │   │   └── metrics.json
  │   │   └── manifest.json (artifact manifest)
  │   ├── ographx-self/
  │   └── ...
  └── registry.json (master registry of all artifacts)
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any


class ArtifactConfig:
    """Configuration for a codebase to be graphed"""
    
    def __init__(self, name: str, root_dirs: List[str], exclude_dirs: List[str] = None):
        self.name = name
        self.root_dirs = root_dirs
        self.exclude_dirs = exclude_dirs or []
        self.created_at = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "root_dirs": self.root_dirs,
            "exclude_dirs": self.exclude_dirs,
            "created_at": self.created_at
        }


class ArtifactManifest:
    """Manifest for a single codebase's artifacts"""
    
    def __init__(self, codebase_name: str, config: ArtifactConfig):
        self.codebase_name = codebase_name
        self.config = config
        self.generated_at = datetime.now().isoformat()
        self.artifacts = {
            "ir": None,
            "sequences": [],
            "visualizations": [],
            "analysis": None
        }
        self.statistics = {
            "files": 0,
            "symbols": 0,
            "calls": 0,
            "contracts": 0
        }
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "codebase_name": self.codebase_name,
            "config": self.config.to_dict(),
            "generated_at": self.generated_at,
            "artifacts": self.artifacts,
            "statistics": self.statistics
        }


class ArtifactManager:
    """Manages artifact storage and retrieval"""
    
    def __init__(self, base_dir: str = ".ographx/artifacts"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.registry_path = self.base_dir.parent / "registry.json"
        self.registry = self._load_registry()
    
    def _load_registry(self) -> Dict[str, Any]:
        """Load or create the master registry"""
        if self.registry_path.exists():
            with open(self.registry_path) as f:
                return json.load(f)
        return {"version": "0.1.0", "codebases": {}}
    
    def _save_registry(self):
        """Save the master registry"""
        with open(self.registry_path, 'w') as f:
            json.dump(self.registry, f, indent=2)
    
    def create_codebase_folder(self, codebase_name: str, config: ArtifactConfig) -> Path:
        """Create a dedicated folder for a codebase"""
        codebase_dir = self.base_dir / codebase_name
        codebase_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        (codebase_dir / "ir").mkdir(exist_ok=True)
        (codebase_dir / "sequences").mkdir(exist_ok=True)
        (codebase_dir / "visualization" / "diagrams").mkdir(parents=True, exist_ok=True)
        (codebase_dir / "analysis").mkdir(exist_ok=True)
        
        # Save config
        config_path = codebase_dir / "config.json"
        with open(config_path, 'w') as f:
            json.dump(config.to_dict(), f, indent=2)
        
        # Register in master registry
        self.registry["codebases"][codebase_name] = {
            "path": str(codebase_dir),
            "created_at": datetime.now().isoformat(),
            "config": config.to_dict()
        }
        self._save_registry()
        
        return codebase_dir
    
    def get_codebase_dir(self, codebase_name: str) -> Path:
        """Get the directory for a codebase"""
        return self.base_dir / codebase_name
    
    def save_manifest(self, codebase_name: str, manifest: ArtifactManifest):
        """Save the artifact manifest for a codebase"""
        codebase_dir = self.get_codebase_dir(codebase_name)
        manifest_path = codebase_dir / "manifest.json"
        
        with open(manifest_path, 'w') as f:
            json.dump(manifest.to_dict(), f, indent=2)
    
    def list_codebases(self) -> List[str]:
        """List all registered codebases"""
        return list(self.registry.get("codebases", {}).keys())
    
    def get_codebase_info(self, codebase_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a codebase"""
        return self.registry.get("codebases", {}).get(codebase_name)


# Example usage
if __name__ == "__main__":
    # Create artifact manager
    manager = ArtifactManager()
    
    # Define a codebase configuration
    renderx_config = ArtifactConfig(
        name="renderx-web",
        root_dirs=["packages", "src/ui"],
        exclude_dirs=["robotics", "ographx", "node_modules", "dist"]
    )
    
    # Create codebase folder
    codebase_dir = manager.create_codebase_folder("renderx-web", renderx_config)
    print(f"✅ Created codebase folder: {codebase_dir}")
    
    # Create manifest
    manifest = ArtifactManifest("renderx-web", renderx_config)
    manifest.statistics = {
        "files": 543,
        "symbols": 1010,
        "calls": 4579,
        "contracts": 927
    }
    manager.save_manifest("renderx-web", manifest)
    print(f"✅ Saved manifest")
    
    # List codebases
    print(f"\n📋 Registered codebases:")
    for cb in manager.list_codebases():
        print(f"   • {cb}")

