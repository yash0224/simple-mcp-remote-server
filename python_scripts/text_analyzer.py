import sys

text = sys.argv[1]
analysis_type = sys.argv[2]

if analysis_type == "basic":
    words = len(text.split())
    chars = len(text)
    print(f"Word count: {words}")
    print(f"Character count: {chars}")
elif analysis_type == "detailed":
    from collections import Counter
    word_freq = Counter(text.split())
    for word, count in word_freq.items():
        print(f"{word}: {count}")
else:
    print("Unknown analysis type")
