/* eslint-disable sonarjs/no-duplicate-string */

'use strict';

const path = require('path');
const {assert} = require('chai');
const lib = require('../lib.js');

describe('getFiles', ()=>{
  it('should get a list of js files in this project', ()=>{
    const list = lib.getFiles('.', ['node_modules', '.git']);
    const compare = list.map(el=>path.basename(el.path));
    assert.deepEqual(compare, ['analyse.js', 'lib.js', 'lib.js']);
  });
});

describe('getNodeModules', ()=>{
  it('should get a list of node modules in this project', ()=>{
    const list = lib.getNodeModules('.');
    assert.deepEqual(list, ['debug',
      'klaw-sync',
      'yargs',
      'chai',
      'coveralls',
      'eslint',
      'eslint-config-airbnb-base',
      'eslint-plugin-import',
      'eslint-plugin-promise',
      'eslint-plugin-sonarjs',
      'eslint-plugin-standard',
      'istanbul',
      'mocha',
      'nyc']);
  });
  it('should return empty array when no package file', ()=>{
    const list = lib.getNodeModules('./bin');
    assert.deepEqual(list, []);
  });
});

describe('getPossiblePathes', ()=>{
  describe('without additional node pathes', ()=>{
    it('should get a list possible pathes for some module', ()=>{
      const list = lib.getPossiblePathes('someShit', '/web/test/main/lol.js', []);
      const expected = ['/web/test/main/someShit/index.js',
        '/web/test/main/someShit.js'];
      assert.deepEqual(list, expected);
    });
    it('should get a list possible pathes for some relative file without repeats', ()=>{
      const list = lib.getPossiblePathes('../someShit.js', '/web/test/main/lol.js', []);
      const expected = ['/web/test/someShit.js'];
      assert.deepEqual(list, expected);
    });
  });
  describe('with additional node pathes', ()=>{
    it('should get a list possible pathes for some module', ()=>{
      const samplePathes = ['/web/test/second', '/web/test/third'];
      const list = lib.getPossiblePathes('someShit', '/web/test/main/lol.js', samplePathes);
      const expected = ['/web/test/main/someShit/index.js',
        '/web/test/second/someShit/index.js',
        '/web/test/third/someShit/index.js',
        '/web/test/main/someShit.js',
        '/web/test/second/someShit.js',
        '/web/test/third/someShit.js'];
      assert.deepEqual(list, expected);
    });
    it('should get a list possible pathes for some relative file without repeats', ()=>{
      const samplePathes = ['/web/test/second', '/web/test/third'];
      const list = lib.getPossiblePathes('../someShit.js', '/web/test/main/lol.js', samplePathes);
      const expected = ['/web/test/someShit.js'];
      assert.deepEqual(list, expected);
    });
    it('should get a list possible pathes for some relative file', ()=>{
      const samplePathes = ['/web/test/second/lib', '/web/test/third'];
      const list = lib.getPossiblePathes('../someShit.js', '/web/test/main/lol.js', samplePathes);
      const expected = ['/web/test/someShit.js', '/web/test/second/someShit.js'];
      assert.deepEqual(list, expected);
    });
  });
});
