#!/usr/bin/env python3
"""
Simplified artwork transfer script that focuses on core functionality
"""
import cadquery as cq
import sys
import os
from math import isclose

def create_test_artwork():
    """Create a simple test artwork pattern"""
    print("Creating test artwork...")
    
    # Create a simple logo-like pattern
    artwork = (cq.Workplane("XY")
               .rect(40, 25)  # Outer rectangle
               .rect(25, 15)  # Inner rectangle (will be subtracted)
               .extrude(0.1)  # Very thin extrusion
               .faces(">Z")
               .workplane()
               .rect(25, 15)
               .cutThruAll()  # Cut out inner rectangle
               .faces(">Z")
               .workplane()
               .circle(3)  # Small circle
               .cutThruAll())
    
    # Get the outline edges from the top face
    top_face = artwork.faces(">Z").val()
    
    # Create a 2D profile from the edges
    profile = cq.Workplane("XY")
    for edge in top_face.Edges():
        profile = profile.add(edge)
    
    return profile

def find_best_face(shape):
    """Find the best face for artwork application"""
    print("Analyzing faces...")

    faces = shape.faces().vals()
    print(f"Total faces: {len(faces)}")

    face_candidates = []

    for i, face in enumerate(faces):
        area = face.Area()

        # Try to get plane info, but don't fail if it's not planar
        try:
            plane = face.toPln()
            normal = plane.zDir
            is_planar = True
        except:
            # If not planar, we can still work with it
            is_planar = False
            normal = None

        face_info = {
            'index': i,
            'face': face,
            'area': area,
            'is_planar': is_planar,
            'normal': normal
        }

        face_candidates.append(face_info)

        # Show info for larger faces
        if area > 50:
            if is_planar and normal:
                orientation = "vertical" if abs(normal.z) < 0.3 else ("horizontal" if abs(normal.z) > 0.7 else "angled")
                print(f"Face {i}: area={area:.1f}, planar, normal=({normal.x:.2f}, {normal.y:.2f}, {normal.z:.2f}), {orientation}")
            else:
                print(f"Face {i}: area={area:.1f}, non-planar or complex")

    # Sort by area (largest first)
    face_candidates.sort(key=lambda x: x['area'], reverse=True)

    # First try to find a large planar vertical face
    for face_info in face_candidates:
        if (face_info['is_planar'] and face_info['normal'] and
            abs(face_info['normal'].z) < 0.3 and face_info['area'] > 100):
            print(f"Selected vertical planar face {face_info['index']} with area: {face_info['area']:.1f}")
            return face_info['face']

    # Then try any large planar face
    for face_info in face_candidates:
        if face_info['is_planar'] and face_info['area'] > 100:
            print(f"Selected planar face {face_info['index']} with area: {face_info['area']:.1f}")
            return face_info['face']

    # Finally, just use the largest face regardless
    if face_candidates:
        best = face_candidates[0]
        print(f"Selected largest face {best['index']} with area: {best['area']:.1f} (may not be planar)")
        return best['face']

    print("No suitable face found")
    return None

def apply_simple_artwork(target_shape, face, depth=-0.5):
    """Apply simple artwork to the target face"""
    print(f"Applying artwork with depth: {depth}mm")

    try:
        # Get the center of the face for positioning
        center = face.Center()
        print(f"Face center: ({center.x:.1f}, {center.y:.1f}, {center.z:.1f})")

        # Create a simple rectangular artwork shape as a separate solid
        print("Creating artwork shape...")
        artwork_solid = (cq.Workplane("XY")
                        .center(center.x, center.y)
                        .rect(20, 12)
                        .extrude(abs(depth) + 5))  # Make it thick enough to cut through

        # Position the artwork at the right Z level
        if center.z != 0:
            artwork_solid = artwork_solid.translate((0, 0, center.z - abs(depth)/2))

        if depth < 0:
            # Engrave (cut from the target)
            print("Cutting artwork from target...")
            result = target_shape.cut(artwork_solid)
        else:
            # Emboss (add to the target)
            print("Adding artwork to target...")
            result = target_shape.union(artwork_solid)

        print("✅ Artwork applied successfully")
        return result

    except Exception as e:
        print(f"Error applying artwork: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    print("=== Simplified Artwork Transfer ===")
    
    kevin_file = r"Battery Boxes\Kevin's Battery Box.step"
    output_file = "Kevins_Box_with_Simple_Artwork.step"
    
    # Check if Kevin's file exists
    if not os.path.exists(kevin_file):
        print(f"❌ Kevin's STEP file not found: {kevin_file}")
        return 1
    
    try:
        # Load Kevin's battery box
        print("Loading Kevin's battery box...")
        target = cq.importers.importStep(kevin_file)
        print("✅ Loaded successfully")
        
        # Find the best face for artwork
        face = find_best_face(target)
        if not face:
            print("❌ No suitable face found")
            return 1
        
        # Apply simple artwork
        result = apply_simple_artwork(target, face, depth=-0.6)
        if not result:
            print("❌ Failed to apply artwork")
            return 1
        
        # Export the result
        print(f"Exporting to: {output_file}")
        cq.exporters.export(result, output_file)
        
        # Check if file was created
        if os.path.exists(output_file):
            size_kb = os.path.getsize(output_file) / 1024
            print(f"✅ Success! Created {output_file} ({size_kb:.1f} KB)")
            return 0
        else:
            print("❌ Output file was not created")
            return 1
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
