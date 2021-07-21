# nettest
A simple tool to run at both ends to verify end-to-end network messages over specific ports.

## Syntax
```
Usage: nettest [options], where options can be:
  --host (client mode: specifies the server side host address)
  --listen (server mode: listen on the specified port)
  --port (specifies the port to send or listen on)
  --tcp (use TCP/IP as the network protocol)
  --udp (use UDP/IP as the network protocol)
  --data (override the data to send or expect in each message (any string))
  --repeats (total number of messages to send or expect (default: unlimited))
  --interval (seconds to wait between message sends (default: 1))
  --quiet (enables quiet mode, showing less output that default)
  --verbose (enables verbose mode, showing more output that default)
  --version (displays the version number of this utility)
  --help (shows this command-line syntax help)
These options also have these short-form aliases:
  -h: --host
  -l: --listen
  -p: --port
  -t: --tcp
  -u: --udp
  -d: --data
  -r: --repeats
  <!-- -i: --interval -->
  -q: --quiet
  -V: --verbose
  -v: --version
  -?: --help
  ```
`Ctrl-C` to exit manually.

## TCP vs UDP
The main difference is that UDP is a datagram protocol, so it is message-based, with distinct messages (packets), while TCP is stream-based so "message" arrival may be partial, or multiple messages may be coalesced into larger buffers.

TCP provides guaranteed order and delivery, while UDP may drop messages, or deliver them out of order.

In the case of TCP below, the concept of reporting "messages" refers to bursts of data arriving. While it typically matches the UDP output, this is due to the default behavior of sending a burst of TCP data once per second. Use of the `--interval` option, especially with values less than `1` such as `-i 0.01` may present differently.

## Typical usage (TCP):
- Start a listener:
```
nettest --port 1234 --tcp --listen
```
- Start a matching client:
```
nettest --port 1234 --tcp --host server.machine --repeats 10
```
This sends `10` writes to the `TCP` `listener` on `server.machine` and then exits.
```
nettest --port 1234 --tcp --host server.machine --verbose
```
This sends writes to the `TCP` `listener` on `server.machine` showing the messages in `verbose` mode until the client is manually terminated (with Ctrl-C).

## Typical usage (UDP):

- Start a listener:
```
nettest --port 1234 --udp --listen
```
- Start a matching client:
```
nettest --port 1234 --udp --host server.machine --repeats 10
```
This sends `10` UDP packets to the `listener` on `server.machine` and then exits.
```
nettest --port 1234 --udp --host server.machine --verbose
```
This sends writes to the `listener` on `server.machine` showing the messages in `verbose` mode until the client is manually terminated (with Ctrl-C).

## Other options
The --interval option specifies the rate of message sends, where the default is `1` (once per second). Use of `--interval 10` would send one message every 10 seconds, while `-i 0.1` would send 10 per second.

If you just want to test UDP or TCP connectivity between two machines, the `--port` option will default to an arbitrary but specific value (`32123`) on each end so it need not be specified.

Also for checking availability on the local machine, the `--host` option has a default value of `localhost`.

If testing with specific data is desired, the `--data` allows a specific text string to be used for each "message".

All commands have single-character shortcut aliases, prefixed by a single `'-'`, for example a `-p` alias is available for the `--port` option.
