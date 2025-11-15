#!/usr/bin/env node

/**
 * Cross-platform Python runner that finds and uses the correct Python executable.
 * Prioritizes virtual environment Python over system Python.
 *
 * Usage: node scripts/run-python.js <python-script.py> [args...]
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the script to run from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: No Python script or module specified');
  console.error('Usage: node scripts/run-python.js <python-script.py> [args...]');
  console.error('   or: node scripts/run-python.js -m <module> [args...]');
  process.exit(1);
}

// Check if running a module (-m flag)
const isModule = args[0] === '-m';
const pythonScript = isModule ? null : args[0];
const scriptArgs = isModule ? args.slice(1) : args.slice(1);

// Find Python executable
function findPython() {
  const isWindows = process.platform === 'win32';
  
  // Check for virtual environment first
  const venvPaths = [
    join(__dirname, '..', '.venv', 'Scripts', 'python.exe'),  // Windows
    join(__dirname, '..', '.venv', 'bin', 'python'),          // Unix
    join(__dirname, '..', 'venv', 'Scripts', 'python.exe'),   // Windows (alternate)
    join(__dirname, '..', 'venv', 'bin', 'python'),           // Unix (alternate)
  ];
  
  for (const venvPath of venvPaths) {
    if (existsSync(venvPath)) {
      return venvPath;
    }
  }
  
  // Fall back to system Python
  const pythonCommands = isWindows 
    ? ['python', 'python3', 'py']
    : ['python3', 'python'];
  
  for (const cmd of pythonCommands) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch (e) {
      // Command not found, try next
    }
  }
  
  throw new Error('Python not found. Please install Python or activate your virtual environment.');
}

// Main execution
try {
  const pythonExe = findPython();

  let command;
  if (isModule) {
    // Running a Python module with -m flag
    console.log(`Using Python: ${pythonExe}`);
    console.log(`Running module: ${scriptArgs.join(' ')}`);
    command = `"${pythonExe}" -m ${scriptArgs.join(' ')}`;
  } else {
    // Running a Python script file
    const scriptPath = resolve(pythonScript);

    if (!existsSync(scriptPath)) {
      console.error(`Error: Python script not found: ${scriptPath}`);
      process.exit(1);
    }

    console.log(`Using Python: ${pythonExe}`);
    console.log(`Running: ${scriptPath}`);
    command = `"${pythonExe}" "${scriptPath}" ${scriptArgs.join(' ')}`;
  }

  execSync(command, { stdio: 'inherit', shell: true });

} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

