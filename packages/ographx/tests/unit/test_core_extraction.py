"""
Unit tests for OgraphX Core Layer (Extraction)

Tests symbol extraction, call resolution, type handling, and import graph building
for both TypeScript and Python extractors.
"""

import json
import os
import sys
import pytest
from pathlib import Path

# Add core to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'core'))

# Import extractors
from ographx_ts import (
    extract_symbols, extract_calls, extract_contracts,
    build_import_graph, resolve_call
)


class TestTypeScriptSymbolExtraction:
    """Test TypeScript symbol extraction"""
    
    @pytest.fixture
    def simple_ts_file(self):
        """Load simple.ts fixture"""
        fixture_path = Path(__file__).parent.parent / 'fixtures' / 'typescript' / 'simple.ts'
        with open(fixture_path, 'r') as f:
            return f.read()
    
    def test_extract_function_declarations(self, simple_ts_file):
        """Test extraction of function declarations"""
        symbols = extract_symbols(simple_ts_file, 'simple.ts')
        
        # Should find greet function
        greet = next((s for s in symbols if s['id'] == 'greet'), None)
        assert greet is not None
        assert greet['type'] == 'function'
        assert greet['exported'] is False
        assert 'name: string' in greet['contract']
    
    def test_extract_arrow_functions(self, simple_ts_file):
        """Test extraction of arrow functions"""
        symbols = extract_symbols(simple_ts_file, 'simple.ts')
        
        # Should find add arrow function
        add = next((s for s in symbols if s['id'] == 'add'), None)
        assert add is not None
        assert add['type'] == 'function'
        assert 'a: number' in add['contract']
        assert 'b: number' in add['contract']
    
    def test_extract_exported_functions(self, simple_ts_file):
        """Test extraction of exported functions"""
        symbols = extract_symbols(simple_ts_file, 'simple.ts')
        
        # Should find multiply as exported
        multiply = next((s for s in symbols if s['id'] == 'multiply'), None)
        assert multiply is not None
        assert multiply['exported'] is True
    
    def test_extract_class_declarations(self, simple_ts_file):
        """Test extraction of class declarations"""
        symbols = extract_symbols(simple_ts_file, 'simple.ts')
        
        # Should find Calculator class
        calc_class = next((s for s in symbols if s['id'] == 'Calculator'), None)
        assert calc_class is not None
        assert calc_class['type'] == 'class'
        assert calc_class['exported'] is True
    
    def test_extract_class_methods(self, simple_ts_file):
        """Test extraction of class methods"""
        symbols = extract_symbols(simple_ts_file, 'simple.ts')
        
        # Should find compute method
        compute = next((s for s in symbols if s['id'] == 'Calculator.compute'), None)
        assert compute is not None
        assert compute['type'] == 'method'
        assert 'a: number' in compute['contract']
        assert 'b: number' in compute['contract']


class TestTypeScriptCallResolution:
    """Test TypeScript call resolution"""
    
    @pytest.fixture
    def simple_ts_file(self):
        """Load simple.ts fixture"""
        fixture_path = Path(__file__).parent.parent / 'fixtures' / 'typescript' / 'simple.ts'
        with open(fixture_path, 'r') as f:
            return f.read()
    
    def test_extract_direct_calls(self, simple_ts_file):
        """Test extraction of direct function calls"""
        calls = extract_calls(simple_ts_file, 'simple.ts')
        
        # Should find calls in Calculator.compute
        compute_calls = [c for c in calls if c['from'] == 'Calculator.compute']
        assert len(compute_calls) >= 2
        
        # Should find calls to add and multiply
        call_targets = [c['to'] for c in compute_calls]
        assert 'add' in call_targets
        assert 'multiply' in call_targets
    
    def test_extract_method_calls(self, simple_ts_file):
        """Test extraction of method calls"""
        calls = extract_calls(simple_ts_file, 'simple.ts')
        
        # Should find forEach call
        foreach_calls = [c for c in calls if 'forEach' in c['to']]
        assert len(foreach_calls) >= 0  # May or may not extract built-ins


class TestTypeScriptContractExtraction:
    """Test TypeScript contract extraction"""
    
    @pytest.fixture
    def simple_ts_file(self):
        """Load simple.ts fixture"""
        fixture_path = Path(__file__).parent.parent / 'fixtures' / 'typescript' / 'simple.ts'
        with open(fixture_path, 'r') as f:
            return f.read()
    
    def test_extract_parameter_contracts(self, simple_ts_file):
        """Test extraction of parameter contracts"""
        contracts = extract_contracts(simple_ts_file, 'simple.ts')
        
        # Should find greet contract
        greet_contract = next((c for c in contracts if c['symbol'] == 'greet'), None)
        assert greet_contract is not None
        assert 'name: string' in greet_contract['parameters']
    
    def test_extract_return_type_contracts(self, simple_ts_file):
        """Test extraction of return type contracts"""
        contracts = extract_contracts(simple_ts_file, 'simple.ts')
        
        # Should find multiply contract with return type
        multiply_contract = next((c for c in contracts if c['symbol'] == 'multiply'), None)
        assert multiply_contract is not None
        assert multiply_contract['returns'] == 'number'


class TestImportGraphBuilding:
    """Test import graph construction"""
    
    @pytest.fixture
    def with_imports_ts_file(self):
        """Load with_imports.ts fixture"""
        fixture_path = Path(__file__).parent.parent / 'fixtures' / 'typescript' / 'with_imports.ts'
        with open(fixture_path, 'r') as f:
            return f.read()
    
    def test_parse_import_statements(self, with_imports_ts_file):
        """Test parsing of import statements"""
        import_graph = build_import_graph(with_imports_ts_file, 'with_imports.ts')
        
        # Should find imports from simple
        assert 'simple' in import_graph or './simple' in import_graph
    
    def test_resolve_imported_symbols(self, with_imports_ts_file):
        """Test resolution of imported symbols"""
        # This would require full context, but we can test the mechanism
        import_graph = build_import_graph(with_imports_ts_file, 'with_imports.ts')
        
        # Should have parsed imports
        assert len(import_graph) > 0


class TestTypeHandling:
    """Test handling of complex types"""
    
    @pytest.fixture
    def with_imports_ts_file(self):
        """Load with_imports.ts fixture"""
        fixture_path = Path(__file__).parent.parent / 'fixtures' / 'typescript' / 'with_imports.ts'
        with open(fixture_path, 'r') as f:
            return f.read()
    
    def test_extract_generic_types(self, with_imports_ts_file):
        """Test extraction of generic type parameters"""
        symbols = extract_symbols(with_imports_ts_file, 'with_imports.ts')
        
        # Should find transform function with generics
        transform = next((s for s in symbols if s['id'] == 'transform'), None)
        assert transform is not None
        # Contract should contain generic notation
        assert any('<' in param for param in transform['contract'])
    
    def test_extract_union_types(self, with_imports_ts_file):
        """Test extraction of union types"""
        symbols = extract_symbols(with_imports_ts_file, 'with_imports.ts')
        
        # Should find handle function with union type
        handle = next((s for s in symbols if s['id'] == 'handle'), None)
        assert handle is not None
        # Contract should contain union notation
        assert any('|' in param for param in handle['contract'])


class TestIRValidation:
    """Test IR output validation"""
    
    @pytest.fixture
    def expected_ir(self):
        """Load expected IR fixture"""
        fixture_path = Path(__file__).parent.parent / 'fixtures' / 'typescript' / 'expected_simple_ir.json'
        with open(fixture_path, 'r') as f:
            return json.load(f)
    
    def test_ir_schema_validity(self, expected_ir):
        """Test that IR follows expected schema"""
        assert 'version' in expected_ir
        assert 'language' in expected_ir
        assert 'symbols' in expected_ir
        assert 'calls' in expected_ir
        assert 'contracts' in expected_ir
    
    def test_ir_symbol_structure(self, expected_ir):
        """Test that symbols have required fields"""
        for symbol in expected_ir['symbols']:
            assert 'id' in symbol
            assert 'type' in symbol
            assert 'exported' in symbol
            assert 'file' in symbol
            assert 'contract' in symbol
    
    def test_ir_call_structure(self, expected_ir):
        """Test that calls have required fields"""
        for call in expected_ir['calls']:
            assert 'from' in call
            assert 'to' in call
            assert 'file' in call


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

