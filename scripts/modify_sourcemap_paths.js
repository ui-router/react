#!env node
"use strict";

require('shelljs/global');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const pkgName = require('../package.json').name;
const prefix = path.resolve(__dirname, '..');

const allartifacts = require('./artifacts.json').ARTIFACTS;
const globs = allartifacts
    .map(dir => path.resolve(prefix, dir))
    .filter(dir => fs.lstatSync(dir).isDirectory())
    .map(dir => `${dir}/**/*.js.map`);

const files = globs
    .map(pattern => glob.sync(pattern))
    .reduce((acc, arr) => acc.concat(arr), []);

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(file));
  if (Array.isArray(data.sources)) {
    data.sources = data.sources.map(source => source.replace(/^(?:\.\.\/)*src/, pkgName));
    fs.writeFileSync(file, JSON.stringify(data));
  }
});
