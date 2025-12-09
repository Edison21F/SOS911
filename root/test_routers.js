const fs = require('fs');
const path = require('path');

const routerDir = path.join(__dirname, '../src/infrastructure/http/router');
const logFile = path.join(__dirname, '../diagnostics_result.txt');
fs.writeFileSync(logFile, 'Starting diagnostics...\n');
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

fs.readdir(routerDir, (err, files) => {
    if (err) {
        log('Could not list router dir: ' + err);
        return;
    }
    files.forEach(file => {
        if (file.endsWith('.router.js')) {
            const fullPath = path.join(routerDir, file);
            try {
                log(`Testing ${file}...`);
                require(fullPath);
                log(`PASSED ${file}`);
            } catch (e) {
                log(`FAILED ${file}: ${e.message}`);
            }
        }
    });
});
