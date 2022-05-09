'use strict';

const colors = require('./cli-colors');
const { performance } = require('perf_hooks');

const icons = {
  task: '☕',
  step: '↪',
  success: '♥',
  event: '★',
  success2: '✔',
  error: '✖',
};

const logger = {
  current: '',
  time: {
    start: null,
    end: null,
  },
  _o: function (out, newline = '') {
    const date = new Date();
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    const d = `${colors.reset}${colors.dim}[${h}:${m}:${s}]${colors.reset}`;
    console.log(`${newline}${d} ${out}${colors.reset}`);
  },
  task: function (txt) {
    this.current = txt;
    this.time.start = performance.now();
    this._o(`${colors.yellow}${icons.task} ${txt}`, `\n`);
  },
  step: function (txt, int = 1) {
    let intent = ' '.repeat(int);
    this._o(`${intent}${colors.yellow}${icons.step}${colors.dim} ${txt}`);
  },
  stepsuccess: function (txt, int = 1) {
    let intent = ' '.repeat(int);
    this._o(`${intent}${colors.green}${icons.success2}${colors.dim} ${txt}`);
  },
  steperror: function (txt, int = 1) {
    let intent = ' '.repeat(int);
    this._o(`${intent}${colors.red}${icons.error}${colors.dim} ${txt}`);
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
