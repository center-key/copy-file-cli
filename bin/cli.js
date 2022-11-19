#!/usr/bin/env node
////////////////////
// copy-file-util //
// MIT License    //
////////////////////

// Usage in package.json:
//    "scripts": {
//       "pub-license": "copy-file src/LICENSE doc/license.txt"
//    },
//
// Usage from command line:
//    $ npm install --global copy-file-util
//    $ copy-file src/LICENSE doc/license.txt
//
// Contributors to this project:
//    $ cd copy-file-util
//    $ npm install
//    $ npm test
//    $ node bin/cli.js --cd=spec/fixtures source/mock.html --folder target/to-folder
//    $ node bin/cli.js --cd=spec/fixtures source/mock.html target/{{pkg.type}}/{{pkg.name}}-v{{pkg.version}}.html

// Imports
import { cliArgvUtil } from 'cli-argv-util';
import { copyFile } from '../dist/copy-file.js';
import { dna } from 'dna-engine';
import chalk from 'chalk';
import fs    from 'fs';
import log   from 'fancy-log';

// Parameters and flags
const validFlags = ['cd', 'folder', 'note', 'quiet'];
const cli =        cliArgvUtil.parse(validFlags);
const source =     cli.params[0];
const target =     cli.params[1];

// Utilities
const readPackage = () => JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const getPackageField = (match) =>
   dna.util.value({ pkg: readPackage() }, match.replace(/[{}]/g, '')) ?? 'MISSING-FIELD-ERROR';

// Reporting
const printReport = (result) => {
   const name =   chalk.gray('copy-file');
   const origin = chalk.blue.bold(result.origin);
   const dest =   chalk.magenta(result.dest);
   const arrow =  chalk.gray.bold('→');
   const info =   chalk.white(`(${result.duration}ms)`);
   log(name, origin, arrow, dest, info);
   };

// Copy File
const error =
   cli.invalidFlag ?              cli.invalidFlagMsg :
   cli.paramCount > 2 ?           'Extraneous parameter: ' + cli.params[2] :
   !source ?                      'Missing source file.' :
   !target && cli.flagOn.folder ? 'Missing target folder.' :
   !target ?                      'Missing target file.' :
   null;
if (error)
   throw Error('[copy-file-util] ' + error);
const targetKey = cli.flagOn.folder ? 'targetFolder' : 'targetFile';
const options = {
   cd:          cli.flagMap.cd ?? null,
   [targetKey]: target.replace(/{{[^{}]*}}/g, getPackageField),
   };
const result = copyFile.cp(source, options);
if (!cli.flagOn.quiet)
   printReport(result);
