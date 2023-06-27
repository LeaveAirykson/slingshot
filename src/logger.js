'use strict';

const colors = require('./cli-colors');
const { performance } = require('perf_hooks');

const icons = {
  task: '⏵',
  task2: '☕',
  step: '↪',
  success: '♥',
  event: '★',
  success2: '✔',
  error: '✖',
};

const logger = {
  current: '',
  showTime: false,
  time: {
    start: null,
    end: null,
  },
  _o: function (out, newline = '') {
    let msg = `${newline}${out}${colors.reset}`;

    if (this.showTime) {
      const date = new Date();
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      const d = `${colors.reset}${colors.dim}[${h}:${m}:${s}]${colors.reset}`;

      msg = `${newline}${d} ${out}${colors.reset}`;
    }

    console.log(msg);
  },
  task: function (txt) {
    this.current = txt;
    this.time.start = performance.now();
    this._o(`${colors.yellow}${icons.task} run ${txt}`, `\n`);
  },
  step: function (txt, int = 0) {
    let intent = ' '.repeat(int);
    this._o(`${intent}${colors.yellow}${icons.step}${colors.dim} ${txt}`);
  },
  stepsuccess: function (txt, int = 0) {
    let intent = ' '.repeat(int);
    this._o(`${intent}${colors.green}${icons.success2}${colors.reset} ${txt}`);
  },
  steperror: function (txt, int = 0) {
    let intent = ' '.repeat(int);
    this._o(`${intent}${colors.red}${icons.error} ${txt}`);
  },
  log: function (txt) {
    this._o(`${txt}`);
  },
  event: function (txt, int = 0) {
    let intent = ' '.repeat(int);
    this._o(`${intent}${colors.cyan}${icons.event} ${txt}${colors.reset}`);
  },
  success: function (txt = '') {
    txt = txt ? txt : `${this.current} finished`;
    this.time.end = performance.now();
    const ms = this.time.end - this.time.start;
    const finish = ((ms % 60000) / 1000).toFixed(2);
    this._o(`${colors.green}${icons.task} ${txt} ${colors.dim}(${finish}s)${colors.reset}`);
  },
};

module.exports = logger;
