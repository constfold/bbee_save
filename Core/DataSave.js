"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSaveCore = void 0;
const ProtobufTools_1 = require("../ProtobufTools");
const Util_1 = require("./Util");
var DataSaveCore;
(function (DataSaveCore) {
    class DataSaveWrapper {
        data;
        commitData;
        saveId;
        static _instance;
        static NewInstance() {
            this._instance = new this();
            return this._instance;
        }
        init(init) {
            this.data = init;
            this.commitData = Util_1.U.DeepCopy(this.data);
        }
        Initialize(saveId) {
            this.saveId = saveId;
        }
        SerializeToBytes() {
            this.commitData = Util_1.U.DeepCopy(this.data);
            let bytes = (0, ProtobufTools_1.PBEncode)(this.data);
            if (bytes.byteLength == 0) {
                console.log("DataSave", `save ${this.fullName} failed of null data`);
                return null;
            }
            return bytes;
        }
        Recover() {
            this.data = Util_1.U.DeepCopy(this.commitData);
        }
        get Data() {
            return this.data;
        }
        get fullName() {
            return this.data.constructor.name;
        }
        MergeFromBytes(buffer) {
            let ret = (0, ProtobufTools_1.PBDecode)(this.fullName, buffer);
            if (!ret) {
                return false;
            }
            else {
                this.commitData = ret;
                this.data = Util_1.U.DeepCopy(this.commitData);
                return true;
            }
        }
        BytesToJson(bytes) {
            try {
                let data = (0, ProtobufTools_1.PBDecode)(this.fullName, bytes);
                if (data) {
                    return data.toJSON();
                }
                return {};
            }
            catch (err) {
                console.error("Archive", `${this.fullName} to json fail, will preserve data`);
                return;
            }
        }
        JsonToBytes(data) {
            let pbType = (0, ProtobufTools_1.GetPBTypeByName)(this.fullName);
            let message = pbType.fromObject(data);
            return (0, ProtobufTools_1.PBEncode)(message);
        }
        DeserializeFromBytes(bytes) {
            try {
                return (0, ProtobufTools_1.PBDecode)(this.fullName, bytes);
            }
            catch (err) {
                console.error("Archive", `deserialize bytes to pb ${this.fullName} fail`);
                return;
            }
        }
        CustomInherit(fromData, toData) {
            return true;
        }
        InheritField(fromData, toData, fullField) {
            let subField = fullField.split(".");
            let from = fromData;
            let to = toData;
            for (let i = 0; i < subField.length; i++) {
                let name = subField[i];
                if (from.hasOwnProperty(name) && from[name]) {
                    from = from[name];
                    if (i < subField.length - 1) {
                        if (typeof from != "object" || from instanceof Uint8Array || Array.isArray(from)) {
                            console.error("ArchiveInerit", `non leaf sub field ${name} must be pb object, full field ${fullField}`);
                            return false;
                        }
                        if (!to.hasOwnProperty(name)) {
                            to[name] = Util_1.U.CreatePbCopy(from);
                        }
                        to = to[name];
                    }
                    else {
                        to[name] = Util_1.U.DeepCopy(from);
                    }
                }
                else {
                    break;
                }
            }
            return true;
        }
    }
    DataSaveCore.DataSaveWrapper = DataSaveWrapper;
})(DataSaveCore = exports.DataSaveCore || (exports.DataSaveCore = {}));
//# sourceMappingURL=DataSave.js.map