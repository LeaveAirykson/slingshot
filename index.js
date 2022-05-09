/** global process */
const fs = require('fs');
const path = require('path');
const { NodeSSH } = require('node-ssh');
const colors = require('./src/cli-colors');
const logger = require('./src/logger');
const { resolveHomePath } = require('./src/helper');

const keyFileNames = ['id_rsa', 'id_ed25519'];

class Slingshot {
  constructor(config = {}, cli = null) {
    this.config = { ...config };
    this.cli = cli;
    this.ssh = new NodeSSH();
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
      throw `Credentials are missing!`;
    }

    this.sshconfig = {
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
    };

    if (this.config.privateKey) {
      this.sshconfig.privateKey = this._resolveSSHKey(this.config.privateKey);
    }

    if (this.config.password) {
      this.sshconfig.password = this.config.password;
    }

    // try to extract from local key files if nothing has been passed as option
    if (this._noSSHCredentialsSet()) {
      for (var i = 0; i < keyFileNames.length; i++) {
        const privateKey = path.join(process.env.HOME, '.ssh/', keyFileNames[i]);

        if (fs.existsSync(privateKey)) {
          this.sshconfig.privateKey = this._resolveSSHKey(privateKey);
          break;
        }
      }
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

  _checkConnection() {
    return new Promise((resolve, reject) => {
      this.ssh
        .connect(this.sshconfig)
        .then(() => {
          logger.stepsuccess('connection established');
          resolve();
        })
        .catch((e) => {
          logger.steperror('connection not established');
          console.error(e);
          reject(e);
        });
    });
  }

  async _checkRemoteStructure() {
    logger.task(`check remote structure`);

    this.ssh
      .connect(this.sshconfig)
      .then(() => {})
      .catch((e) => {});

    return true;
  }

  async _deploy() {
    try {
      await this._checkRemoteStructure();
      await this._releaseCreate();

      Promise.resolve();
    } catch (error) {
      console.error(`\n${error}`);
      Promise.reject();
      process.exit(1);
    }
  }

  async deploy(arg = null) {
    // assume argument is a git revision
    // and update config field related to it.
    if (arg) {
      this.config.revision = arg;
    }

    try {
      // start output
      logger.task(`checks`);

      // first check the config file
      await this._checkConfig();

      // test the connection
      await this._checkConnection();

      // test remote folder structure
      await this._checkRemoteStructure();

      // success 'check' task
      logger.success();

      // run beforedeploy hook
      if (typeof this.config.beforeDeploy === 'function') {
        logger.task(`hook beforeDeploy()`);
        await this.config.beforeDeploy(this);
        logger.success();
      }

      // actually run the upload
      await this._deploy();

      // run afterdeploy hook
      if (typeof this.config.beforeDeploy === 'function') {
        logger.task(`hook afterDeploy()`);
        await this.config.afterDeploy(this);
        logger.success();
      }

      Promise.resolve();
      process.exit(0);
    } catch (error) {
      console.error(`\n${error}`);
      Promise.reject();
      process.exit(1);
    }
  }
}

module.exports = Slingshot;
