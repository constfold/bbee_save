const Buffer = require('buffer').Buffer
const lz4 = require('./node-lz4')
const pbdef_1 = require("./Gen/pbdef");
const ProtobufTools_1 = require("./ProtobufTools");
const ModelManager_1 = require("./Server/Model/ModelManager");

var fs = require('fs')

const readSave = (path) => {
    const compressBytes = fs.readFileSync(path)

    const arrBuffer = lz4.decode(compressBytes, {
        streamChecksum: false,
        streamSize: true,
        blockIndependence: true,
        blockChecksum: false,
        blockMaxSize: 64 << 10 // 64kb
    })

    const ds = (0, ProtobufTools_1.PBDecode)(pbdef_1.DataSave, arrBuffer);

    const archive = ModelManager_1.ServerModel.Deserialize(ds);

    fs.writeFileSync("save.json", JSON.stringify(archive, null, 4))
}

const writeSave = (path) => {
    const archive = JSON.parse(fs.readFileSync("save.json"))

    const ds = ModelManager_1.ServerModel.Serialize(archive)

    const arrBuffer = (0, ProtobufTools_1.PBEncode)(ds);

    const compressBytes = lz4.encode(arrBuffer, {
        streamChecksum: false,
        streamSize: true,
        blockIndependence: true,
        blockChecksum: false,
        blockMaxSize: 64 << 10 // 64kb
    })

    fs.writeFileSync(path, compressBytes)
}

const SAVE_PATH = 'THE://PATH/TO/YOUR_SAVE'

readSave(SAVE_PATH)
writeSave(SAVE_PATH)
