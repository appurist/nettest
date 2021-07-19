#!/usr/bin/env node
import dgram from 'dgram';
import chalk from 'chalk';
import arg from 'arg';

const VERSION = '1.0.0';
let port = 32123;
let serverMode = false;
let host;
let repeats = -1;
let interval = 1;
let quiet = false;
let verbose = false;
let args;
let count = 0;
let errors = 0;

let cmdHelpText = '';
let cmdHelp = {};
let aliases = { };
let cmd0 = 'nettest';      // the name of this command
let commandLineOptions = {
  // Types
  '--host': String,
  '--listen': Boolean,  // run in server mode?
  '--port': String,
  '--tcp': String,      // use TCP protocol
  '--udp': String,      // use UDP protocol
  '--data': String,
  '--repeats': String,
  '--interval':Number,

  '--quiet': Boolean,
  '--verbose': Boolean,
  '--version': Boolean,
  '--help': Boolean,

  // Aliases
  '-h': '--host',
  '-l': '--listen',
  '-p': '--port',
  '-t': '--tcp',
  '-u': '--udp',
  '-d': '--data',
  '-r': '--repeats',
  '-i': '--interval',

  '-q': '--quiet',
  '-V': '--verbose',
  '-v': '--version',
  '-h': '--help',
  '-?': '--help'
};


// Startup here
setCommandLineHelp('--host',  'client mode: specifies the server side host address');
setCommandLineHelp('--listen',  'server mode: listen on the specified port');
setCommandLineHelp('--port', 'specifies the port to send or listen on');
setCommandLineHelp('--tcp',  'use TCP/IP as the network protocol');
setCommandLineHelp('--udp',  'use UDP/IP as the network protocol');
setCommandLineHelp('--data', 'override the data to send or expect in each message (any string)');
setCommandLineHelp('--repeats',  'total number of messages to send or expect (default: unlimited)');
setCommandLineHelp('--interval', 'seconds to wait between message sends (default: 1)');
setCommandLineHelp('--quiet', 'enables quiet mode, showing less output that default');
setCommandLineHelp('--verbose', 'enables verbose mode, showing more output that default');
setCommandLineHelp('--version', 'displays the version number of this utility');
setCommandLineHelp('--help',    'shows this command-line syntax help');

process.on('uncaughtException', onError);
try {
  args = initCommandLine(cmd0, commandLineOptions);
} catch (err) {
  console.error(err.message);
  handleShutdown(1);
}

function handleShutdown(rc) {
  if (count > 0) {
    reportStats('Test aborted: ');
  }
  process.exit(rc);
}

process.on('SIGTERM', () => {
  console.info('Terminate (SIGTERM) signal received.');
  handleShutdown(0);
});
process.on('SIGINT', () => {
  console.info('Interrupt (SIGINT) signal received.');
  handleShutdown(0);
});

function onError(err) {
  console.error("Server error:", err.message);
  handleShutdown(1);  //mandatory return code (as per the Node.js docs)
}

function setCommandLineHelp(k, v) {
  cmdHelp[k] = v;
}

function initCommandLine(cmd0, commandLineArgs) {
  cmdHelpText = `Usage: ${chalk.yellow(cmd0)} [${chalk.green('options')}], where ${chalk.green('options')} can be:\n`;
  for (let k in commandLineArgs) {
    let opt = commandLineArgs[k];
    if (typeof opt === 'string') {
      if (aliases[k] === undefined) aliases[k] = [];  // first one for [k]
      aliases[k].push(opt);
    } else {
      let desc = cmdHelp[k] || '(missing help description)';
      cmdHelpText += `  ${chalk.yellow(k)} (${desc})\n`;
    }
  }
  cmdHelpText += `These options also have these short-form ${chalk.green('aliases')}:\n`;
  for (let a in aliases) {
    cmdHelpText += `  ${chalk.yellow(a)}: ${chalk.green(aliases[a].join(' '))}\n`;
  }
  return arg(commandLineArgs);
}

function onCommandLineHelp() {
  console.log(cmdHelpText);
}

function reportStats(prefix) {
  console.log(prefix+`${chalk.green(''+count)} messages, ${chalk.red(errors)} errors.`);
}

//////////////////////////////////////

function doListen() {
  const server = dgram.createSocket('udp4');

  server.on('error', (err) => {
    errors++;
    console.log('Server error:', err);
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

////////////////////////////////////////////////////////


function doSends() {
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

// Mainline
try {
  if (args['--version']) {
    console.log(chalk.yellow("nettest")+chalk.magenta(VERSION))
    handleShutdown(0);
  }

  if (args['--quiet']) {
    quiet = true;
    verbose = false;  // can't both be true
  }
  if (args['--verbose']) {
    verbose = true;
    quiet = false;  // can't both be true
  }

  if (args['--help']) {
    onCommandLineHelp();
    handleShutdown(0);
  }

  if (args['--port']) {
    port = Number(args['--port']);
    if (port === NaN) {
      console.log(chalk.red(`--port requires a port number, received '${args['--port']} instead.`));
      handleShutdown(1);
    }
  }

  if (args['--repeats']) {
    repeats = Number(args['--repeats']);
    if ((repeats === NaN) || (repeats < 1)) {
      console.log(chalk.red(`--repeats requires a positive count (number), received '${args['--repeats']} instead.`));
      handleShutdown(1);
    }
  }

  if (args['--interval']) {
    interval = Number(args['--interval']);
    if (port === NaN) {
      console.log(chalk.red(`--interval requires a number (seconds), received '${args['--interval']} instead.`));
      handleShutdown(1);
    }
  }

  // order matters for these two
  if (args['--host']) {
    host = args['--host'];
  }
  if (args['--listen']) {
    serverMode = true;
    if (!host) {
      host = '0.0.0.0';
    }
  } else {
    if (!host) {
      host = 'localhost';
    }
  }

  if (!args['--port']) {
    console.log(chalk.yellow(`No --port specified, assuming port ${port}.`));
  }

  // RUN SERVER LISTENER or CLIENT SENDER
  serverMode ? doListen() : doSends();
} catch (e) {
  console.error(e);
  handleShutdown(2);
}
