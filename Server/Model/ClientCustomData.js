"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelClientCustomData = void 0;
const DataSave_1 = require("../../Core/DataSave");
const Util_1 = require("../../Core/Util");
const pbdef_1 = require("../../Gen/pbdef");
class ModelClientCustomData extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.STClientCustomData.create();
        super();
        super.init(t);
    }
    static get Instance() {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }
    Initialize(saveId) {
        super.Initialize(saveId);
    }
    Copy() {
        return Util_1.U.DeepCopy(this.data);
    }
    SaveData(d) {
        this.data = pbdef_1.STClientCustomData.create(d);
    }
    IsPassFinalBoss() {
        return this.data.finalBossPass;
    }
    IsPlotDropAfterFinal() {
        return this.data.isPlotDropAfterFinal && this.IsPassFinalBoss();
    }
}
exports.ModelClientCustomData = ModelClientCustomData;
//# sourceMappingURL=ClientCustomData.js.map