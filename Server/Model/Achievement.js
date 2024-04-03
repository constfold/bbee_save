"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelAchievement = void 0;
const DataSave_1 = require("../../Core/DataSave");
const pbdef_1 = require("../../Gen/pbdef");
// const Task_1 = require("../../Server/Module/Task");
class ModelAchievement extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.STAchievementInfo.create();
        super();
        super.init(t);
        // Task_1.TaskUtil.RegisterTaskGetter(pbdef_1.ETaskScope.Achievement, this.GetAchievement.bind(this));
    }
    static get Instance() {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }
    Initialize(saveId) {
        super.Initialize(saveId);
        this.data.playerId = saveId;
        this.data.achievements = {};
    }
    GetAchievement(id) {
        let isNew = false;
        if (!(id in this.data.achievements)) {
            this.data.achievements[id] = pbdef_1.STAchievement.create({
                id: id,
                progress: 0,
                state: pbdef_1.EAchievementState.Unfinished,
            });
            isNew = true;
        }
        let ach = this.data.achievements[id];
        return { task: ach, isNew: isNew };
    }
}
exports.ModelAchievement = ModelAchievement;
//# sourceMappingURL=Achievement.js.map