# Require analyse

[![npm](https://img.shields.io/npm/v/require-analyse.svg)](https://npm.im/require-analyse)
[![license](https://img.shields.io/npm/l/require-analyse.svg)](https://npm.im/require-analyse)
[![Build Status](https://travis-ci.org/jehy/require-analyse.svg?branch=master)](https://travis-ci.org/jehy/require-analyse)
[![Coverage Status](https://coveralls.io/repos/github/jehy/require-analyse/badge.svg?branch=master)](https://coveralls.io/github/jehy/require-analyse?branch=master)
[![dependencies Status](https://david-dm.org/jehy/require-analyse/status.svg)](https://david-dm.org/jehy/require-analyse)
[![devDependencies Status](https://david-dm.org/jehy/require-analyse/dev-status.svg)](https://david-dm.org/jehy/require-analyse?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/jehy/require-analyse/badge.svg)](https://snyk.io/test/github/jehy/require-analyse)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/jehyrus)

Simple analyse of requires to find unused code.

### Installation

```bash
npm install -g require-analyse
```

### Usage

```bash
Usage: analyse <command> [options]

Commands:
  analyse  analyse files

Options:
  --version         Show version number                                [boolean]
  --files           overrided node paths                                 [array]
  --ignoreFileName  ignore files which name includes those substrings    [array]
  --ignoreDir       ignore dirs with exactly those names                 [array]
  --path            project path                             [string] [required]
  --debug           show debug output                                  [boolean]
  -h, --help        Show help                                          [boolean]
```
### Sample
```
npx require-analyse --node_path /web/avia/lib/nodejs/ --node_path /web/avia/src/ --path /web/avia --ignoreFileName mcore_modules  --ignoreFileName /bin/  --ignoreFileName /DAL/ --ignoreDir .git  --ignoreDir tests  --ignoreDir node_modules
```
