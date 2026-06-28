import fs from 'fs';
import path from 'path';

const imagesDir = path.resolve('public/images');

if (fs.existsSync(imagesDir)) {
  const files = fs.readdirSync(imagesDir);
  files.forEach(file => {
    // Check if filename has trailing spaces or is named exactly with the trailing space
    const trimmed = file.trim();
    let sanitized = file
      .replace(/\s+/g, '_')      // Replace all spaces with underscores
      .replace(/&/g, 'and')      // Replace ampersands with 'and'
      .replace(/’/g, "'");       // Sanitize curly apostrophe if needed, or leave it simple
    
    // Remove consecutive underscores
    sanitized = sanitized.replace(/_+/g, '_');
    
    if (file !== sanitized) {
      const oldPath = path.join(imagesDir, file);
      const newPath = path.join(imagesDir, sanitized);
      
      console.log(`Renaming: "${file}" -> "${sanitized}"`);
      try {
        if (fs.existsSync(newPath)) {
          fs.unlinkSync(oldPath); // avoid collision if it already exists
        } else {
          fs.renameSync(oldPath, newPath);
        }
      } catch (err) {
        console.error(`Failed to rename ${file}:`, err);
      }
    }
  });
}
