/** global process */
const fs = require('fs');
const path = require('path');
const { NodeSSH } = require('node-ssh');
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));

const logger = require('./src/logger');
const { resolveHomePath, isFn } = require('./src/helper');
const AsyncSpawner = require('./src/async-spawner');

const keyFileNames = ['id_rsa', 'id_ed25519'];

class Slingshot {
  constructor(config = {}, cli = null) {
    this.config = { ...config };
    this.cli = cli;
    this.logger = logger;
    this.ssh = new NodeSSH();
    this.releasePath = this._releasePath();
    return this;
  }

  set(key, val = null) {
    switch (key) {
      case 'cli':
        this.cli = val;
        break;

      case 'config':
        this.config = { ...this.config, ...val };
        break;

      case null:
        break;

      default:
        this.config[key] = val;
        break;
    }

    return this;
  }

  async _checkConfig() {
    if (!this.config.username || !this.config.host) {
      throw new Error('Credentials are missing!');
    }

    // set ssh config
    this.sshconfig = {
      host: this.config.host,
      port: this.config.port ?? 22,
      username: this.config.username,
    };

    if (this.config.password) {
      this.sshconfig.password = this.config.password;
    }

    if (this.config.privateKeyPath) {
      this.sshconfig.privateKeyPath = this._resolveSSHKey(this.config.privateKeyPath);
    }

    // try to extract from local key files if nothing has been passed as option
    if (this._noSSHCredentialsSet()) {
      for (var i = 0; i < keyFileNames.length; i++) {
        const privateKeyPath = path.join(process.env.HOME, '.ssh/', keyFileNames[i]);

        if (fs.existsSync(privateKeyPath)) {
          this.sshconfig.privateKeyPath = this._resolveSSHKey(privateKeyPath);
          break;
        }
      }
    }

    // transform privateKeyPath to Buffer output
    if (this.sshconfig.privateKeyPath) {
      this.sshconfig.privateKey = fs.readFileSync(this.sshconfig.privateKeyPath, 'utf8');
      delete this.sshconfig.privateKeyPath;
    }

    // throw error if still no ssh credentials are set
    if (this._noSSHCredentialsSet()) {
      throw `SSH Credentials are missing!`;
    }

    logger.stepsuccess(`valid config`);

    return true;
  }

  _noSSHCredentialsSet() {
    return !this.sshconfig.password && !this.sshconfig.privateKey;
  }

  _resolveSSHKey(filepath) {
    const p = resolveHomePath(filepath);
    return fs.existsSync(p) ? p : null;
  }

  async _checkConnection() {
    try {
      await this.ssh.connect(this.sshconfig);
      logger.stepsuccess('ssh connection successful');
    } catch (error) {
      logger.steperror('shh connection not successful');
      throw error;
    }
  }

  async _checkRemoteStructure() {
    const dir = this.config.deployTo;

    // do nothing if deployTo is not set and
    // assume the directory of ssh connection
    // must be the target.
    if (!dir) {
      return;
    }

    const cmd = `if [ ! -d "${dir}" ]; then mkdir -p "${dir}"; fi;`;
    const res = await this.ssh.execCommand(cmd, {});

    if (res.stderr) {
      logger.steperror('remote structure invalid');
      throw new Error(res.stderr);
    }

    logger.stepsuccess('remote structure valid');

    return true;
  }

  _releasePath() {
    const dirname = dayjs().utc().format('YYYYMMDDHHmmss');
    return path.join(this.config.deployTo, 'releases/', dirname);
  }

  async _createRelease() {
    logger.step('create release directory');
    await this.ssh.execCommand(`mkdir -p ${this.releasePath}`);
  }

  async _copySharedPaths() {}

  async _runChecks() {
    logger.task(`checks`);
    await this._checkConfig();
    await this._checkConnection();
    await this._checkRemoteStructure();
    logger.success();
  }

  async _runHook(hook) {
    if (isFn(this.config[hook])) {
      logger.task(hook + '()');
      await this.config[hook](this);
      logger.success();
    }
  }

  async exec(...args) {
    const spawner = new AsyncSpawner();
    return spawner.spawn(...args);
  }

  async deploy(rev = null) {
    try {
      // assume argument is a git revision
      // and update config field related to it.
      this.config.revision = rev ?? this.config.revision;

      // checkout revision
      if (this.config.revision) {
        await this.exec('git', ['checkout', this.config.revision]);
      }

      // start pipeline
      await this._runHook('init');
      await this._runHook('preChecks');
      await this._runChecks();
      await this._runHook('postChecks');
      await this._runHook('preDeploy');
      await this._runHook('preCreate');
      await this._createRelease();
      await this._runHook('postCreate');
      await this._runHook('preCopyShared');
      await this._copySharedPaths();
      await this._runHook('postCopyShared');
      await this._runHook('preUpload');
      await this._upload();
      await this._runHook('postUpload');
      await this._runHook('prePublish');
      await this._publish();
      await this._runHook('postPublish');
      await this._runHook('preCleanup');
      await this._cleanup();
      await this._runHook('postCleanup');
      await this._runHook('postDeploy');

      Promise.resolve();
      process.exit(0);
    } catch (error) {
      console.error(error.stack);
      Promise.reject();
      process.exit(1);
    }
  }
}

module.exports = Slingshot;
