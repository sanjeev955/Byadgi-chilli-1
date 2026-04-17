import os
from collections import Counter

def count_images(directory):
    counts = Counter()
    for class_dir in os.listdir(directory):
        class_path = os.path.join(directory, class_dir)
        if os.path.isdir(class_path):
            images = [f for f in os.listdir(class_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            counts[class_dir] = len(images)
    return counts

print('Train:')
print(count_images('dataset/train'))
print('Test:')
print(count_images('dataset/test'))

