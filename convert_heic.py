import os
from PIL import Image
import pillow_heif  # Install: py -m pip install pillow-heif

pillow_heif.register_heif_opener()

dataset_path = './dataset'

print("Scanning dataset for HEIC/HEIC files...")

converted = 0
deleted = 0

for root, dirs, files in os.walk(dataset_path):
    for file in files:
        if file.lower().endswith(('.heic', '.HEIC')):
            heic_path = os.path.join(root, file)
            jpg_path = heic_path[:-5] + '.jpg'
            
            try:
                image = Image.open(heic_path)
                image.convert("RGB").save(jpg_path, "JPEG", quality=95)
                print(f"Converted: {jpg_path}")
                converted += 1
                
                # Delete HEIC
                os.remove(heic_path)
                print(f"Deleted: {heic_path}")
                deleted += 1
                
            except Exception as e:
                print(f"Error {file}: {e}")

print(f"Complete! Converted {converted} files, deleted {deleted} HEIC files.")
