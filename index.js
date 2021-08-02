#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path =require('path');
const opn = require('better-opn');
const packageJSON = require('./package.json');
const serve = require('./serve');

function checkFodlerValid(folder) {
    if (path.isAbsolute(folder) && fs.existsSync(folder)) {
        if (fs.statSync(folder).isDirectory()) {
            return folder;
        }
        return false;
    }
    const fullPath = path.resolve(process.cwd(), folder);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        return fullPath;
    }
    return false;
}

program.version(packageJSON.version)
    .name('host-your-folder')
    .usage('[folder]')
    .option('-p, --port <port>', 'if special the port will be fixed')
    .arguments('[folder]')
    .action(function(folder = process.cwd()) {
        const fullPath = checkFodlerValid(folder);
        if (!fullPath) {
            console.error(`${folder} is not a valid directory`);
            process.exit(1);
        }

        serve(fullPath, program.port, function(address) {
            opn(`http://localhost:${address.port}`)
        });
    })
    .parse(process.argv)
