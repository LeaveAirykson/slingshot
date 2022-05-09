#!/usr/bin/env node
// node modules
const fs = require('fs');
const path = require('path');

// custom modules
const colors = require('./src/cli-colors');

// setup sling instance
const sling = new (require('./index'))().set('cli', true);

// the working directory
const workingdir = process.cwd();

// default config filename
const configfilename = 'slingshot.config.js';

// paths to search for the config file
const pathsToLookForConfig = [
  path.join(workingdir, './config/', configfilename),
  path.join(workingdir, configfilename),
];

// valid path after lookup
let configpath = null;

// search for config file
pathsToLookForConfig.forEach((p) => {
  if (!configpath && fs.existsSync(p)) {
    configpath = require(p);
  }
});

// default configs
let config = require('./config.defaults');
const logger = require('./src/logger');

// merge defaults with found config
if (configpath) {
  config = { ...config, ...configpath };
}

// set initial config for sling
sling.set('config', config);

// setup cli yargs parser
require('yargs/yargs')(process.argv.slice(2))
  .scriptName('slingshot')
  .usage('$0 <command> [args...]')
  .option('config', {
    alias: 'c',
    describe: 'Path to config file.',
    requiresArg: true,
  })
  .coerce('config', function (arg) {
    configpath = arg.startsWith('/') ? path.join(arg) : path.join(workingdir, arg);

    if (!fs.existsSync(configpath)) {
      throw new Error(`Config file not found: ${configpath}`);
    }

    const loadedconfig = require(configpath);
    sling.set('config', { ...config, ...loadedconfig });
  })
  .command('init', 'Create slingshot config file.')
  .command(
    'deploy [revision]',
    'Deploy specific revision. Could be any git tag, commit, branch. Defaults to "master".',
    () => {},
    (arg) => sling.deploy(arg.revision)
  )
  .command(
    'rollback',
    'Roll back to previously published release',
    () => {},
    function () {
      console.log('rollback');
    }
  )
  .demandCommand(1, 'You need to provide at least one command to execute.')
  .fail((msg, err, yargs) => {
    console.log(`\n${colors.fgRed}Error: ${colors.reset}${msg}\n`);
    console.log(yargs.help());
    process.exit(1);
  })
  .help().argv;
