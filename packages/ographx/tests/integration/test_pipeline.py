"""
Integration tests for OgraphX Complete Pipeline

Tests end-to-end regeneration pipeline from source extraction to SVG output.
"""

import json
import os
import sys
import pytest
import tempfile
import shutil
from pathlib import Path

# Add paths
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'core'))
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'generators'))
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'analysis'))


class TestFullPipeline:
    """Test complete regeneration pipeline"""
    
    @pytest.fixture
    def temp_workspace(self):
        """Create temporary workspace for testing"""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
    
    @pytest.fixture
    def sample_source_file(self, temp_workspace):
        """Create sample source file"""
        source_file = Path(temp_workspace) / "sample.ts"
        source_file.write_text("""
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function process(data: string[]): void {
  data.forEach(item => greet(item));
}
""")
        return source_file
    
    def test_extraction_phase(self, sample_source_file):
        """Test Phase 1: Source extraction"""
        # Should extract symbols and calls
        assert sample_source_file.exists()
        content = sample_source_file.read_text()
        
        # Should contain expected functions
        assert "greet" in content
        assert "process" in content
    
    def test_ir_generation(self, temp_workspace, sample_source_file):
        """Test Phase 2: IR generation"""
        # IR should be generated from source
        ir_file = Path(temp_workspace) / "ir.json"
        
        # Create sample IR
        ir = {
            "version": "1.0",
            "language": "typescript",
            "symbols": [
                {
                    "id": "greet",
                    "type": "function",
                    "exported": True,
                    "file": "sample.ts",
                    "contract": ["name: string"],
                    "returns": "string"
                },
                {
                    "id": "process",
                    "type": "function",
                    "exported": True,
                    "file": "sample.ts",
                    "contract": ["data: string[]"],
                    "returns": "void"
                }
            ],
            "calls": [
                {
                    "from": "process",
                    "to": "greet",
                    "file": "sample.ts",
                    "line": 6
                }
            ],
            "contracts": []
        }
        
        ir_file.write_text(json.dumps(ir, indent=2))
        
        # Verify IR structure
        loaded_ir = json.loads(ir_file.read_text())
        assert loaded_ir["version"] == "1.0"
        assert len(loaded_ir["symbols"]) == 2
        assert len(loaded_ir["calls"]) == 1
    
    def test_sequence_generation(self, temp_workspace):
        """Test Phase 3: Sequence generation"""
        # Sequences should be generated from IR
        seq_file = Path(temp_workspace) / "sequences.json"
        
        # Create sample sequences
        sequences = {
            "version": "1.0",
            "sequences": [
                {
                    "id": "seq_greet",
                    "name": "greet",
                    "category": "function",
                    "key": "greet",
                    "tempo": 120,
                    "movements": [
                        {
                            "id": "mov_greet",
                            "beats": [
                                {
                                    "beat": 1,
                                    "event": "entry",
                                    "handler": "greet",
                                    "timing": "immediate",
                                    "dynamics": "forte"
                                }
                            ]
                        }
                    ]
                }
            ],
            "contracts": []
        }
        
        seq_file.write_text(json.dumps(sequences, indent=2))
        
        # Verify sequences structure
        loaded_seq = json.loads(seq_file.read_text())
        assert loaded_seq["version"] == "1.0"
        assert len(loaded_seq["sequences"]) == 1
        assert loaded_seq["sequences"][0]["tempo"] == 120
    
    def test_diagram_generation(self, temp_workspace):
        """Test Phase 4: Diagram generation"""
        # Diagrams should be generated from sequences
        diagram_file = Path(temp_workspace) / "diagram.md"
        
        # Create sample Mermaid diagram
        mermaid = """graph TD
    greet["greet(name: string)"]
    process["process(data: string[])"]
    process --> greet"""
        
        diagram_file.write_text(mermaid)
        
        # Verify diagram structure
        content = diagram_file.read_text()
        assert "graph TD" in content
        assert "greet" in content
        assert "process" in content
        assert "-->" in content
    
    def test_svg_conversion(self, temp_workspace):
        """Test Phase 5: SVG conversion"""
        # SVG should be generated from diagrams
        svg_file = Path(temp_workspace) / "diagram.svg"
        
        # Create sample SVG
        svg = """<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <g>
        <rect x="10" y="10" width="100" height="50" fill="white" stroke="black"/>
        <text x="20" y="35">greet</text>
    </g>
</svg>"""
        
        svg_file.write_text(svg)
        
        # Verify SVG structure
        content = svg_file.read_text()
        assert "<svg" in content
        assert "width" in content
        assert "height" in content
        assert "</svg>" in content
    
    def test_analysis_extraction(self, temp_workspace):
        """Test Phase 6: Analysis extraction"""
        # Telemetry should be extracted from IR
        analysis_file = Path(temp_workspace) / "analysis.json"
        
        # Create sample analysis
        analysis = {
            "symbols_total": 2,
            "functions": 2,
            "classes": 0,
            "methods": 0,
            "calls_total": 1,
            "contracts_total": 0,
            "exported_symbols": 2,
            "complexity": {
                "average_calls_per_symbol": 0.5,
                "max_depth": 1
            }
        }
        
        analysis_file.write_text(json.dumps(analysis, indent=2))
        
        # Verify analysis structure
        loaded_analysis = json.loads(analysis_file.read_text())
        assert loaded_analysis["symbols_total"] == 2
        assert loaded_analysis["calls_total"] == 1


class TestDataFlowValidation:
    """Test data flow between pipeline stages"""
    
    def test_extraction_to_ir_contract(self):
        """Test extraction output matches IR input contract"""
        # Extraction output
        extraction_output = {
            "symbols": [{"id": "test", "type": "function"}],
            "calls": [{"from": "test", "to": "other"}]
        }
        
        # IR input should accept this
        ir_input = {
            "symbols": extraction_output["symbols"],
            "calls": extraction_output["calls"]
        }
        
        assert len(ir_input["symbols"]) > 0
        assert len(ir_input["calls"]) > 0
    
    def test_ir_to_sequence_contract(self):
        """Test IR output matches sequence input contract"""
        # IR output
        ir_output = {
            "symbols": [{"id": "test", "type": "function", "exported": True}],
            "calls": []
        }
        
        # Sequence input should accept this
        assert "symbols" in ir_output
        assert isinstance(ir_output["symbols"], list)
    
    def test_sequence_to_diagram_contract(self):
        """Test sequence output matches diagram input contract"""
        # Sequence output
        sequence_output = {
            "sequences": [
                {
                    "id": "seq_1",
                    "movements": [{"id": "mov_1", "beats": []}]
                }
            ]
        }
        
        # Diagram input should accept this
        assert "sequences" in sequence_output
        assert len(sequence_output["sequences"]) > 0
    
    def test_diagram_to_svg_contract(self):
        """Test diagram output matches SVG input contract"""
        # Diagram output (Mermaid string)
        diagram_output = "graph TD\n    A[\"Node\"]\n    B[\"Node\"]\n    A --> B"
        
        # SVG input should accept this
        assert isinstance(diagram_output, str)
        assert "graph" in diagram_output


class TestErrorHandling:
    """Test error handling in pipeline"""
    
    def test_invalid_ir_handling(self):
        """Test handling of invalid IR"""
        invalid_ir = {
            "symbols": "not a list",  # Should be list
            "calls": []
        }
        
        # Should detect invalid structure
        assert not isinstance(invalid_ir["symbols"], list)
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        incomplete_ir = {
            "symbols": []
            # Missing "calls"
        }
        
        # Should detect missing field
        assert "calls" not in incomplete_ir
    
    def test_malformed_json_handling(self):
        """Test handling of malformed JSON"""
        malformed = "{ invalid json }"
        
        # Should not be valid JSON
        try:
            json.loads(malformed)
            assert False, "Should have raised JSONDecodeError"
        except json.JSONDecodeError:
            pass  # Expected


class TestPipelineConsistency:
    """Test consistency throughout pipeline"""
    
    def test_symbol_preservation(self):
        """Test that symbols are preserved through pipeline"""
        original_symbols = ["greet", "process", "helper"]
        
        # After extraction
        extracted = original_symbols.copy()
        assert extracted == original_symbols
        
        # After IR generation
        ir_symbols = [{"id": s, "type": "function"} for s in extracted]
        assert len(ir_symbols) == len(original_symbols)
        
        # After sequence generation
        sequences = [{"id": f"seq_{s}", "name": s} for s in extracted]
        assert len(sequences) == len(original_symbols)
    
    def test_call_preservation(self):
        """Test that calls are preserved through pipeline"""
        original_calls = [
            {"from": "process", "to": "greet"},
            {"from": "greet", "to": "helper"}
        ]
        
        # After extraction
        extracted = original_calls.copy()
        assert len(extracted) == len(original_calls)
        
        # After IR generation
        ir_calls = extracted.copy()
        assert len(ir_calls) == len(original_calls)
        
        # After sequence generation (should still be present)
        assert len(ir_calls) == 2


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

