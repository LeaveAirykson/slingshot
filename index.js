class Slingshot {
  constructor(opts = {}) {
    this.config = Object.assign({}, opts);
    return this;
  }

  set(key, val = null) {
    this.config[key] = val;
    return this;
  }

  _checkConfig() {
    if (!this.config.mode) {
      throw `No transport mode set in config!`;
    }

    if (!this.config.user || !this.config.host) {
      throw `Credentials are invalid!`;
    }
  }

  _checkConnection() {}

  _deploy() {
    console.log('run deploy!');
  }

  async exec() {
    try {
      this._checkConfig();
      this._checkConnection();
      this._deploy();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}

module.exports = Slingshot;
