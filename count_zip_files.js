const yauzl = require('yauzl');
const path = require('path');

function countZipFiles(zipPath) {
  return new Promise((resolve, reject) => {
    let fileCount = 0;
    
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      
      zipfile.readEntry();
      
      zipfile.on('entry', (entry) => {
        if (!entry.fileName.endsWith('/')) {  // Don't count directories
          fileCount++;
        }
        zipfile.readEntry();
      });
      
      zipfile.on('end', () => {
        resolve(fileCount);
      });
      
      zipfile.on('error', reject);
    });
  });
}

// Count files in the clean ZIP
const zipPath = path.join(__dirname, 'Space-Drift-Arena-itchio-clean.zip');

countZipFiles(zipPath)
  .then(count => {
    console.log(`Number of files in ZIP: ${count}`);
    if (count <= 1000) {
      console.log('✅ File count is within itch.io limit (≤ 1000)');
    } else {
      console.log('❌ File count exceeds itch.io limit (> 1000)');
    }
  })
  .catch(err => {
    console.error('Error counting ZIP files:', err);
  });