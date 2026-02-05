const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT) || 8787;
const ROOT = __dirname;

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const mime = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8'
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/git-pull') {
    exec('git pull', { cwd: ROOT }, (error, stdout, stderr) => {
      const code = error && typeof error.code === 'number' ? error.code : 0;
      if (error) {
        sendJson(res, 500, {
          command: 'git pull',
          code,
          stdout,
          stderr,
          error: error.message
        });
        return;
      }

      sendJson(res, 200, {
        command: 'git pull',
        code,
        stdout,
        stderr
      });
    });
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/update.html')) {
    sendFile(res, path.join(ROOT, 'update.html'));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`Pull page running at http://${HOST}:${PORT}/update.html`);
});
