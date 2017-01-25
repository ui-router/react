#!env node
"use strict";

let version = require('../package.json').version;

require('shelljs/global');
let readlineSync = require('readline-sync');
let fs = require('fs');
let path = require('path');
let util = require('./util');
let _exec = util._exec;

cd(path.join(__dirname, '..'));

if (!readlineSync.keyInYN('Did you bump the version number in package.json?')) {
  process.exit(1);
}

if (!readlineSync.keyInYN('Did you update CHANGELOG.md using scripts/update_changelog.js?')) {
  process.exit(1);
}

if (!readlineSync.keyInYN('Did you push all changes back to origin?')) {
  process.exit(1);
}

if (!readlineSync.keyInYN('Ready to publish?')) {
  process.exit(1);
}

util.ensureCleanMaster('master');

_exec('npm run package');
_exec(`npm run docs`);

// publish to npm first
_exec(`npm publish`);

// then tag and push tag
_exec(`git tag ${version}`);
_exec(`git push origin ${version}`);

console.log("\n\nAPI docs generated (but not deployed) at ./_docs");