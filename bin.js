#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const args = yargs.argv;

// default configs
let config = { mode: 'ssh' };

// the working directory
const workingdir = process.cwd();

// default path to config is in current working directory
let configpath = path.join(workingdir, 'slingshot.config.js');

// use --config param if valid
if (args.config) {
  configpath = args.config;

  // assume local path when path does not
  // start with forward slash.
  if (!configpath.startsWith('/')) {
    configpath = path.join(workingdir, args.config);
  }
}

// Merge given config with default one
if (fs.existsSync(configpath)) {
  config = Object.assign({}, config, require(configpath));
}

// create slingshot instance
const sling = new (require('./index'))(config);

// execute slingshot
sling.exec();
