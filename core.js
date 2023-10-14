import {init} from './lib/compress.js';

/**
 * @TODO - add deployment task for archived images
*/


(async () => {
  try {
    // intialize the library
    await init();
  }
  catch (err) {
    console.log(err);
  }
})();