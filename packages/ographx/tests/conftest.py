"""
Shared pytest fixtures and configuration for OgraphX tests
"""

import json
import pytest
import tempfile
import shutil
from pathlib import Path


@pytest.fixture
def temp_dir():
    """Create a temporary directory for test files"""
    temp_path = tempfile.mkdtemp()
    yield temp_path
    # Cleanup
    shutil.rmtree(temp_path, ignore_errors=True)


@pytest.fixture
def sample_ir():
    """Sample IR for testing"""
    return {
        "version": "1.0",
        "language": "typescript",
        "symbols": [
            {
                "id": "greet",
                "type": "function",
                "exported": True,
                "file": "test.ts",
                "line": 1,
                "contract": ["name: string"],
                "returns": "string"
            },
            {
                "id": "process",
                "type": "function",
                "exported": True,
                "file": "test.ts",
                "line": 5,
                "contract": ["data: string[]"],
                "returns": "void"
            },
            {
                "id": "Calculator",
                "type": "class",
                "exported": True,
                "file": "test.ts",
                "line": 10,
                "methods": ["compute", "helper"]
            },
            {
                "id": "Calculator.compute",
                "type": "method",
                "exported": True,
                "file": "test.ts",
                "line": 11,
                "contract": ["a: number", "b: number"],
                "returns": "number"
            }
        ],
        "calls": [
            {
                "from": "process",
                "to": "greet",
                "file": "test.ts",
                "line": 6
            },
            {
                "from": "Calculator.compute",
                "to": "greet",
                "file": "test.ts",
                "line": 12
            }
        ],
        "contracts": [
            {
                "id": "greet_contract",
                "symbol": "greet",
                "parameters": ["name: string"],
                "returns": "string"
            },
            {
                "id": "process_contract",
                "symbol": "process",
                "parameters": ["data: string[]"],
                "returns": "void"
            }
        ]
    }


@pytest.fixture
def sample_sequences():
    """Sample sequences for testing"""
    return {
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
                            },
                            {
                                "beat": 2,
                                "event": "return",
                                "handler": "greet",
                                "timing": "immediate",
                                "dynamics": "forte"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "seq_process",
                "name": "process",
                "category": "function",
                "key": "process",
                "tempo": 100,
                "movements": [
                    {
                        "id": "mov_process",
                        "beats": [
                            {
                                "beat": 1,
                                "event": "entry",
                                "handler": "process",
                                "timing": "immediate",
                                "dynamics": "forte"
                            },
                            {
                                "beat": 2,
                                "event": "call",
                                "handler": "greet",
                                "timing": "immediate",
                                "dynamics": "mezzo-forte"
                            },
                            {
                                "beat": 3,
                                "event": "return",
                                "handler": "process",
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


@pytest.fixture
def sample_mermaid_diagram():
    """Sample Mermaid diagram for testing"""
    return """graph TD
    greet["greet(name: string)"]
    process["process(data: string[])"]
    Calculator["Calculator"]
    compute["compute(a: number, b: number)"]
    
    process --> greet
    Calculator --> compute
    compute --> greet"""


@pytest.fixture
def sample_svg():
    """Sample SVG for testing"""
    return """<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .node { fill: white; stroke: black; stroke-width: 2; }
            .edge { stroke: black; stroke-width: 2; }
            .label { font-family: Arial; font-size: 12px; }
        </style>
    </defs>
    <g>
        <rect class="node" x="10" y="10" width="100" height="50"/>
        <text class="label" x="20" y="35">greet</text>
        <rect class="node" x="150" y="10" width="100" height="50"/>
        <text class="label" x="160" y="35">process</text>
        <line class="edge" x1="110" y1="35" x2="150" y2="35"/>
    </g>
</svg>"""


@pytest.fixture
def fixture_dir():
    """Get path to fixtures directory"""
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def typescript_fixtures(fixture_dir):
    """Get paths to TypeScript fixtures"""
    return {
        "simple": fixture_dir / "typescript" / "simple.ts",
        "with_imports": fixture_dir / "typescript" / "with_imports.ts",
        "expected_ir": fixture_dir / "typescript" / "expected_simple_ir.json"
    }


@pytest.fixture
def load_fixture_file():
    """Factory fixture to load fixture files"""
    def _load(fixture_path):
        with open(fixture_path, 'r') as f:
            if fixture_path.suffix == '.json':
                return json.load(f)
            else:
                return f.read()
    return _load


# Markers for test categorization
def pytest_configure(config):
    """Register custom markers"""
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "contract: mark test as a contract validation test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )

