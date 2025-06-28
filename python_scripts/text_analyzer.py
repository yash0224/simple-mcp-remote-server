import sys

if __name__ == "__main__":
    text = sys.argv[1]
    analysis_type = sys.argv[2] if len(sys.argv) > 2 else "basic"

    if analysis_type == "basic":
        print(f"Words: {len(text.split())}")
        print(f"Characters: {len(text)}")
    elif analysis_type == "detailed":
        from collections import Counter
        print(f"Words: {len(text.split())}")
        print(f"Characters: {len(text)}")
        print("Letter Frequency:")
        freq = Counter(text.replace(" ", ""))
        for k, v in freq.items():
            print(f"{k}: {v}")