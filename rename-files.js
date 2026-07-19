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
      .replace(/’/g, "'");       // Sanitize curly apostrophe if needed, or leave it simple
    
    // Remove consecutive underscores
    sanitized = sanitized.replace(/_+/g, '_');
    
    if (file !== sanitized) {
      const oldPath = path.join(imagesDir, file);
      const newPath = path.join(imagesDir, sanitized);
      
      console.log(`Copying/Ensuring: "${file}" -> "${sanitized}"`);
      try {
        if (!fs.existsSync(newPath)) {
          fs.copyFileSync(oldPath, newPath);
        }
      } catch (err) {
        console.error(`Failed to copy ${file}:`, err);
      }
    }
  });

  // Self-healing: ensure Bloom_&_Bliss.webp always exists as a copy of Bloom_and_Bliss.webp if missing
  const pathAnd = path.join(imagesDir, 'Bloom_and_Bliss.webp');
  const pathAmp = path.join(imagesDir, 'Bloom_&_Bliss.webp');
  if (fs.existsSync(pathAnd) && !fs.existsSync(pathAmp)) {
    try {
      fs.copyFileSync(pathAnd, pathAmp);
      console.log('Successfully restored/created Bloom_&_Bliss.webp from Bloom_and_Bliss.webp');
    } catch (err) {
      console.error('Failed to copy Bloom_&_Bliss.webp:', err);
    }
  }
}
