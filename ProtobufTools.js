"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildXlsx = exports.PBEncode = exports.PBDecode = exports.GetPBTypeByName = void 0;
// const csharp_1 = require("csharp");
const minimal_1 = require("./protobufjs/minimal");
const pb = require("./Gen/pbdef");
// const macros_1 = require("./macros");
const deepFind = function (obj, path) {
    let paths = path.split('.'), current = obj, i = 0;
    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] == undefined) {
            return undefined;
        }
        else {
            current = current[paths[i]];
        }
    }
    return current;
};
const GetName = function (classDefOrStr) {
    if (typeof classDefOrStr == 'string') {
        return classDefOrStr;
    }
    else {
        return classDefOrStr.name;
    }
};
function GetPBTypeByName(name) {
    return deepFind(pb, name);
}
exports.GetPBTypeByName = GetPBTypeByName;
function PBDecode(nameOrClass, arr) {
    try {
        if (typeof nameOrClass == "string") {
            return GetPBTypeByName(nameOrClass).decode(new Uint8Array(arr));
        }
        else {
            return nameOrClass.decode(new Uint8Array(arr));
        }
    }
    catch (e) {
        console.error("Protobuf", `${e}  PBType: ${GetName(nameOrClass)} `);
        return new nameOrClass();
    }
}
exports.PBDecode = PBDecode;
function PBEncode(message) {
    let writer = message.constructor.encode(message);
    return writer?.finish();
}
exports.PBEncode = PBEncode;
function BuildXlsx(xlsxType, pbType, pks) {
    let path = "Data/Xlsx/" + pbType.name;
    try {
        let bytes = csharp_1.NOAH.Asset.AssetManagerBase.Instance?.GetBytes(path);
        if (bytes == null && macros_1.UNITY_EDITOR) {
            const File = csharp_1.System.IO.File;
            path = `Assets/AssetBundle/${path}.bytes`;
            if (File.Exists(path)) {
                bytes = File.ReadAllBytes(path);
            }
        }
        if (bytes != null) {
            var arrBuffer = csharp_1.Js.JsUtil.ToArrayBuffer(bytes);
            var jsBytes = new Uint8Array(arrBuffer);
            var view = new DataView(arrBuffer, 0);
            for (let reader = minimal_1.Reader.create(jsBytes); reader.pos < reader.len;) {
                let len = view.getInt32(reader.pos, true);
                xlsxType.All.push(pbType.decode(reader.skip(4), len));
            }
            BuildIndexed(xlsxType, pks);
        }
        else {
            console.warn("Xlsx", `Xlsx Data Not Found: "${pbType.name}"`);
        }
    }
    catch (e) {
        console.error("Xlsx", `Xlsx read failed: "${pbType.name}", ${path}, ${e}`);
    }
    return xlsxType;
}
exports.BuildXlsx = BuildXlsx;
function BuildIndexed(xlsxType, pks) {
    for (let row of xlsxType.All) {
        let curMap = xlsxType.Indexes;
        for (let i = 0; i < pks.length; i++) {
            let pk = row[pks[i]];
            if (i == pks.length - 1) {
                curMap.set(pk, row);
            }
            else {
                curMap = curMap.get(pk) || (curMap.set(pk, new Map()).get(pk));
            }
        }
    }
}
//# sourceMappingURL=ProtobufTools.js.map