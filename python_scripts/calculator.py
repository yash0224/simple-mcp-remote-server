#!/usr/bin/env python3
import sys
import math
import re

def safe_eval(expression):
    """Safely evaluate mathematical expressions"""
    
    # Remove any potentially dangerous characters/functions
    dangerous_patterns = [
        r'import\s+', r'exec\s*\(', r'eval\s*\(', r'open\s*\(',
        r'__', r'quit', r'exit', r'help'
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, expression, re.IGNORECASE):
            raise ValueError("Potentially unsafe expression detected")
    
    # Replace common math functions
    expression = expression.replace('^', '**')  # Handle ^ as power
    
    # Define safe functions and constants
    safe_dict = {
        "__builtins__": {},
        "abs": abs,
        "round": round,
        "min": min,
        "max": max,
        "sum": sum,
        "pow": pow,
        "sqrt": math.sqrt,
        "sin": math.sin,
        "cos": math.cos,
        "tan": math.tan,
        "asin": math.asin,
        "acos": math.acos,
        "atan": math.atan,
        "log": math.log,
        "log10": math.log10,
        "exp": math.exp,
        "pi": math.pi,
        "e": math.e,
        "ceil": math.ceil,
        "floor": math.floor,
        "factorial": math.factorial
    }
    
    try:
        result = eval(expression, safe_dict)
        return result
    except Exception as e:
        raise ValueError(f"Error evaluating expression: {str(e)}")

def main():
    if len(sys.argv) != 2:
        print("Error: Please provide a mathematical expression")
        sys.exit(1)
    
    expression = sys.argv[1]
    
    try:
        result = safe_eval(expression)
        print(f"{result}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()