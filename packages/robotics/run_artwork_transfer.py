#!/usr/bin/env python3
"""
Master script to run the complete artwork transfer process
This script orchestrates the entire workflow:
1. Extract artwork from Daniel's STEP file
2. Apply artwork to Kevin's battery box
3. Generate the final result
"""
import os
import sys
import subprocess
from config import *

def run_script(script_name, description):
    """Run a Python script and handle errors"""
    print(f"\n{'='*50}")
    print(f"STEP: {description}")
    print(f"Running: {script_name}")
    print('='*50)
    
    try:
        # Run the script
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=False, 
                              text=True, 
                              cwd=os.getcwd())
        
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed with return code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running {script_name}: {e}")
        return False

def check_prerequisites():
    """Check if all required files and dependencies are available"""
    print("=== Checking Prerequisites ===")
    
    # Check if CadQuery is available
    try:
        import cadquery as cq
        print(f"✅ CadQuery {cq.__version__} is available")
    except ImportError:
        print("❌ CadQuery not found. Please install with: pip install cadquery")
        return False
    
    # Check if Kevin's STEP file exists
    if os.path.exists(KEVIN_STEP):
        print(f"✅ Kevin's STEP file found: {KEVIN_STEP}")
    else:
        print(f"❌ Kevin's STEP file not found: {KEVIN_STEP}")
        return False
    
    # Check if Daniel's STEP file exists (optional for test mode)
    if os.path.exists(DANIEL_STEP):
        print(f"✅ Daniel's STEP file found: {DANIEL_STEP}")
    else:
        print(f"⚠️  Daniel's STEP file not found: {DANIEL_STEP}")
        print("   Will create test artwork instead")
    
    return True

def main():
    print("=== Artwork Transfer Automation ===")
    print("This script will transfer Daniel's artwork to Kevin's battery box")
    print()
    
    # Show current configuration
    if VERBOSE_OUTPUT:
        print_config()
        print()
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites not met. Please fix the issues above.")
        return 1
    
    print("\n🚀 Starting artwork transfer process...")
    
    # Step 1: Extract artwork from Daniel's STEP file
    success = run_script("extract_artwork.py", "Extract artwork from Daniel's STEP file")
    if not success:
        print("\n❌ Artwork extraction failed. Cannot continue.")
        return 1
    
    # Check if artwork file was created
    if not os.path.exists(ARTWORK_FILE):
        print(f"\n❌ Artwork file not created: {ARTWORK_FILE}")
        return 1
    
    print(f"\n✅ Artwork file created: {ARTWORK_FILE}")
    
    # Step 2: Apply artwork to Kevin's battery box
    success = run_script("apply_artwork.py", "Apply artwork to Kevin's battery box")
    if not success:
        print("\n❌ Artwork application failed.")
        return 1
    
    # Check if output file was created
    if not os.path.exists(OUTPUT_FILE):
        print(f"\n❌ Output file not created: {OUTPUT_FILE}")
        return 1
    
    print(f"\n🎉 SUCCESS! Artwork transfer completed!")
    print(f"📁 Output file: {OUTPUT_FILE}")
    print(f"📊 File size: {os.path.getsize(OUTPUT_FILE) / 1024:.1f} KB")
    
    # Provide next steps
    print("\n📋 Next Steps:")
    print(f"1. Open {OUTPUT_FILE} in your CAD software to review the result")
    print("2. If the artwork needs adjustment, modify config.py and run again")
    print("3. Consider adjusting ENGRAVE_DEPTH_MM, ART_SCALE, or OFFSET values")
    
    return 0

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
