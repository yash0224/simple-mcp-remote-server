const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const express = require('express');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
require('dotenv').config();

// Create Express app for health checks and web interface
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

// MCP endpoint for remote access
app.all('/mcp', async (req, res) => {
  try {
    // Handle MCP protocol over HTTP
    const mcpRequest = req.body;
    
    if (mcpRequest.method === 'tools/list') {
      const response = {
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
      res.json(response);
    } else if (mcpRequest.method === 'tools/call') {
      const { name, arguments: args } = mcpRequest.params;
      let result;

      try {
        switch (name) {
          case 'calculator':
            result = await executeCalculator(args.expression);
            break;
          
          case 'text_analyzer':
            result = await executeTextAnalyzer(args.text, args.analysis_type || 'basic');
            break;
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        res.json(result);
      } catch (error) {
        res.json({
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error.message}`,
            },
          ],
          isError: true,
        });
      }
    } else {
      res.status(400).json({ error: 'Unsupported MCP method' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCP Server setup
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

// Tool 1: Calculator using Python
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

// Tool implementation
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
      content: [
        {
          type: 'text',
          text: `Error executing tool ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Calculator function using Python
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
      if (err) {
        reject(err);
      } else {
        const result = results ? results[0] : 'No result';
        resolve({
          content: [
            {
              type: 'text',
              text: `Calculation: ${expression} = ${result}`,
            },
          ],
        });
      }
    });
  });
}

// Text analyzer function using Python
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
      if (err) {
        reject(err);
      } else {
        const result = results ? results.join('\n') : 'No result';
        resolve({
          content: [
            {
              type: 'text',
              text: `Text Analysis Results:\n${result}`,
            },
          ],
        });
      }
    });
  });
}

// Start Express server
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}`);
  console.log(`MCP endpoint available at: http://localhost:${PORT}/mcp`);
});

// Start MCP server with stdio transport (for local development)
async function main() {
  if (process.env.NODE_ENV !== 'production') {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('MCP Server connected via stdio');
  }
}

// Start the server
if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}