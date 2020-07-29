#!/usr/bin/env node

'use strict';

const fs = require('fs');
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

  const filesAndDirs = klawSync(projectPath, { filter: filterFn });
  return filesAndDirs.filter(({stats})=>stats.isFile());
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
  possibleNames.forEach(possibleName=>{
    possiblePathes.push(path.join(filePath, '../', possibleName));
    if (nodePathes && nodePathes.length) {
      nodePathes.forEach(nodePath=>possiblePathes.push(path.join(nodePath, possibleName)));
    }
  });
  const uniquePossiblePathes = possiblePathes.filter((filePath2, index, arr)=>arr.indexOf(filePath2) === index);
  if (!samplePathShown) {
    samplePathShown = true;
    debug(`\n\nSample path check for "${required}" from ${filePath}:`);
    debug('possibleNames', possibleNames);
    debug('possiblePathes', possiblePathes, '\n\n');
    debug('uniquePossiblePathes', uniquePossiblePathes, '\n\n');
  }
  return uniquePossiblePathes;
}

// No sense to write tests here
/* istanbul ignore next */
function analyse(argv) {
  if (argv.debug) {
    Debug.enable('analyse:*');
  }
  debug('Args:', argv);
  const nodeModules = getNodeModules(argv.path);
  const filePathes = getFiles(argv.path, argv.ignoreDir || []);
  // debug(filePathes);
  const regexp = /require\(([^)]*)\)/gi;
  filePathes.forEach(({path: filePath})=>{
    const data = fs.readFileSync(filePath, 'utf8');
    (data.match(regexp) || []).forEach(req => {
      const required = req.substr(9, req.length - 11);
      if (nodeModules.includes(required)) {
        return;
      }
      const possiblePathes = getPossiblePathes(required, filePath, argv.node_path);
      possiblePathes.forEach(possiblePath=>{
        const found = filePathes.find(({path: filePath2})=> filePath2 === possiblePath);
        if (found) {
          if (!found.used) {
            found.used = 1;
          } else {
            found.used++;
          }
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
  const mostUsed = filePathes
    .filter(({used, path: filePath2})=>used && !ignoreFiles.some(ignoreFile=>filePath2.includes(ignoreFile)))
    .sort((a, b)=>b.used - a.used)
    .map(el=>({used: el.used, path: el.path}))
    .slice(0, 20);
  // eslint-disable-next-line no-console
  console.log('\n\nMost used files:');
  // eslint-disable-next-line no-console
  console.log(mostUsed.map(el=>`${el.path} ${el.used}`).join('\n'));
}

module.exports = {
  analyse,
  getPossiblePathes,
  getFiles,
  getNodeModules,
};
