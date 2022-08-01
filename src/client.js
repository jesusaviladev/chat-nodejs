const { Socket } = require('net');
const readline = require('readline');
const { END } = require('./lib/config.js');

const logError = (message) => {
  console.error(message);
  process.exit(1);
};

const connect = (host, port) => {
  const socket = new Socket();
  // Leemos de standard input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  socket.connect({ host, port }, () => {
    console.log(`[client]: Successfully connected`);
    rl.question('Please enter your username: ', (username) => {
      socket.write(username);
      console.log('Type any message or type END to close the connection');
    });
  });
  socket.setEncoding('utf-8');

  socket.on('data', (data) => {
    console.log(data);
  });

  rl.on('line', (message) => {
    socket.write(message);
    if (message === END) {
      socket.end();
    }
  });

  socket.on('close', () => {
    console.log('Disconnected');
    process.exit(0);
  });

  socket.on('error', (err) => logError(err.message));
};

const main = () => {
  if (process.argv.length !== 4) {
    logError(`Usage: node ${__filename} HOSTNAME PORT`);
  }

  let [, , host, port] = process.argv;

  if (isNaN(port)) {
    logError(`${port} is not a valid port`);
  }

  port = Number(port);
  connect(host, port);
};

main();
