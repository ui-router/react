#!env node
"use strict";

let fs = require('fs');
let path = require('path');
let glob = require('glob');

require('shelljs/global');

let ensure = (type) => (path) => {
	let is = false;
	try { is = fs.lstatSync(path)['is' + type](); } catch (e) { console.log(e); }
	if (!is) echo(`Not a ${type}: ${path}`) && exit(-3);
};
let assertDir = ensure('Directory');
let assertFile = ensure('File');

preparePackageFolder('react');

function preparePackageFolder (pkgName) {
	let paths = {
		basedir: path.resolve(__dirname, '..'),
		pkgsrc: path.resolve(__dirname, '..'),
		package: path.resolve(__dirname, '..', 'package'),
		srcCopy: path.resolve(__dirname, '..', 'package', '_src'),
	};

	let files = {
		pkgfile: path.resolve(paths.basedir, 'package.json'),
		tsconfigWebpack: path.resolve(paths.basedir, 'tsconfig.json'),
		tsconfig: path.resolve(paths.basedir, 'tsconfig.build.json'),
		webpack: path.resolve(paths.basedir, 'webpack.build.js')
	};

	// Check for some paths and files required to build a package
	assertFile(files.tsconfig);
	assertFile(files.webpack);

	echo(`--> Cleaning: ${paths.package}`);
	rm('-rf', paths.package);
	mkdir('-p', paths.package);

	echo(`--> Packaging: ${pkgName}\n	From: ${paths.pkgsrc}\n	Into: ${paths.package}`);
	cp('-R', `${paths.basedir}/package.json`, paths.package);

	echo(`--> Copying typescript sources to ${paths.srcCopy}`);
	cp('-R', `${paths.basedir}/src/`, paths.srcCopy);


	cp(files.webpack, `${paths.package}/webpack.config.js`);
	cp(files.tsconfig, `${paths.package}/tsconfig.json`);
	cp(files.tsconfigWebpack, `${paths.package}/tsconfig.webpack.json`);

	echo('--> Linking node_modules and typings...');
	// In case the source needs typings and node_modules to compile, symlink them
	ln('-sf', `${paths.basedir}/typings`, `${paths.package}/typings`);
	ln('-sf', `${paths.basedir}/node_modules`, `${paths.package}/node_modules`);

	['.gitignore', '.npmignore', 'README.md']
		.forEach(file => cp(`${paths.basedir}/${file}`, `${paths.package}/${file}`));

	echo('--> Building webpack bundles...');
	cd(paths.package);
	exec(`npm run build`);

	echo('--> Building commonjs and typings using tsc...');
	exec(`node ./node_modules/typescript/bin/tsc`);

	echo('<-- done!');
}