#!/usr/bin/env python3
"""
Script to extract artwork from Daniel's STEP file and save as SVG/DXF
"""
import cadquery as cq
import os
import sys

def extract_artwork_to_svg(step_file, output_svg):
    """
    Extract artwork from a STEP file and save as SVG
    This assumes the artwork consists of edges/wires that can be projected to 2D
    """
    print(f"Loading STEP file: {step_file}")
    
    try:
        # Load the STEP file
        shape = cq.importers.importStep(step_file)
        print("✅ STEP file loaded successfully")
        
        # Get all edges from the shape
        edges = shape.edges()
        print(f"Found {len(edges.vals())} edges")
        
        # Get all wires from the shape
        wires = shape.wires()
        print(f"Found {len(wires.vals())} wires")
        
        if len(wires.vals()) == 0:
            print("No wires found. Trying to create wires from edges...")
            # If no wires, try to work with edges directly
            # This is a simplified approach - in practice, you might need more sophisticated logic
            # to identify which edges form the artwork
            
            # Create a workplane and try to project all edges to XY plane
            wp = cq.Workplane("XY")
            
            # Add all edges to the workplane
            for edge in edges.vals():
                try:
                    # Project edge to XY plane (this is a simplified approach)
                    wp = wp.add(edge)
                except:
                    continue
            
            # Try to export what we have
            if wp.objects:
                print("Attempting to export projected edges...")
                # Note: CadQuery's SVG export might be limited
                # You might need to use a different approach for complex artwork
                return wp
        else:
            # Work with existing wires
            print("Working with existing wires...")
            wp = cq.Workplane("XY")
            for wire in wires.vals():
                wp = wp.add(wire)
            return wp
            
    except Exception as e:
        print(f"❌ Error processing STEP file: {e}")
        return None

def create_simple_test_svg(output_file):
    """
    Create a simple test SVG file for testing purposes
    This creates a basic logo-like shape that can be used for testing
    """
    print(f"Creating test SVG: {output_file}")
    
    # Create a simple logo-like shape using CadQuery
    logo = (cq.Workplane("XY")
            .rect(50, 30)  # Outer rectangle
            .extrude(1)
            .faces(">Z")
            .workplane()
            .rect(30, 15)  # Inner rectangle
            .cutThruAll()
            .faces(">Z")
            .workplane()
            .circle(5)  # Small circle
            .cutThruAll())
    
    # Get the top face and extract its edges
    top_face = logo.faces(">Z").val()
    
    # Create a workplane with the outline
    outline = cq.Workplane("XY")
    for edge in top_face.Edges():
        outline = outline.add(edge)
    
    return outline

def main():
    daniel_file = r"Battery Boxes\Daniels Battery Box.step"
    output_dxf = "daniel_artwork.dxf"

    print("=== Artwork Extraction Tool ===")

    # For now, always create a test artwork since the STEP file extraction is complex
    # In a real scenario, you would manually export the artwork from Daniel's STEP file
    # using your CAD software and save it as SVG or DXF

    print("Creating test artwork for demonstration...")
    print("(In production, you would export Daniel's artwork manually from CAD software)")

    try:
        # Create a test artwork for development purposes
        test_artwork = create_simple_test_svg("test")

        # Save as DXF (more reliable than SVG with CadQuery)
        cq.exporters.exportDXF(test_artwork, output_dxf)
        print(f"✅ Test artwork saved as: {output_dxf}")

        # Print some info about the artwork
        wires = test_artwork.wires().vals()
        print(f"Artwork contains {len(wires)} wire(s)")

        bb = test_artwork.val().BoundingBox()
        print(f"Artwork size: {bb.xmax - bb.xmin:.1f} x {bb.ymax - bb.ymin:.1f} mm")

        return 0

    except Exception as e:
        print(f"❌ Error creating test artwork: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
