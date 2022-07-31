/*
 * AUTHOR:  Adam Walters
 *
 * CREATED:  11/12/2021
 * MODIFIED: 11/12/2021
 */

const LOG_FILE_NAME = 'session.log';

const fs = require('fs');

let logStream = fs.createWriteStream(LOG_FILE_NAME);
let enabled = true;

function getLogPrefix(typeName) {
	
	// Generate timestamps
	const d = new Date();
	const ds = `${d.getFullYear()}-${('0' + d.getMonth()).slice(-2)}-${('0' + d.getDay()).slice(-2)}`;
	const ts = `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;

    // Return prefix
    return `[${ds} ${ts} | ${('    ' + typeName).slice(-5)}]: `;

}

async function saveToFile(logMsg) {

    // Write to log stream with a newline
    logStream.write(logMsg + '\n');

}

function log(msg, typeName) {

    // Ignore if not enabled
    if (!enabled) {
        return;
    }

    // Assemble message, print, and save
    let logMsg = getLogPrefix(typeName) + msg;
    if (typeName === 'INFO') {
        console.info(logMsg);
    } else if (typeName === 'WARN') {
        console.warn(logMsg);
    } else if (typeName == 'ERROR') {
        console.error(logMsg);
    }
    saveToFile(logMsg);

}

module.exports = {
    info: (msg) => log(msg, 'INFO'),
    warn: (msg) => log(msg, 'WARN'),
    error: (msg) => log(msg, 'ERROR'),
    setEnabled: (value) => { enabled = value; }
}