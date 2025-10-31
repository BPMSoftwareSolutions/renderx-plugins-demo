#!/usr/bin/env python3
"""
Script to inspect the STEP files and understand their structure
"""
import cadquery as cq
import os

def inspect_step_file(filepath):
    """Inspect a STEP file and print basic information about it"""
    print(f"\n=== Inspecting: {filepath} ===")
    
    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        return None
    
    try:
        # Load the STEP file
        shape = cq.importers.importStep(filepath)
        
        # Get basic information
        print(f"Shape type: {type(shape)}")
        
        # Get bounding box
        bb = shape.val().BoundingBox()
        print(f"Bounding box:")
        print(f"  X: {bb.xmin:.2f} to {bb.xmax:.2f} (size: {bb.xmax - bb.xmin:.2f})")
        print(f"  Y: {bb.ymin:.2f} to {bb.ymax:.2f} (size: {bb.ymax - bb.ymin:.2f})")
        print(f"  Z: {bb.zmin:.2f} to {bb.zmax:.2f} (size: {bb.zmax - bb.zmin:.2f})")
        
        # Count faces
        faces = shape.faces()
        print(f"Number of faces: {len(faces.vals())}")
        
        # Look for planar faces and their orientations
        planar_faces = []
        for i, face in enumerate(faces.vals()):
            try:
                plane = face.toPln()
                normal = plane.zDir
                area = face.Area()
                planar_faces.append({
                    'index': i,
                    'normal': (normal.x, normal.y, normal.z),
                    'area': area
                })
            except:
                pass
        
        print(f"Number of planar faces: {len(planar_faces)}")
        
        # Find vertical faces (normal roughly horizontal)
        vertical_faces = []
        for face_info in planar_faces:
            normal = face_info['normal']
            if abs(normal[2]) < 0.1:  # Z component near 0 means vertical
                vertical_faces.append(face_info)
        
        print(f"Number of vertical planar faces: {len(vertical_faces)}")
        
        # Show the largest vertical faces
        if vertical_faces:
            vertical_faces.sort(key=lambda x: x['area'], reverse=True)
            print("Largest vertical faces:")
            for i, face_info in enumerate(vertical_faces[:5]):  # Show top 5
                normal = face_info['normal']
                print(f"  Face {face_info['index']}: Area={face_info['area']:.2f}, Normal=({normal[0]:.3f}, {normal[1]:.3f}, {normal[2]:.3f})")
        
        return shape
        
    except Exception as e:
        print(f"ERROR loading {filepath}: {e}")
        return None

def main():
    # Define file paths
    daniel_file = r"Battery Boxes\Daniels Battery Box.step"
    kevin_file = r"Battery Boxes\Kevin's Battery Box.step"
    
    # Inspect both files
    daniel_shape = inspect_step_file(daniel_file)
    kevin_shape = inspect_step_file(kevin_file)
    
    print("\n=== Summary ===")
    if daniel_shape:
        print("✅ Daniel's Battery Box loaded successfully")
    else:
        print("❌ Failed to load Daniel's Battery Box")
        
    if kevin_shape:
        print("✅ Kevin's Battery Box loaded successfully")
    else:
        print("❌ Failed to load Kevin's Battery Box")

if __name__ == "__main__":
    main()
