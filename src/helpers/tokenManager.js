const fs = require('fs');
const path = require('path');

const tokenPath = path.join(__dirname, '../../self/token.txt');

function saveToken(token) {
    fs.writeFileSync(tokenPath, token, 'utf-8');
}

function getToken() {
    if (!fs.existsSync(tokenPath)) return null;
    return fs.readFileSync(tokenPath, 'utf-8').trim();
}

module.exports = { saveToken, getToken };
