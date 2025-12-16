const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Function to get all files in a directory recursively
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

// Function to check if a file should be included in the package
function shouldIncludeFile(filePath) {
  const excludedExtensions = ['.git', '.DS_Store', '.zip', '.md', '.txt', '.log', '.tmp', '.bak'];
  const excludedDirs = ['node_modules', '.git', 'temp', 'tests'];
  
  // Check if file is in an excluded directory
  for (const excludedDir of excludedDirs) {
    if (filePath.includes(excludedDir + path.sep)) {
      return false;
    }
  }
  
  // Check if file has an excluded extension
  for (const ext of excludedExtensions) {
    if (filePath.endsWith(ext)) {
      return false;
    }
  }
  
  return true;
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

  // Get all files in the project directory
  const allFiles = getAllFiles(__dirname);
  
  // Add files to the archive
  allFiles.forEach(function(filePath) {
    // Convert to relative path
    const relativePath = path.relative(__dirname, filePath);
    
    // Only include files that should be included
    if (shouldIncludeFile(relativePath)) {
      // Add file to archive with relative path
      archive.file(filePath, { name: relativePath });
      console.log(`Added: ${relativePath}`);
    } else {
      console.log(`Skipped: ${relativePath}`);
    }
  });

  // Finalize the archive
  await archive.finalize();
}

// Run the packaging function
packageGame().catch(console.error);