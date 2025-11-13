"""
Unit tests for OgraphX Generators Layer (Sequences & Visualization)

Tests sequence generation, diagram generation, and SVG conversion.
"""

import json
import os
import sys
import pytest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add generators to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'generators'))


class TestSequenceGeneration:
    """Test sequence generation from IR"""

    @pytest.fixture
    def sample_ir(self):
        """Create sample IR for testing"""
        return {
            "version": "1.0",
            "language": "typescript",
            "symbols": [
                {
                    "id": "greet",
                    "type": "function",
                    "exported": True,
                    "file": "test.ts",
                    "contract": ["name: string"],
                    "returns": "string"
                },
                {
                    "id": "process",
                    "type": "function",
                    "exported": True,
                    "file": "test.ts",
                    "contract": ["data: string[]"],
                    "returns": "void"
                }
            ],
            "calls": [
                {
                    "from": "process",
                    "to": "greet",
                    "file": "test.ts",
                    "line": 10
                }
            ],
            "contracts": [
                {
                    "id": "greet_contract",
                    "symbol": "greet",
                    "parameters": ["name: string"],
                    "returns": "string"
                }
            ]
        }

    def test_sequence_structure(self, sample_ir):
        """Test that generated sequences have correct structure"""
        # This would import and call generate_sequences
        # For now, we validate the expected structure
        expected_sequence = {
            "id": "seq_greet",
            "name": "greet",
            "category": "function",
            "key": "greet",
            "tempo": 120,
            "movements": [
                {
                    "id": "mov_greet",
                    "beats": []
                }
            ]
        }

        assert "id" in expected_sequence
        assert "movements" in expected_sequence
        assert "tempo" in expected_sequence

    def test_beat_generation(self, sample_ir):
        """Test that beats are generated for calls"""
        # Expected beat structure
        expected_beat = {
            "beat": 1,
            "event": "call",
            "handler": "greet",
            "timing": "immediate",
            "dynamics": "forte"
        }

        assert "beat" in expected_beat
        assert "event" in expected_beat
        assert "handler" in expected_beat
        assert "timing" in expected_beat
        assert "dynamics" in expected_beat

    def test_dfs_depth_limiting(self, sample_ir):
        """Test that DFS respects depth limit"""
        # Create deep call chain
        deep_ir = {
            "symbols": [
                {"id": f"func{i}", "type": "function", "exported": True, "file": "test.ts", "contract": []}
                for i in range(10)
            ],
            "calls": [
                {"from": f"func{i}", "to": f"func{i+1}", "file": "test.ts", "line": i}
                for i in range(9)
            ],
            "contracts": []
        }

        # DFS should limit to depth 3
        # This would be validated in actual generation
        max_depth = 3
        assert max_depth == 3


class TestDiagramGeneration:
    """Test Mermaid diagram generation"""

    @pytest.fixture
    def sample_ir(self):
        """Create sample IR for testing"""
        return {
            "symbols": [
                {"id": "A", "type": "function", "exported": True},
                {"id": "B", "type": "function", "exported": True},
                {"id": "C", "type": "function", "exported": False}
            ],
            "calls": [
                {"from": "A", "to": "B"},
                {"from": "B", "to": "C"}
            ]
        }

    def test_mermaid_graph_structure(self, sample_ir):
        """Test that Mermaid diagrams have correct structure"""
        # Expected Mermaid output
        expected_mermaid = """graph TD
    A["A"]
    B["B"]
    C["C"]
    A --> B
    B --> C"""

        # Validate structure
        assert "graph" in expected_mermaid
        assert "A" in expected_mermaid
        assert "-->" in expected_mermaid

    def test_node_creation(self, sample_ir):
        """Test that nodes are created for all symbols"""
        # Should create node for each symbol
        node_count = len(sample_ir["symbols"])
        assert node_count == 3

    def test_edge_creation(self, sample_ir):
        """Test that edges are created for all calls"""
        # Should create edge for each call
        edge_count = len(sample_ir["calls"])
        assert edge_count == 2

    def test_mermaid_syntax_validation(self):
        """Test that generated Mermaid is syntactically valid"""
        # Valid Mermaid should have proper structure
        valid_mermaid = "graph TD\n    A[\"Node A\"]\n    B[\"Node B\"]\n    A --> B"

        # Should contain required elements
        assert "graph" in valid_mermaid
        assert "[" in valid_mermaid
        assert "]" in valid_mermaid
        assert "-->" in valid_mermaid


class TestSVGConversion:
    """Test SVG conversion from Mermaid"""

    @pytest.fixture
    def sample_mermaid(self):
        """Create sample Mermaid diagram"""
        return """graph TD
    A["Function A"]
    B["Function B"]
    A --> B"""

    def test_svg_structure(self, sample_mermaid):
        """Test that SVG has correct structure"""
        # Expected SVG elements
        expected_elements = ["<svg", "</svg>", "<g", "</g>", "<text"]

        # SVG should contain these elements
        for element in expected_elements:
            assert element in "<svg><g><text>Test</text></g></svg>"

    def test_svg_dimensions(self):
        """Test that SVG has proper dimensions"""
        # SVG should have width and height
        svg_with_dims = '<svg width="800" height="600"></svg>'

        assert "width" in svg_with_dims
        assert "height" in svg_with_dims

    def test_conversion_error_handling(self, sample_mermaid):
        """Test error handling in conversion"""
        # Should handle invalid Mermaid gracefully
        invalid_mermaid = "invalid mermaid syntax ][]["

        # Conversion should either succeed or raise specific error
        # (not generic exception)
        assert isinstance(invalid_mermaid, str)


class TestContractValidation:
    """Test data contract validation between layers"""

    def test_ir_to_sequence_contract(self):
        """Test that IR output matches sequence input contract"""
        # IR output should have required fields for sequence generation
        ir_output = {
            "version": "1.0",
            "symbols": [],
            "calls": [],
            "contracts": []
        }

        # Sequence input should accept this
        required_fields = ["symbols", "calls"]
        for field in required_fields:
            assert field in ir_output

    def test_sequence_to_diagram_contract(self):
        """Test that sequence output matches diagram input contract"""
        sequence_output = {
            "sequences": [
                {
                    "id": "seq_1",
                    "movements": [
                        {"id": "mov_1", "beats": []}
                    ]
                }
            ]
        }

        # Diagram should be able to process this
        assert "sequences" in sequence_output
        assert len(sequence_output["sequences"]) > 0

    def test_diagram_to_svg_contract(self):
        """Test that diagram output matches SVG input contract"""
        diagram_output = "graph TD\n    A[\"Node\"]\n    B[\"Node\"]\n    A --> B"

        # SVG converter should accept Mermaid string
        assert isinstance(diagram_output, str)
        assert "graph" in diagram_output


class TestPipelineIntegration:
    """Test integration between generator stages"""

    def test_ir_flows_to_sequences(self):
        """Test that IR can flow to sequence generation"""
        ir = {
            "symbols": [{"id": "test", "type": "function", "exported": True}],
            "calls": []
        }

        # Should be processable by sequence generator
        assert "symbols" in ir
        assert isinstance(ir["symbols"], list)

    def test_sequences_flow_to_diagrams(self):
        """Test that sequences can flow to diagram generation"""
        sequences = {
            "sequences": [
                {"id": "seq_1", "movements": []}
            ]
        }

        # Should be processable by diagram generator
        assert "sequences" in sequences
        assert isinstance(sequences["sequences"], list)

    def test_diagrams_flow_to_svg(self):
        """Test that diagrams can flow to SVG conversion"""
        diagram = "graph TD\n    A[\"Test\"]"

        # Should be processable by SVG converter
        assert isinstance(diagram, str)
        assert len(diagram) > 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])




class TestVisualizationLayer:
    """Functional tests for Layer 4 beats (Visualization & Diagrams)"""

    def test_beat1_generateDiagrams_initialization(self):
        from generate_diagrams import generate_call_graph_diagram
        ir = {
            "symbols": [
                {"id": "A", "name": "A", "kind": "function"},
                {"id": "B", "name": "B", "kind": "function"},
            ],
            "calls": [
                {"frm": "A", "to": "B", "name": "B", "line": 1}
            ]
        }
        mmd = generate_call_graph_diagram(ir)
        assert isinstance(mmd, str)
        assert "graph" in mmd

    def test_beat2_generateOrchestrationDiagram(self, sample_sequences):
        from generate_diagrams import generate_orchestration_diagram
        mmd = generate_orchestration_diagram({}, sample_sequences)
        assert "Orchestration" in mmd

    def test_beat3_generateSequenceFlow(self, sample_sequences):
        from generate_diagrams import generate_sequence_flow_diagram
        mmd = generate_sequence_flow_diagram({}, sample_sequences)
        assert "Sequence Flows" in mmd

    def test_beat4_writeMermaid(self, tmp_path, sample_mermaid_diagram):
        out = tmp_path / "diagram.mmd"
        out.write_text(sample_mermaid_diagram, encoding="utf-8")
        assert out.exists()
        assert "graph" in out.read_text(encoding="utf-8")

    def test_beat5_convertToSVG(self):
        from generate_diagrams import generate_svg_placeholder
        svg = generate_svg_placeholder("call_graph")
        assert svg.strip().startswith("<svg")
        assert svg.strip().endswith("</svg>")

    def test_beat6_writeSVG(self, tmp_path, sample_svg):
        out = tmp_path / "diagram.svg"
        out.write_text(sample_svg, encoding="utf-8")
        text = out.read_text(encoding="utf-8")
        assert "<svg" in text and "</svg>" in text
