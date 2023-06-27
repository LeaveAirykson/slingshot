class AsyncResolver {
  constructor() {
    this.doneResolve = undefined;
    this.done = false;
  }

  resolve() {
    this.done = true;
    this.doneResolve();
  }

  async wait() {
    if (!this.done) {
      await new Promise((resolve) => (this.doneResolve = resolve));
    }
  }
}

module.exports = AsyncResolver;
