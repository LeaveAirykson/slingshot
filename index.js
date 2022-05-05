class Slingshot {
  constructor(opts = {}) {
    this.config = Object.assign({}, opts);
    return this;
  }

  set(key, val = null) {
    this.config[key] = val;
  }

  deploy() {
    console.log('run deploy!');
  }
}

exports.Slingshot = Slingshot;
