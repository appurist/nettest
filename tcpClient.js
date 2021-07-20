import chalk from 'chalk';
import net from 'net';

let count = 0;
let bytes = 0;
let errors = 0;
function reportStats(prefix) {
  console.log(prefix+`${chalk.blueBright(''+bytes)} bytes, in ${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

export function tcpClient(options) {
  const {host, port, repeats, interval, data, verbose, quiet} = options;
  const client = new net.Socket();

  console.log(`Connecting to ${host}:${port}...`);
  client.connect(port, host);

  client.on('end', () => {
    console.log(chalk.yellow(`Disconnected from ${host}:${port}.`));
  });

  client.on('connect', () => {
    console.log(chalk.green(`Connected to ${host}:${port}. Sending data.`));
    client.setEncoding('utf8');
    let timer = setInterval(() => {
      let myNum = count+1;
      if ((repeats > 0) && (myNum > repeats)) {
        clearInterval(timer);
        client.end(() => {
          reportStats('Test complete: sent ');
          process.exit(0);
        });
        return;
      }
      let message =  data || `Message #${myNum}.`;
      var text = Buffer.from(message);
      client.write(text, (err) => {
        count++;
        bytes += text.length;
        if (err) {
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
    }, interval*1000);
  });
}
