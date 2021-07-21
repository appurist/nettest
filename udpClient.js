const chalk = require('chalk');
const dgram = require('dgram');

let count = 0;
let bytes = 0;
let errors = 0;
function reportStats(prefix) {
  console.log(prefix+`${chalk.blueBright(''+bytes)} bytes, in ${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

function udpClient(options) {
  const {host, port, repeats, data, interval, verbose, quiet} = options;
  const client = dgram.createSocket('udp4');

  if (verbose) {
    client.on('message',function(msg,info){
      console.log(`Received ${msg.length}-byte reply from ${info.address}:${info.port}: ${msg.toString()}`);
    });
  }

  let timer = setInterval(() => {
    let message = data || `Message #${count+1}.`;
    let text = Buffer.from(message);
    client.send(text, port, host, (error) => {
      count++;
      bytes += text.length;
      if (error) {
        errors++;
        if (!quiet) {
          console.log(chalk.red("Error on send:"), err);
        }
      } else {  // success
        if (verbose) {
          reportStats('Sent ');
        }
      }
    });
    if ((repeats > 0) && (count >= repeats)) {
      clearInterval(timer);
      client.close();
      reportStats('Test complete: sent ');
    }
  }, interval*1000);
}

module.exports = { udpClient };