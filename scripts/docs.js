#!/usr/bin/env node

let path = require('path');
let shelljs = require('shelljs');
let replaceInFiles = require('replace-in-file');

let typedocCmd = [
  "./node_modules/typedoc/bin/typedoc --tsconfig tsconfig.typedoc.json ",
  " --readme DOCS.md ",
  " --name 'ui-router-react' ",
  " --theme node_modules/ui-router-typedoc-themes/bin/default ",
  " --out _doc ",
  " --internal-aliases internal,coreapi,reactapi ",
  " --external-aliases external,internalapi ",
  " --navigation-label-globals ui-router-react",
].join(" ");

let PROJECTDIR = path.join(__dirname, '..');
let PROJ2 = 'ui-router-core';

shelljs.pushd(PROJECTDIR);

// Make a backup of the source directory
console.log("Backing up `src/` as `src.bak/`");
shelljs.mv('src', 'src.bak');
shelljs.cp('-r', 'src.bak', 'src');

let arr = [];
// This replaces "ui-router-core" with "../../../ui-router-core"
// while accounting for how many "../../" should be prepended
console.log("Replacing `import 'ui-router-core'` with `import '../ui-router-core/src'`... in `src/`");
for (var i = 0; i < 5; i++) {
  arr.push(arr.length);
  
  let dots = arr.map((val) => '..').join('/');
  let stars = arr.map((val) => '*').join('/');

  // Replace references to "ui-router-core/lib" with "../ui-router-core/lib" for typedoc
  replaceInFiles.sync({
    replace: / (['"])ui-router-core\/lib/g,
    with: ' $1' + dots + '/../ui-router-core/src',
    files: [ 
      'src/' + stars + '.tsx',
      'src/' + stars + '.ts',
    ]
  });

  // Replace references to "ui-router-core" with "../ui-router-core" for typedoc
  replaceInFiles.sync({
    replace: / (['"])ui-router-core/g,
    with: ' $1' + dots + '/../ui-router-core/src',
    files: [
      'src/' + stars + '.tsx',
      'src/' + stars + '.ts',
    ]
  });
}

// Run typedoc
console.log("");
console.log(typedocCmd);
console.log("");
shelljs.exec(typedocCmd);

// Restore original sources
// console.log("Restoring `src/` from `src.bak/`");
shelljs.rm('-rf', 'src');
// shelljs.mv('src', 'src.docs');
shelljs.mv('src.bak', 'src');
