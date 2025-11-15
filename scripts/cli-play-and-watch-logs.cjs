const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

function findLatestLog() {
  const logsDir = path.join(__dirname, '../.logs');
  if (!fs.existsSync(logsDir)) return null;
  const files = fs.readdirSync(logsDir).map(f => ({ f, m: fs.statSync(path.join(logsDir, f)).mtimeMs })).sort((a,b)=>b.m - a.m);
  if (files.length === 0) return null;
  return path.join(logsDir, files[0].f);
}

function tailFile(filePath, onNewLine) {
  let offset = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
  console.log('Tailing file:', filePath);
  const interval = setInterval(() => {
    try {
      const stat = fs.statSync(filePath);
      if (stat.size > offset) {
        const buf = Buffer.alloc(stat.size - offset);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buf, 0, buf.length, offset);
        fs.closeSync(fd);
        offset = stat.size;
        const appended = buf.toString('utf-8');
        appended.split(/\r?\n/).filter(Boolean).forEach(onNewLine);
      }
    } catch (err) {
      // ignore
    }
  }, 200);
  return () => clearInterval(interval);
}

(async () => {
  const wsPorts = [5174, 5173, 5175];
  let ws = null;
  for (const port of wsPorts) {
    try {
      ws = new WebSocket('ws://localhost:' + port + '/conductor-ws');
      await new Promise((resolve, reject) => {
        ws.once('open', resolve);
        ws.once('error', reject);
        setTimeout(() => reject(new Error('timeout')), 2000);
      });
      console.log('Connected to conductor-ws on port', port);
      break;
    } catch (err) {
      if (ws) ws.removeAllListeners();
      ws = null;
    }
  }

  if (!ws) {
    console.error('Could not connect to conductor WS on any of', wsPorts.join(', '));
    process.exit(1);
  }

  const logFile = findLatestLog();
  let stopTail = null;
  if (logFile) {
    stopTail = tailFile(logFile, line => console.log('LOG>', line));
  } else {
    console.log('No log file found in .logs/; skipping tail.');
  }

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log('WS RECV>', msg);
    } catch (err) {
      console.log('WS RECV RAW>', data.toString());
    }
  });

  ws.on('error', (err) => {
    console.error('WS ERROR', err.message);
  });

  const command = {
    type: 'play',
    pluginId: 'LibraryComponentPlugin',
    sequenceId: 'library-component-drop-symphony',
    context: {
      component: {
        template: {
          tag: 'button',
          text: 'CLI drop test',
          classes: ['rx-comp','rx-button']
        }
      },
      position: { x: 200, y: 200 },
      correlationId: `cli-drop-${Date.now()}`
    },
    id: `cli-drop-${Date.now()}`
  };

  console.log('Sending play command to conductor...');
  ws.send(JSON.stringify(command));

  // watch for sequence completion in logs, then exit
  if (logFile) {
    const killer = (line) => {
      if (line.includes('Sequence "Library Component Drop" completed') || line.includes('Library Component Drop" completed')) {
        console.log('Sequence complete');
        if (stopTail) stopTail();
        process.exit(0);
      }
    };
    // Add a short timeout to kill if nothing happens
    setTimeout(() => {
      console.log('Timeout waiting for sequence completion. Closing.');
      if (stopTail) stopTail();
      process.exit(2);
    }, 10000);
    // override tail with killer
    if (logFile) {
      // Re-tail with killer
      if (stopTail) stopTail();
      tailFile(logFile, line => { console.log('LOG>', line); killer(line); });
    }
  } else {
    // If no log file, wait for ack on ws
    const timeout = setTimeout(() => {
      console.error('No logs, timed out waiting for ack, exiting.');
      process.exit(2);
    }, 10000);
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'ack') {
          console.log('ACK ->', msg.id);
          clearTimeout(timeout);
          console.log('No logs present, exiting (ACK received)');
          process.exit(0);
        }
      } catch (err) {}
    });
  }
})();
