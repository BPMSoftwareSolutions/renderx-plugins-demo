#!/usr/bin/env python3
"""
Configuration file for the artwork transfer automation
Adjust these parameters to customize the artwork application
"""

# File paths
KEVIN_STEP = r"Battery Boxes\Kevin's Battery Box.step"
DANIEL_STEP = r"Battery Boxes\Daniels Battery Box.step"
ARTWORK_FILE = "daniel_artwork.dxf"  # Generated artwork file
OUTPUT_FILE = "Kevins_Box_with_Daniels_Artwork.step"

# Artwork application parameters
ENGRAVE_DEPTH_MM = -0.6  # negative cuts in, positive embosses out
                         # Try values like:
                         # -0.6 for shallow engraving
                         # -1.0 for deeper engraving
                         # +0.5 for raised embossing
                         # +1.0 for higher embossing

ART_SCALE = 1.0  # Scale factor for artwork size
                 # 1.0 = original size
                 # 0.5 = half size
                 # 2.0 = double size

# Position offsets on the target face (in mm)
OFFSET_X = 0.0  # Horizontal offset
OFFSET_Y = 0.0  # Vertical offset

# Face selection preferences
# If you want to target a specific face orientation, adjust these:
PREFER_FRONT_FACE = True   # Prefer faces facing +Y direction
PREFER_BACK_FACE = False   # Prefer faces facing -Y direction
PREFER_LEFT_FACE = False   # Prefer faces facing -X direction
PREFER_RIGHT_FACE = False  # Prefer faces facing +X direction

# Minimum face area to consider (in square mm)
MIN_FACE_AREA = 100.0

# Tolerance for determining if a face is vertical
VERTICAL_TOLERANCE = 1e-3

# Debug options
VERBOSE_OUTPUT = True      # Print detailed information during processing
SAVE_INTERMEDIATE = False  # Save intermediate files for debugging

# Export options
EXPORT_FORMATS = ["step"]  # Can include: "step", "stl", "obj"

def print_config():
    """Print current configuration"""
    print("=== Current Configuration ===")
    print(f"Kevin's STEP file: {KEVIN_STEP}")
    print(f"Daniel's STEP file: {DANIEL_STEP}")
    print(f"Artwork file: {ARTWORK_FILE}")
    print(f"Output file: {OUTPUT_FILE}")
    print(f"Engrave depth: {ENGRAVE_DEPTH_MM}mm")
    print(f"Art scale: {ART_SCALE}")
    print(f"Offset: ({OFFSET_X}, {OFFSET_Y})")
    print(f"Verbose output: {VERBOSE_OUTPUT}")
    print("=" * 30)

if __name__ == "__main__":
    print_config()
