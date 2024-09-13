import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [scriptName, setScriptName] = useState('');
  const [args, setArgs] = useState('');
  const [result, setResult] = useState('');
  const [fileLinks, setFileLinks] = useState([]);

  const runScript = async () => {
    if (!scriptName) {
      alert('Please select a script to run.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/run-script', {
        scriptName,
        args: scriptName === 'run-all' ? args.split(',') : [] // Only pass arguments for 'run-all'
      });

      setResult(response.data.logs); // Display logs
      setFileLinks(response.data.files); // Set file links
      alert('Script executed successfully');
    } catch (error) {
      console.error('Error:', error);
      setResult('Error occurred');
    }
  };

  return (
    <div className="App">
      <h1>RNA Analysis Tool</h1>
      
      <label htmlFor="script-select">Select a script to run:</label>
      <select
        id="script-select"
        value={scriptName}
        onChange={(e) => setScriptName(e.target.value)}
      >
        <option value="">--Select Script--</option>
        <option value="RNApdist">RNApdist</option>
        <option value="RNAfold">RNAfold</option>
        <option value="RNAdistance">RNAdistance</option>
        <option value="RNAplot">RNAplot</option>
        <option value="run-all">Run All Scripts</option>
      </select>

      {scriptName === 'run-all' && (
        <div>
          <label htmlFor="script-args">Arguments (comma-separated):</label>
          <input
            type="text"
            id="script-args"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            placeholder="e.g., wt.txt,mut.txt"
          />
        </div>
      )}

      <button onClick={runScript}>Run Script</button>

      <pre>{result}</pre> {/* Display logs */}

      <div>
        <h3>Result Files:</h3>
        {fileLinks.map((link, index) => (
          <div key={index}>
            <a href={link} target="_blank" rel="noopener noreferrer">
              {link}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
