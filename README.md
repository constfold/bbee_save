# Blazblue Entropy Effect Save Editor
This is a save editor for the amazing ACT game [Blazblue Entropy Effect](https://store.steampowered.com/app/2273430/BlazBlue_Entropy_Effect/).

## How to use
Due to a bug of `node-lz4` library, you need to install [my fork](https://github.com/constfold/node-lz4) of it.

After installing dependencies, you should modify the `savePath` variable in `main.js` to point to your save file. Usually it's located at `C:\Users\<username>\AppData\LocalLow\91Act\BlazblueEntropyEffect\Steam\<userid>\Save`.

Then you can run the script with `node main.js`. It contains two functions: `readSave` and `writeSave`. The save data is in `save.json` after running `readSave`, and you can modify it to your liking. After that, you can run `writeSave` to write the modified data back to the save file.

## Disclaimer
Code here is from the game(with some modifications to make it work without `puerts`). , and I don't own this code and copyright of the code belongs to the game' developer.

Also, I'm not responsible for any damage caused by using this repository. It's for fair use only.
