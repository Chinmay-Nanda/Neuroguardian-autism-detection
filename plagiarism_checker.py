import os
from difflib import SequenceMatcher

def read_file(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def compare_files(file1, file2):
    c1 = read_file(file1)
    c2 = read_file(file2)
    return SequenceMatcher(None, c1, c2).ratio()

# Gather files recursively
project_dir = os.getcwd()
files = []
for root, _, filenames in os.walk(project_dir):
    for name in filenames:
        if name.endswith(('.js', '.html', '.css')):
            files.append(os.path.join(root, name))

print("\n📝 Plagiarism Report (Showing only > 20% Similarity):\n")

found = False  # To check if anything is printed

for i in range(len(files)):
    for j in range(i+1, len(files)):
        sim = compare_files(files[i], files[j]) * 100
        if sim > 20.0:  # Only show if similarity is more than 20%
            found = True
            print(f"🔎 {os.path.relpath(files[i], project_dir)} ↔ {os.path.relpath(files[j], project_dir)}  →  {sim:.2f}% similarity")

if not found:
    print("✅ No significant plagiarism detected among your files!")

