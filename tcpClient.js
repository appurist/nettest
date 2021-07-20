import chalk from 'chalk';
import net from 'net';

let count = 0;
let errors = 0;
function reportStats(prefix) {
  console.log(prefix+`${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

export function tcpClient(options) {
  const {host, port, repeats, interval, verbose, quiet} = options;
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
      if ((repeats > 0) && (++count > repeats)) {
        clearInterval(timer);
        client.end();
        reportStats('Test complete: sent ');
      }
      let message = `Message #${count}.`;
      var data = Buffer.from(message);
      client.write(data, (error) => {
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
    }, interval*1000);
  });
}
