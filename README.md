# Blazblue Entropy Effect Save Editor
This is a save editor for the amazing ACT game [Blazblue Entropy Effect](https://store.steampowered.com/app/2273430/BlazBlue_Entropy_Effect/).

I noticed that there's [another repository](https://github.com/justlovediaodiao/BlazblueEntropyEffectSaveEditor) for save editing of this game on GitHub, but it seems struggling with the protobuf format. After I decided to give it a try, luckily it turns out that the protobuf definition is right in the game's JS land. So here's this save editor.

## How to use
Due to a bug of `node-lz4` library, we are using [my fork](https://github.com/constfold/node-lz4) of it. You can install it with:
```bash
git submodule update --init --recursive
cd node-lz4
npm install
```

After installing dependencies, you should modify the `SAVE_PATH` variable in `main.js` to point to your save file. Usually it's located at `C:\Users\<username>\AppData\LocalLow\91Act\BlazblueEntropyEffect\Steam\<userid>\Save`.

Then you can run the script with `node main.js`. It contains two functions: `readSave` and `writeSave`. The save data is in `save.json` after running `readSave`, and you can modify it to your liking. After that, you can run `writeSave` to write the modified data back to the save file.

## Disclaimer

> [!Caution]
> Code here is mainly from the game (with some modifications to make it work without `puerts`).
> I don't own any of this code and copyright all belongs to the game' developer.
> Also, I'm not responsible for any damage caused by using this repository. It's for fair use only.
