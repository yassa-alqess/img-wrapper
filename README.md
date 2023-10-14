# img-wrapper


I had an issue with that ton of screenshots that I take everyday, the probelem gets bigger when it comes to looking up..
by grouping them based on their capture date and compressing them into daily zip files, that made me releaved.

## Usage
Ensure you have Node.js installed on your system.

Clone this repository to your local machine.

Configure the script by setting environment variables in the .env file or directly in the code (see Configuration).

Run the script using npm start or node core.js (for a better development experience use npm debug).

The script will organize and compress your screenshot images, creating daily zip archives.

Find the organized zip files in the specified output directory.

=> Note:
my script gurantee that those imgs contains/matches (yyyy-mm-dd) data-alike-format

## Structure
```bash
root/
├── lib/
│   ├── workers.js
│   ├── compress.js
├── core.js
├── package.json
├── .env
├── .cronjob
├── node_modules/
├── README.md
```
