#!/usr/bin/env python3
"""
CadQuery script to emboss/engrave Daniel's artwork onto Kevin's battery box
Based on Option B from artwork-transfer-automation.md
"""
import cadquery as cq
from math import isclose
import os
import sys
from config import *

def largest_vertical_face(shape: cq.Shape):
    """
    Find the largest vertical planar face to place the artwork
    Vertical means normal is roughly horizontal (Z near 0)
    """
    faces = list(shape.faces().vals())
    best = None
    best_area = 0.0
    
    print(f"Analyzing {len(faces)} faces...")
    
    for i, f in enumerate(faces):
        try:
            pl = f.toPln()  # Get plane (fails if not planar)
        except Exception:
            continue
            
        n = pl.zDir  # face normal
        area = f.Area()
        
        # Check if vertical (normal is roughly horizontal, Z near 0)
        is_vertical = isclose(abs(n.z), 0.0, abs_tol=1e-3)
        
        print(f"Face {i}: Area={area:.2f}, Normal=({n.x:.3f}, {n.y:.3f}, {n.z:.3f}), Vertical={is_vertical}")
        
        if is_vertical and area > best_area:
            best, best_area = f, area
            print(f"  -> New best vertical face! Area={area:.2f}")
    
    return best

def load_artwork(art_file):
    """Load artwork from SVG or DXF file"""
    print(f"Loading artwork from: {art_file}")
    
    if not os.path.exists(art_file):
        print(f"❌ Artwork file not found: {art_file}")
        return None
    
    try:
        if art_file.lower().endswith(".svg"):
            art = cq.importers.importSVG(art_file)
        else:
            # DXF: returns wires on XY plane
            art = cq.importers.importDXF(art_file)
        
        print(f"✅ Artwork loaded successfully")
        return art
        
    except Exception as e:
        print(f"❌ Error loading artwork: {e}")
        return None

def extract_wires_from_artwork(art):
    """Extract wires from the imported artwork"""
    wires = []
    
    # Handle both single objects and lists
    art_objects = art if isinstance(art, list) else [art]
    
    for obj in art_objects:
        try:
            # Try to get wires from the object
            obj_wires = obj.wires().vals()
            wires.extend(obj_wires)
            print(f"Found {len(obj_wires)} wires in artwork object")
        except Exception as e:
            print(f"Could not extract wires from object: {e}")
            # Try to get edges instead
            try:
                edges = obj.edges().vals()
                print(f"Found {len(edges)} edges instead")
                # Convert edges to wires if possible
                for edge in edges:
                    try:
                        wire = cq.Wire.assembleEdges([edge])
                        wires.append(wire)
                    except:
                        pass
            except:
                pass
    
    if not wires:
        print("❌ No wires found in the artwork file. Ensure paths are outlines, not images.")
        return None
    
    print(f"✅ Extracted {len(wires)} wires from artwork")
    return wires

def apply_artwork_to_face(target_shape, face, wires, scale, offset_x, offset_y, depth):
    """Apply the artwork wires to the specified face"""
    print("Creating workplane on target face...")
    
    # Create a workplane on the target face
    wp = cq.Workplane(obj=target_shape).workplane(offset=0, centerOption="CenterOfBoundBox", origin=face)
    
    # Create compound of wires
    compound = cq.Compound.makeCompound(wires)
    
    # Get bounding box to scale and center
    bb = compound.BoundingBox()
    print(f"Artwork bounding box: X={bb.xmin:.2f} to {bb.xmax:.2f}, Y={bb.ymin:.2f} to {bb.ymax:.2f}")
    
    # Center the artwork
    cx = (bb.xmax + bb.xmin) / 2.0
    cy = (bb.ymax + bb.ymin) / 2.0
    cz = (bb.zmax + bb.zmin) / 2.0
    
    # Transform the artwork: center, scale, and offset
    transformed_compound = (compound.translate((-cx, -cy, -cz))
                           .scale(scale, scale, 1.0)
                           .translate((offset_x, offset_y, 0)))
    
    # Add the artwork to the workplane
    proj = wp.add(transformed_compound)
    
    # Apply cut (engrave) or add (emboss)
    if depth < 0:
        print(f"Engraving artwork with depth {depth}mm...")
        result = proj.cutBlind(depth)  # negative = into the face
    else:
        print(f"Embossing artwork with height {depth}mm...")
        result = proj.extrude(depth)  # positive = raised logo
    
    return result

def main():
    print("=== CadQuery Artwork Transfer Tool ===")
    if VERBOSE_OUTPUT:
        print_config()

    print(f"Target: {KEVIN_STEP}")
    print(f"Artwork: {ARTWORK_FILE}")
    print(f"Depth: {ENGRAVE_DEPTH_MM}mm")
    print(f"Scale: {ART_SCALE}")
    print(f"Offset: ({OFFSET_X}, {OFFSET_Y})")
    print()

    # Check if files exist
    if not os.path.exists(KEVIN_STEP):
        print(f"❌ Kevin's STEP file not found: {KEVIN_STEP}")
        return 1

    if not os.path.exists(ARTWORK_FILE):
        print(f"❌ Artwork file not found: {ARTWORK_FILE}")
        print("Please run extract_artwork.py first to create the artwork file.")
        return 1
    
    try:
        # Load target (Kevin's box)
        print("Loading Kevin's battery box...")
        target = cq.importers.importStep(KEVIN_STEP)
        print("✅ Kevin's box loaded successfully")
        
        # Find the largest vertical face
        print("\nFinding largest vertical face...")
        face = largest_vertical_face(target)
        
        if face is None:
            print("❌ No suitable vertical planar face found to place artwork.")
            return 1
        
        print(f"✅ Found target face with area: {face.Area():.2f}")
        
        # Load artwork
        print("\nLoading artwork...")
        art = load_artwork(ARTWORK_FILE)
        if art is None:
            return 1

        # Extract wires from artwork
        wires = extract_wires_from_artwork(art)
        if wires is None:
            return 1

        # Apply artwork to the face
        print("\nApplying artwork to face...")
        result = apply_artwork_to_face(target, face, wires, ART_SCALE, OFFSET_X, OFFSET_Y, ENGRAVE_DEPTH_MM)

        # Export the result
        print(f"\nExporting result to: {OUTPUT_FILE}")
        cq.exporters.export(result, OUTPUT_FILE)
        print(f"✅ Success! Wrote: {OUTPUT_FILE}")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
