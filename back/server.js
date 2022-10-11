const http = require('http');
const https = require('https');
const app = require('./app');
const fs = require("fs");
const path = require("path");

// Ajout des certificats SSL pour le HTTPS
const options ={
  key:fs.readFileSync(path.join(__dirname,'./certificats/key.pem'), 'utf8'),
  cert:fs.readFileSync(path.join(__dirname,'./certificats/server.crt'), 'utf8') 
}

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const httpsPort = normalizePort('3001');
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Création des serveurs
const server = http.createServer(app);
const httpsServer = https.createServer(options, app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

httpsServer.on('error', errorHandler);
httpsServer.on('listening', () => {
  const address = httpsServer.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + httpsPort;
  console.log('Listening on ' + bind);
});

// Ecoute des ports 
server.listen(port);
httpsServer.listen(httpsPort);
