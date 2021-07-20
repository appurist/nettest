import chalk from 'chalk';
import dgram from 'dgram';

let count = 0;
let bytes = 0;
let errors = 0;
function reportStats(prefix) {
  console.log(prefix+`${chalk.blueBright(''+bytes)} bytes, in ${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

export function udpClient(options) {
  const {host, port, repeats, interval, verbose, quiet} = options;
  const client = dgram.createSocket('udp4');

  if (verbose) {
    client.on('message',function(msg,info){
      console.log(`Received ${msg.length}-byte reply from ${info.address}:${info.port}: ${msg.toString()}`);
    });
  }

  let timer = setInterval(() => {
    let message = `Message #${count+1}.`;
    var data = Buffer.from(message);
    client.send(data, port, host, (error) => {
      count++;
      bytes += data.length;
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