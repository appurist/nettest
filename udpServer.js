import chalk from 'chalk';
import dgram from 'dgram';

let count = 0;
let errors = 0;
function reportStats(prefix) {
  console.log(prefix+`${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

export function udpServer(options) {
  const {host, port, repeats, interval, verbose, quiet} = options;
  const server = dgram.createSocket('udp4');

  server.on('error', (err) => {
    errors++;
    console.log(`Server error (${err.code}): ${err.message}`);
    reportStats('Error after ');
  });

  server.on('message', (msg, rinfo) => {
    // console.log(`Received from ${rinfo.address}:${rinfo.port}, received: ${msg} `);
    count++;
    if (!quiet) {
      console.log(`Received ${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
    }
    if ((repeats > 0) && (count >= repeats)) {
      reportStats('Test complete: received ');
      server.close();
    }
  });

  server.on('listening', () => {
    const address = server.address();
    console.log(`Listening on ${address.address}:${address.port}`);
  });

  server.bind(port, host);
}
