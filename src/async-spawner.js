const spawn = require('child_process').spawn;
const AsyncResolver = require('./async-resolver');

const defaultArgs = {
  stdout: () => {},
  exit: () => {},
  error: () => {},
};

class AsyncSpawner {
  constructor(args = {}) {
    // error buffer
    this.err = '';

    // save arguments
    this.args = { ...defaultArgs, ...args };

    // async resolver workaround so we can wait for spawn exit
    this.resolver = new AsyncResolver();
  }

  async spawn(...args) {
    // spawn process and execute it
    const spawnInst = spawn(...args);

    // output stdout and execute callback
    spawnInst.stdout.on('data', (data) => {
      process.stdout.write(data);
      this.args.stdout(data.toString());
    });

    // output errors
    // notice: some packages like mongodump output
    // everyting to stderr instead of stdout.
    // Therefore we try to figure out if its really an error
    // and attach the output to this.err which will be
    // thrown as error on spawn exit when error code exists.
    // @see: https://jira.mongodb.org/browse/TOOLS-2186
    spawnInst.stderr.on('data', (data) => {
      const output = data.toString();

      if (output.includes('Error:')) {
        this.err += output;
      } else {
        process.stdout.write(data);
      }
    });

    // when span process finished
    // catch errors or otherwise execute
    // callback and resolve the spawn process.
    spawnInst.on('exit', (code) => {
      // throw on error
      if (code === 1) {
        this.args.error(code);
        throw Error(this.err ?? 'An undefined error occoured in AsyncSpawner()');
      }

      // execute callback
      this.args.exit(code);

      // otherwise resolve as wanted
      this.resolver.resolve();
    });

    // wait for resolve to prevent premature exit
    await this.resolver.wait();
  }
}

module.exports = AsyncSpawner;
