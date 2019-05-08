#!/usr/bin/env node

'use strict';

const fs = require('fs');
const program = require('yargs');
const path = require('path');
const Debug = require('debug');
const klawSync = require('klaw-sync');


const debug = Debug('analyse:bin');
let samplePathShown = false;

function getFiles(projectPath, ignoreDirs) {
  function filterFn({path: filePath, stats}) {
    const basename = path.basename(filePath);
    if (stats.isDirectory()) {
      if (basename === '.' || basename[0] === '.') {
        debug(`hidden dir ${filePath}, not processing`);
        return false; // ignore hidden dirs
      }
      if (ignoreDirs.includes(basename)) {
        debug(`ignored dir ${filePath}, not processing`);
        return false;
      }
      return true;
    }
    return filePath.endsWith('.js');
  }

  return klawSync(projectPath, { filter: filterFn });
}

function getNodeModules(projectPath) {
  const packageFile = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageFile)) {
    const file = JSON.parse(fs.readFileSync(packageFile));
    const prod = Object.keys(file.dependencies);
    const dev = Object.keys(file.devDependencies);
    return [].concat(prod, dev);
  }
  return [];
}

function getPossiblePathes(required, filePath, nodePathes) {
  const possibleNames = [];
  if (required.endsWith('.js')) {
    possibleNames.push(required);
  } else {
    possibleNames.push(path.join(required, 'index.js'));
    possibleNames.push(`${required}.js`);
  }
  const possiblePathes = [];
  possibleNames.forEach((possibleName)=>{
    possiblePathes.push(path.join(filePath, '../', possibleName));
    if (nodePathes && nodePathes.length) {
      nodePathes.forEach(nodePath=>possiblePathes.push(path.join(nodePath, possibleName)));
    }
  });
  if (!samplePathShown) {
    samplePathShown = true;
    debug(`\n\nSample path check for "${required}" from ${filePath}:`);
    debug('possibleNames', possibleNames);
    debug('possiblePathes', possiblePathes, '\n\n');
  }
  return possiblePathes;
}

function analyse(argv) {
  if (argv.debug) {
    Debug.enable('analyse:*');
  }
  debug('Args:', argv);
  const nodeModules = getNodeModules(argv.path);
  const paths = getFiles(argv.path, argv.ignoreDir || []);
  const filePathes = paths.filter(({stats})=>stats.isFile());
  // debug(filePathes);
  const regexp = /require\(([^)]*)\)/gi;
  filePathes.forEach(({path: filePath})=>{
    const data = fs.readFileSync(filePath, 'utf8');
    (data.match(regexp) || []).forEach((req) => {
      const required = req.substr(9, req.length - 11);
      if (nodeModules.includes(required)) {
        return;
      }
      const possiblePathes = getPossiblePathes(required, filePath, argv.node_path);
      possiblePathes.forEach((possiblePath)=>{
        const found = filePathes.find(({path: filePath2})=> filePath2 === possiblePath);
        if (found) {
          found.used = true;
        }
      });
    });
  });
  const ignoreFiles = argv.ignoreFileName || [];
  const nonUsed = filePathes
    .filter(({used, path: filePath2})=>!used && !ignoreFiles.some(ignoreFile=>filePath2.includes(ignoreFile)))
    .map(({path: filePath2})=>filePath2);
  // eslint-disable-next-line no-console
  console.log(`\n\nNon used files (${nonUsed.length}):\n\n${nonUsed.join('\n')}`);
}

// eslint-disable-next-line no-unused-expressions
program.usage('Usage: $0 <command> [options]')
  .command('analyse', 'analyse files', {}, analyse)
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
