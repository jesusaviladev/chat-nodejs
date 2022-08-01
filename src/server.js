const { Server } = require('net');

const END = 'END';
const host = '0.0.0.0';
const CONNECTIONS = new Map(); // hashtable

const sendMessage = (message, origin) => {
  // enviar mensajes a todos menos a origin
  for (const socket of CONNECTIONS.keys()) {
    if (socket !== origin) {
      socket.write(message);
    }
  }
};

const logError = (message) => {
  console.error(message);
  process.exit(1);
};

const listen = (port) => {
  const server = new Server();

  server.on('connection', (socket) => {
    const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[server]: Connection from ${remoteSocket}`);

    socket.setEncoding('utf-8');
    socket.on('data', (message) => {
      if (!CONNECTIONS.has(socket)) {
        const username = message;
        console.log(`Username ${username} set for socket ${remoteSocket}`);
        CONNECTIONS.set(socket, username);
      } else if (message === END) {
        CONNECTIONS.delete(socket);
        socket.end();
      } else {
        //enviar mensaje a clientes
        console.log(`[client@${remoteSocket}]: ${message}`);

        const username = CONNECTIONS.get(socket);

        const fullMessage = `[${username}]: ${message}`;

        sendMessage(fullMessage, socket);
      }
    });

    socket.on('close', () => {
      console.log(`Connection with ${remoteSocket} closed.`);
    });

    socket.on('error', (err) => {
      logError(err.message);
    });
  });

  server.listen({ port, host }, () => {
    console.log(`Server listening on port ${port}`);
  });

  server.on('error', (err) => {
    logError(err.message);
  });
};

const main = () => {
  if (process.argv.length !== 3) {
    logError(`Usage: node ${__filename} PORT`);
  }

  let [, , port] = process.argv;

  if (isNaN(port)) {
    logError(`${port} is not a valid port`);
  }

  port = Number(port);
  listen(port);
};

main();
