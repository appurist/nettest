const chalk = require('chalk');
const net = require('net');


let count = 0;
let bytes = 0;
let errors = 0;
function reportStats(prefix) {
  console.log(prefix+`${chalk.blueBright(''+bytes)} bytes, in ${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

function tcpServer(options) {
  const {host, port, verbose, quiet} = options;
  const server = net.createServer((conn) => {
    count=0; bytes=0; errors=0;  // reset stats
    console.log(`Incoming ${conn.remoteFamily} connection from ${conn.remoteAddress}:${conn.remotePort}...`);
    conn.on('data', (data) => {
      bytes += data.length;
      if (verbose) {
        console.log(`Received: ${data.toString()}`);
      }
      count++;
      if (!quiet) {
        reportStats('Received ');
      }
    });
    conn.on('end', () => {
      reportStats("Connection closed: received");
    })
  });

  server.on('listening', () => {
    const address = server.address();
    console.log(`Listening to ${address.family} on ${address.address}:${address.port}`);
  });
  server.on('error', (err) => {
    errors++;
    console.log(chalk.red(`Server error (${err.code}): ${err.message}`));
    reportStats('Error after ');
  });

  server.listen(port, host);
}


module.exports = { tcpServer };