#!/usr/bin/env node

'use strict';


const program = require('yargs');

const {analyse} = require('../lib.js');

/* istanbul ignore next */
// eslint-disable-next-line no-unused-expressions
program.usage('Usage: $0 <command> [options]')
  .command(['analyse', '$0'], 'analyse files', {}, analyse)
  .example('$0 analyse --node_path src --node_path modules --path /web/test', 'analyse test project')
  .option('files', {
    type: 'array',
    demandOption: false,
    describe: 'overrided node paths',
  })
  .option('ignoreFileName', {
    type: 'array',
    demandOption: false,
    describe: 'ignore files which name includes those substrings',
  })
  .option('ignoreDir', {
    type: 'array',
    demandOption: false,
    describe: 'ignore dirs with exactly those names',
  })
  .option('path', {
    type: 'string',
    nargs: 1,
    describe: 'project path',
    demandOption: true,
  })
  .option('debug', {
    type: 'boolean',
    nargs: 1,
    describe: 'show debug output',
  })
  .help('h')
  .alias('h', 'help')
  .argv;
