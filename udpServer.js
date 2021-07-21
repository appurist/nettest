const chalk = require('chalk');
const dgram = require('dgram');

let count = 0;
let bytes = 0;
let errors = 0;
function reportStats(prefix) {
  console.log(prefix+`${chalk.blueBright(''+bytes)} bytes, in ${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

function udpServer(options) {
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
    bytes += msg.length;
    if (!quiet) {
      reportStats('Received ');
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


module.exports = { udpServer };