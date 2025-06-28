const express = require('express');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    service: 'Simple Server',
    tools: ['calculator', 'text_analyzer'],
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/',
      tools: '/tools'
    }
  });
});

app.post('/tools', async (req, res) => {
  const { name, args } = req.body;
  try {
    let result;
    switch (name) {
      case 'calculator':
        result = await executeCalculator(args.expression);
        break;
      case 'text_analyzer':
        result = await executeTextAnalyzer(args.text, args.analysis_type || 'basic');
        break;
      default:
        throw new Error('Unknown tool');
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function executeCalculator(expression) {
  return new Promise((resolve, reject) => {
    PythonShell.run('calculator.py', {
      mode: 'text',
      pythonPath: 'python3',
      scriptPath: path.join(__dirname, 'python_scripts'),
      args: [expression]
    }, (err, results) => {
      if (err) reject(err);
      else resolve({ result: results[0] });
    });
  });
}

async function executeTextAnalyzer(text, analysisType) {
  return new Promise((resolve, reject) => {
    PythonShell.run('text_analyzer.py', {
      mode: 'text',
      pythonPath: 'python3',
      scriptPath: path.join(__dirname, 'python_scripts'),
      args: [text, analysisType]
    }, (err, results) => {
      if (err) reject(err);
      else resolve({ result: results.join('\n') });
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});