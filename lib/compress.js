// Dependencies
import archiver from 'archiver';
import fs from 'fs/promises'
import { createWriteStream } from 'fs'
import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
const debug = util.debuglog('compress');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '/../.env') });



/**
 * 
 * @param {*} filePath 
 * @returns {Promise<void>}
*/
const _fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}


/**
 * 
 * @param {*} imagePath 
 * @returns {Promise<void>}
 *
*/
const _truncateFile = async (filePath) => {
  filePath = typeof (filePath) === 'string' && filePath.trim().length > 0 ? filePath.trim() : false;
  if (!filePath) {
    debug('Missing required parameters');
    return Promise.reject(new Error('Missing required parameters'));
  }

  try {
    await fs.unlink(filePath);
    debug(`Deleted original image: ${filePath}`);
  }
  catch (err) {
    debug('\x1b[31m%s\x1b[0m', `Error: ${err}`);
    throw err; //catching later
  }
}



/**
 * this function is gonna take all the images in the inputDir and group them by day
 * and then compress them into a zip file.
 * 
 * @param {*} inputDir 
 * @param {*} outputDir 
 * 
 * @returns {Promise<void>}
 * 
*/
async function _rotateImages(inputDir, outputDir) {
  inputDir = typeof (inputDir) === 'string' && inputDir.trim().length > 0 ? inputDir.trim() : false;
  outputDir = typeof (outputDir) === 'string' && outputDir.trim().length > 0 ? outputDir.trim() : false;

  if (!inputDir || !outputDir) {
    debug('Missing required parameters');
    return;
  }

  try {
    let files = await fs.readdir(inputDir);
    files = files.filter(file => path.extname(file).toLowerCase() === '.png');
    if (!files || !files.length) {
      debug('No files to compress');
      return;
    }

    // Create a map to organize images by day
    const imagesByDay = new Map();

    for (const file of files) {
      const inputPath = path.join(inputDir, file);

      const match = file.match(/(\d{4}-\d{2}-\d{2})/); // YYYY-MM-DD
      if (!match) continue;

      const dateKey = match[0];
      if (!imagesByDay.has(dateKey)) {
        imagesByDay.set(dateKey, []);
      }

      imagesByDay.get(dateKey).push(inputPath);
    }


    // Compress images for each day
    for (const [date, imagePaths] of imagesByDay) {

      const archiveName = path.join(outputDir, `${date}.zip`);

      // Skip if archive already exists
      if (await _fileExists(archiveName)) {
        debug(`Archive for ${date} already exists. Skipping.`);
        continue;
      }

      const archive = archiver('zip');
      const output = createWriteStream(archiveName);

      archive.pipe(output);

      try {
        for (const imagePath of imagePaths) {
          if (!await _fileExists(imagePath)) {
            debug(`File ${imagePath} does not exist. Skipping.`);
            continue;
          }
          const imageName = path.basename(imagePath);
          archive.file(imagePath, { name: imageName });

          //delete original image
          await _truncateFile(imagePath);
        }
        debug(`Compressed images for ${date} into ${archiveName}`);
        await archive.finalize();
      } catch (err) {
        debug('\x1b[31m%s\x1b[0m', `Error: ${err}`);
        await _truncateFile(archiveName);
      }
    }
  } catch (err) {
    debug('\x1b[31m%s\x1b[0m', `Error: ${err}`);
  }
}

export const init = async () => {
  const inputDirectory = process.env.IN_DIR || path.join(__dirname, '/../../');
  const outputDirectory = process.env.OUT_DIR || path.join(__dirname, '/../../data', '/.img');

  //check if the defined output dir exists, if not create it.
  if (!await _fileExists(outputDirectory)) {
    debug('Creating output directory');
    await fs.mkdir(outputDirectory, { recursive: true });
  }
  await _rotateImages(inputDirectory, outputDirectory);
}

