const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// List of essential files and directories for the game
const essentialPaths = [
  'index.html',
  'favicon.svg',
  'styles/',
  'js/',
  'assets/backgrounds/',
  'assets/characters/free/',
  'assets/characters/premium/',
  'assets/sounds/',
  'assets/ui/',
  'assets/weapons/',
  'server/'
];

// Function to get all files in a directory recursively
function getAllFiles(dirPath, arrayOfFiles) {
  try {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  } catch (err) {
    console.error('Error reading directory:', dirPath, err);
    return arrayOfFiles || [];
  }
}

// Main packaging function
async function packageGame() {
  const outputPath = path.join(__dirname, 'Space-Drift-Arena-itchio.zip');
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Listen for all archive data to be written
  output.on('close', function() {
    console.log(`Game packaged successfully! Created ${outputPath}`);
    console.log(`Package size: ${archive.pointer()} bytes`);
  });

  // Catch warnings during archiving
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn('Warning during packaging:', err);
    } else {
      throw err;
    }
  });

  // Catch errors during archiving
  archive.on('error', function(err) {
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Add essential files and directories
  for (const essentialPath of essentialPaths) {
    const fullPath = path.join(__dirname, essentialPath);
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        // Add directory
        archive.directory(fullPath, essentialPath);
        console.log(`Added directory: ${essentialPath}`);
      } else {
        // Add file
        archive.file(fullPath, { name: essentialPath });
        console.log(`Added file: ${essentialPath}`);
      }
    } else {
      console.log(`Warning: Path not found: ${essentialPath}`);
    }
  }

  // Finalize the archive
  await archive.finalize();
}

// Run the packaging function
packageGame().catch(console.error);