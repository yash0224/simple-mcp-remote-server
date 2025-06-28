const { Server } = require('@modelcontextprotocol/sdk/server');
const { HttpServerTransport } = require('@modelcontextprotocol/sdk/server/http.js');
const express = require('express');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'Simple MCP Server',
    tools: ['calculator', 'text_analyzer'],
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/',
      mcp: '/mcp'
    }
  });
});

const server = new Server(
  {
    name: 'simple-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// MCP Tool listing
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'calculator',
        description: 'Perform mathematical calculations using Python',
        inputSchema: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "sin(pi/2)")',
            },
          },
          required: ['expression'],
        },
      },
      {
        name: 'text_analyzer',
        description: 'Analyze text using Python (word count, character count, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to analyze',
            },
            analysis_type: {
              type: 'string',
              enum: ['basic', 'detailed'],
              description: 'Type of analysis to perform',
              default: 'basic',
            },
          },
          required: ['text'],
        },
      },
    ],
  };
});

// MCP Tool executor
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'calculator':
        return await executeCalculator(args.expression);
      case 'text_analyzer':
        return await executeTextAnalyzer(args.text, args.analysis_type || 'basic');
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error executing tool ${name}: ${error.message}` }],
      isError: true,
    };
  }
});

async function executeCalculator(expression) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, 'python_scripts'),
      args: [expression]
    };

    PythonShell.run('calculator.py', options, (err, results) => {
      if (err) return reject(err);
      const result = results ? results[0] : 'No result';
      resolve({
        content: [{ type: 'text', text: `Calculation: ${expression} = ${result}` }]
      });
    });
  });
}

async function executeTextAnalyzer(text, analysisType) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, 'python_scripts'),
      args: [text, analysisType]
    };

    PythonShell.run('text_analyzer.py', options, (err, results) => {
      if (err) return reject(err);
      const result = results ? results.join('\n') : 'No result';
      resolve({
        content: [{ type: 'text', text: `Text Analysis Results:\n${result}` }]
      });
    });
  });
}

const transport = new HttpServerTransport(app, '/mcp');
server.connect(transport);

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
