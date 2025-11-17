"""
Unit tests for architecture-level analysis over OgraphX IR.
"""

import json
import sys
from pathlib import Path

import pytest

# Add analysis directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "analysis"))

import analyze_graph


class TestArchitectureAnalyzer:
    @pytest.fixture
    def sample_ir(self):
        return {
            "files": ["sample.ts"],
            "symbols": [
                {
                    "id": "A",
                    "file": "sample.ts",
                    "kind": "function",
                    "name": "A",
                    "class_name": None,
                    "exported": True,
                    "params_contract": "c1",
                    "range": [1, 5],
                },
                {
                    "id": "B",
                    "file": "sample.ts",
                    "kind": "function",
                    "name": "B",
                    "class_name": None,
                    "exported": False,
                    "params_contract": None,
                    "range": [6, 10],
                },
            ],
            "calls": [
                {"frm": "A", "to": "B", "name": "B", "line": 7},
            ],
            "contracts": [
                {
                    "id": "c1",
                    "kind": "params",
                    "props": [
                        {"name": "p1", "raw": "string"},
                        {"name": "p2", "raw": "number"},
                        {"name": "p3", "raw": "boolean"},
                        {"name": "p4", "raw": "string"},
                        {"name": "p5", "raw": "string"},
                        {"name": "p6", "raw": "string"},
                    ],
                }
            ],
        }

    def test_analyze_architecture_basic_metrics(self, sample_ir):
        report = analyze_graph.analyze_architecture_ir(sample_ir)
        assert report["summary"]["symbols"] == 2
        assert report["summary"]["calls"] == 1
        assert "A" in report["coupling"]
        assert report["coupling"]["A"]["efferent"] == 1
        assert report["coupling"]["B"]["afferent"] == 1

    def test_analyze_architecture_anti_patterns(self, sample_ir):
        report = analyze_graph.analyze_architecture_ir(sample_ir)
        long_params = report["anti_patterns"]["long_parameter_list"]
        assert any(item["symbol"] == "A" for item in long_params)
        cycles = report["anti_patterns"]["cycles"]
        assert cycles == []

    def test_analyze_ir_includes_architecture_section(self, tmp_path, sample_ir):
        ir_path = tmp_path / "ir.json"
        ir_path.write_text(json.dumps(sample_ir), encoding="utf-8")
        analysis = analyze_graph.analyze_ir(str(ir_path))
        assert "architecture" in analysis
        arch = analysis["architecture"]
        assert arch["summary"]["symbols"] == 2
        assert arch["summary"]["calls"] == 1

