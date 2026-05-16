const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');
const configPath = path.join(srcDir, 'config.js');

fs.writeFileSync(configPath, 'export const API_BASE_URL = "http://10.1.0.125:5000";\n');

function updateFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updateFiles(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://192.168.1.101:5000')) {
                // Calculate relative path to config.js
                const relPath = path.relative(path.dirname(fullPath), configPath).replace(/\\/g, '/');
                const importStat = `import { API_BASE_URL } from '${relPath.startsWith('.') ? relPath : './' + relPath}';\n`;

                content = importStat + content;
                // Replace strictly 'http://...:5000' with API_BASE_URL + '...' if it's inside a fetch call
                // Assuming format like fetch('http://192.168.1.101:5000/api/...')
                content = content.replace(/['"`]http:\/\/192\.168\.1\.101:5000([^'"`]*)['"`]/g, '`${API_BASE_URL}$1`');

                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + file);
            }
        }
    });
}

updateFiles(srcDir);
