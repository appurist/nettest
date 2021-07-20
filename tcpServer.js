import chalk from 'chalk';
import net from 'net';

let count = 0;
let errors = 0;
function reportStats(prefix) {
  console.log(prefix+`${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

export function tcpServer(options) {
  const {host, port, repeats, interval, verbose, quiet} = options;
  const server = net.createServer((conn) => {
    count=0; errors=0;  // reset stats
    console.log(`Incoming ${conn.remoteFamily} connection from ${conn.remoteAddress}:${conn.remotePort}...`);
    conn.on('data', (data) => {
      // console.log(`Received: ${data}`);
      if (verbose) {
        console.log(`Received: ${data.toString()}`);
      }
      count++;
      if (!quiet) {
        console.log(`Received ${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
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

