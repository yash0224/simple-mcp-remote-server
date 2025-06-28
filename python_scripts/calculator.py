import sys
from math import *

if __name__ == "__main__":
    expression = sys.argv[1]
    try:
        result = eval(expression)
        print(result)
    except Exception as e:
        print(f"Error: {str(e)}")