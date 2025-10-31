#!/usr/bin/env python3
"""
Simple test to verify CadQuery basic functionality
"""
import cadquery as cq
import sys

def test_basic_cadquery():
    """Test basic CadQuery operations"""
    print("Testing basic CadQuery operations...")
    
    try:
        # Create a simple box
        box = cq.Workplane("XY").box(10, 10, 10)
        print("✅ Basic box creation works")
        
        # Test DXF export with a simple 2D shape
        simple_2d = cq.Workplane("XY").rect(20, 10).extrude(1)
        
        # Get the top face and its edges
        top_face = simple_2d.faces(">Z").val()
        edges = top_face.Edges()
        
        print(f"✅ Face operations work - found {len(edges)} edges")
        
        # Create a simple 2D profile for DXF export
        profile = cq.Workplane("XY").rect(30, 20)
        
        # Export to DXF
        cq.exporters.exportDXF(profile, "test_simple.dxf")
        print("✅ DXF export works")
        
        return True
        
    except Exception as e:
        print(f"❌ Basic CadQuery test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_step_import():
    """Test STEP file import"""
    print("\nTesting STEP file import...")
    
    kevin_file = r"Battery Boxes\Kevin's Battery Box.step"
    
    try:
        shape = cq.importers.importStep(kevin_file)
        print("✅ STEP import works")
        
        # Get basic info
        bb = shape.val().BoundingBox()
        print(f"Bounding box: {bb.xmax - bb.xmin:.1f} x {bb.ymax - bb.ymin:.1f} x {bb.zmax - bb.zmin:.1f}")
        
        faces = shape.faces().vals()
        print(f"Number of faces: {len(faces)}")
        
        return True
        
    except Exception as e:
        print(f"❌ STEP import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=== CadQuery Functionality Test ===")
    
    basic_ok = test_basic_cadquery()
    step_ok = test_step_import()
    
    if basic_ok and step_ok:
        print("\n✅ All tests passed! CadQuery is working correctly.")
        return 0
    else:
        print("\n❌ Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
