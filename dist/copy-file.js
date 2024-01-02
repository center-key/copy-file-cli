//! copy-file-util v1.1.3 ~~ https://github.com/center-key/copy-file-util ~~ MIT License

import chalk from 'chalk';
import fs from 'fs';
import log from 'fancy-log';
import path from 'path';
import slash from 'slash';
const copyFile = {
    cp(sourceFile, options) {
        const defaults = {
            cd: null,
            targetFile: null,
            targetFolder: null,
            fileExtension: null,
            move: false,
        };
        const settings = { ...defaults, ...options };
        const startTime = Date.now();
        const missingTarget = !settings.targetFile && !settings.targetFolder;
        const ambiguousTarget = !!settings.targetFile && !!settings.targetFolder;
        const normalize = (folder) => !folder ? '' : slash(path.normalize(folder)).replace(/\/$/, '');
        const startFolder = settings.cd ? normalize(settings.cd) + '/' : '';
        const source = sourceFile ? normalize(startFolder + sourceFile) : '';
        const sourceExists = source && fs.existsSync(source);
        const sourceIsFile = sourceExists && fs.statSync(source).isFile();
        const sourceFilename = sourceIsFile ? path.basename(source) : null;
        const targetPath = settings.targetFile ? path.dirname(settings.targetFile) : settings.targetFolder;
        const targetFolder = targetPath ? normalize(startFolder + targetPath) : null;
        const targetFile = settings.targetFile ?? settings.targetFolder + '/' + sourceFilename;
        const target = normalize(startFolder + targetFile);
        if (targetFolder)
            fs.mkdirSync(targetFolder, { recursive: true });
        const badTargetFolder = !targetFolder || !fs.existsSync(targetFolder);
        const errorMessage = settings.fileExtension ? 'Option "fileExtension" not yet implemented.' :
            !sourceFile ? 'Must specify the source file.' :
                !sourceExists ? 'Source file does not exist: ' + source :
                    !sourceIsFile ? 'Source is not a file: ' + source :
                        missingTarget ? 'Must specify a target file or folder.' :
                            ambiguousTarget ? 'Target cannot be both a file and a folder.' :
                                badTargetFolder ? 'Target folder cannot be written to: ' + targetFolder :
                                    null;
        if (errorMessage)
            throw Error('[copy-file-util] ' + errorMessage);
        if (settings.move)
            fs.renameSync(source, target);
        else
            fs.copyFileSync(source, target);
        return {
            origin: source,
            dest: target,
            moved: settings.move,
            duration: Date.now() - startTime,
        };
    },
    reporter(result) {
        const name = chalk.gray('copy-file');
        const origin = chalk.blue.bold(result.origin);
        const dest = chalk.magenta(result.dest);
        const arrow = chalk.gray.bold('→');
        const info = chalk.white(`(${result.duration}ms${result.moved ? ', move' : ''})`);
        log(name, origin, arrow, dest, info);
        return result;
    },
};
export { copyFile };
