#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const workingdir = process.cwd();
const localconfig = path.join(workingdir, 'slingshot.config.js');
const args = yargs.argv;

console.log(workingdir);
console.log(localconfig);

console.log(fs.existsSync(localconfig));
console.log(args);
