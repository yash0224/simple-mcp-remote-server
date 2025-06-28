# Simple MCP Server

A Model Context Protocol (MCP) server with Python SDK integration, featuring two tools: a calculator and text analyzer.

## Tools

1. **Calculator** - Perform mathematical calculations using Python
   - Supports basic arithmetic, trigonometric functions, logarithms, etc.
   - Safe evaluation with restricted function access

2. **Text Analyzer** - Analyze text content
   - Basic analysis: word count, character count, sentences, paragraphs
   - Detailed analysis: unique words, word frequency, reading time estimation

## Deployment on Railway

### Prerequisites
- GitHub account
- Railway account connected to GitHub

### Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to [Railway](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the Dockerfile and deploy

3. **Get your deployment URL:**
   - After deployment, Railway will provide a URL like: `https://your-app-name.up.railway.app`

### Using with Claude MCP

Once deployed, add this to your Claude MCP configuration:

```json
{
    "mcpServers": {
        "simple-mcp": {
            "command": "npx",
            "args": ["mcp-remote", "https://your-app-name.up.railway.app/mcp"]
        }
    }
}
```

Replace `your-app-name.up.railway.app` with your actual Railway deployment URL.

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Python dependencies:**
   Make sure you have Python 3 installed on your system.

3. **Run the server:**
   ```bash
   npm start
   ```

4. **Health check:**
   Visit `http://localhost:3000` to see if the server is running.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Project Structure

```
.
├── index.js                 # Main MCP server
├── python_scripts/
│   ├── calculator.py        # Calculator tool
│   └── text_analyzer.py     # Text analyzer tool
├── package.json
├── Dockerfile
├── .env.example
└── README.md
```

## Tool Usage Examples

### Calculator
- Input: `2 + 2`
- Output: `4`

- Input: `sqrt(16) + sin(pi/2)`
- Output: `5.0`

### Text Analyzer
- Input: `"Hello world! This is a test."`
- Basic analysis: word count, character count, sentences
- Detailed analysis: includes word frequency, reading time

## License

MIT