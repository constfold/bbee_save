"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTutorial = void 0;
const DataSave_1 = require("../../Core/DataSave");
const Util_1 = require("../../Core/Util");
const pbdef_1 = require("../../Gen/pbdef");
// const Xlsx_1 = require("../../Gen/Xlsx");
// const ServerUtils_1 = require("../../Server/ServerUtils");
const Player_1 = require("./Player");
class ModelTutorial extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.SMPlayerTutorial.create();
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
        this.data.playerId = saveId;
    }
    get FinishedSteps() {
        return this.data.tutorialSteps;
    }
    get RewardedSteps() {
        return this.data.rewardedSteps;
    }
    FinishSteps(stepInfo, ret) {
        this.data.tutorialSteps = Util_1.U.DeepCopy(stepInfo);
        let addResource = [];
        for (let progIndex in stepInfo) {
            let progValue = stepInfo[progIndex];
            if ((this.data.rewardedSteps[progIndex] || 0) >= progValue) {
                continue;
            }
            this.data.rewardedSteps[progIndex] = progValue;
            let tutorialRewardConf = Xlsx_1.Xlsx.GuideOpenRewardConf.Get(progIndex, progValue, 3);
            if (!tutorialRewardConf) {
                continue;
            }
            if (tutorialRewardConf.rewards.length == 0) {
                continue;
            }
            addResource.push(tutorialRewardConf.rewards);
        }
        Player_1.ModelPlayer.Instance.AddResource(pbdef_1.EResourceChangeReason.TutorialReward, 0, ...addResource);
        ret.resChange = Util_1.U.DeepCopy(Player_1.ModelPlayer.Instance.GetChangePack());
        ret.finishedSteps = Util_1.U.DeepCopy(this.data.tutorialSteps);
        ret.rewardedSteps = Util_1.U.DeepCopy(this.data.rewardedSteps);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    IsConsciousOpen() {
        return (this.FinishedSteps["ConsciousLevel"] ?? 0) == 1;
    }
}
exports.ModelTutorial = ModelTutorial;
//# sourceMappingURL=Tutorial.js.map