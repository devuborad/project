const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'dashboard');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace \` with `
  content = content.replace(/\\`/g, '`');
  // Replace \${ with ${
  content = content.replace(/\\\${/g, '${');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${path.basename(filePath)}`);
  }
}

function scanDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      fixFile(fullPath);
    }
  }
}

scanDir(dir);
console.log('Done fixing syntax errors.');
