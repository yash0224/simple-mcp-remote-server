#!/usr/bin/env python3
import sys
import re
import string
from collections import Counter

def analyze_text(text, analysis_type='basic'):
    """Analyze text and return various statistics"""
    
    if not text:
        return {"error": "No text provided"}
    
    # Basic analysis
    word_count = len(text.split())
    char_count = len(text)
    char_count_no_spaces = len(text.replace(' ', ''))
    sentence_count = len([s for s in re.split(r'[.!?]+', text) if s.strip()])
    paragraph_count = len([p for p in text.split('\n\n') if p.strip()])
    
    # Remove punctuation for word analysis
    translator = str.maketrans('', '', string.punctuation)
    clean_text = text.translate(translator).lower()
    words = clean_text.split()
    
    results = []
    results.append(f"📊 Basic Statistics:")
    results.append(f"   Words: {word_count}")
    results.append(f"   Characters: {char_count}")
    results.append(f"   Characters (no spaces): {char_count_no_spaces}")
    results.append(f"   Sentences: {sentence_count}")
    results.append(f"   Paragraphs: {paragraph_count}")
    
    if analysis_type == 'detailed' and words:
        # Detailed analysis
        word_freq = Counter(words)
        most_common = word_freq.most_common(5)
        unique_words = len(set(words))
        avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
        
        results.append(f"\n🔍 Detailed Analysis:")
        results.append(f"   Unique words: {unique_words}")
        results.append(f"   Average word length: {avg_word_length:.2f}")
        results.append(f"   Most common words:")
        
        for word, count in most_common:
            if word:  # Skip empty strings
                results.append(f"     '{word}': {count} times")
        
        # Reading time estimation (average 200 words per minute)
        reading_time = word_count / 200
        if reading_time < 1:
            reading_time_str = f"{reading_time * 60:.0f} seconds"
        else:
            reading_time_str = f"{reading_time:.1f} minutes"
        
        results.append(f"   Estimated reading time: {reading_time_str}")
    
    return results

def main():
    if len(sys.argv) < 2:
        print("Error: Please provide text to analyze")
        sys.exit(1)
    
    text = sys.argv[1]
    analysis_type = sys.argv[2] if len(sys.argv) > 2 else 'basic'
    
    try:
        results = analyze_text(text, analysis_type)
        if isinstance(results, dict) and 'error' in results:
            print(f"Error: {results['error']}")
            sys.exit(1)
        else:
            for result in results:
                print(result)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()