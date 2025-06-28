import sys
text = sys.argv[1]
analysis = sys.argv[2] if len(sys.argv) > 2 else "basic"
print(f"Characters: {len(text)}\nWords: {len(text.split())}")
