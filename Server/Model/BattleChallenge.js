"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelBattleChallenge = void 0;
const DataSave_1 = require("../../Core/DataSave");
// const ServerUtils_1 = require("../../Server/ServerUtils");
// const Xlsx_1 = require("../../Gen/Xlsx");
const Player_1 = require("./Player");
const Util_1 = require("../../Core/Util");
const PlotDialogue_1 = require("./PlotDialogue");
// const Task_1 = require("../../Server/Module/Task");
// const Quest_1 = require("../../Server/Module/Quest");
const pbdef_1 = require("../../Gen/pbdef");
class ModelBattleChallenge extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.STPlayerBattleChallenge.create();
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
    get Info() {
        if (!this.data.info) {
            this.data.info = pbdef_1.STBattleChallengeInfo.create();
        }
        return this.data.info;
    }
    get CurrentChallenge() {
        if (!this.Info.currentChallenge) {
            this.Info.currentChallenge = pbdef_1.BattleChallenge.create();
        }
        return this.Info.currentChallenge;
    }
    GetInfo() {
        return this.data.info;
    }
    GetCurrentChallenge() {
        let info = this.GetInfo();
        if (!info)
            return null;
        return info.currentChallenge;
    }
    GetCanEnterChallengeRecord() {
        let records = {};
        let recordData = this.data?.info?.records;
        const recordCount = recordData ? Object.keys(recordData).length : 0;
        if (recordCount == 0) {
            let minChallengeId = 0;
            for (let conf of Xlsx_1.Xlsx.BattleChallengeConf.All) {
                if (conf.id < minChallengeId || minChallengeId == 0)
                    minChallengeId = conf.id;
            }
            if (minChallengeId > 0)
                records[minChallengeId] = pbdef_1.BattleChallengeRecord.create();
        }
        else {
            let maxChallengeId = 0;
            for (let id in recordData) {
                const challengeId = parseInt(id);
                if (challengeId > maxChallengeId)
                    maxChallengeId = challengeId;
                records[id] = Util_1.U.DeepCopy(recordData[id]);
            }
            const nextChallengeId = maxChallengeId + 1;
            if (Xlsx_1.Xlsx.BattleChallengeConf.Indexes.has(nextChallengeId))
                records[nextChallengeId] = pbdef_1.BattleChallengeRecord.create();
        }
        return records;
    }
    setCurrentChallenge(challengeId, fesActorUid) {
        this.CurrentChallenge.id = challengeId;
        this.CurrentChallenge.fesActorUid = fesActorUid;
    }
    Enter(challengeId, fesActorUid) {
        let conf = Xlsx_1.Xlsx.BattleChallengeConf.Get(challengeId);
        if (!conf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `challenge conf ${challengeId} not found`);
        }
        const preChallengeId = challengeId - 1;
        if (Xlsx_1.Xlsx.BattleChallengeConf.Indexes.has(preChallengeId) && !(preChallengeId in this.Info.records)) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.PreChallengeNotFinished, `pre challenge ${preChallengeId} not finished`);
        }
        let fesActor = Player_1.ModelPlayer.Instance.GetFesActor(fesActorUid);
        if (fesActor.battleChallengeFinishCount > 0 && !(challengeId in this.Info.records)) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ActorAlreadyUsed, `challenge fesActor ${fesActor.id}:${fesActor.uid} already used`);
        }
        this.setCurrentChallenge(challengeId, fesActorUid);
        return ServerUtils_1.ServerUtils.MakeRet(true, 0, "");
    }
    getCreateRecord(challengeId) {
        let record = this.Info.records[challengeId];
        if (!record) {
            record = pbdef_1.BattleChallengeRecord.create();
            this.Info.records[challengeId] = record;
        }
        return record;
    }
    Balance(finished) {
        const currentChallenge = this.GetCurrentChallenge();
        if (!currentChallenge || currentChallenge.id <= 0) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.NoChallengeActive, `no challenge`) };
        }
        let fesActor = Player_1.ModelPlayer.Instance.GetFesActor(currentChallenge.fesActorUid);
        if (!(currentChallenge.id in this.Info.records)) {
            fesActor.battleChallengeFinishCount += 1;
            Player_1.ModelPlayer.Instance.MakeChange(new pbdef_1.STResource({
                type: pbdef_1.EResourceType.FesActor,
                id: currentChallenge.fesActorUid,
                count: 1,
            }), 0, new pbdef_1.STResourcePayload({ fesActor: fesActor }));
        }
        const challengeId = currentChallenge.id;
        this.setCurrentChallenge(0, 0);
        if (!this.data.firstBalance) {
            this.data.firstBalance = true;
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FirstBalanceBattleChallenge, 1);
        }
        if (!finished)
            return { ret: ServerUtils_1.ServerUtils.MakeRet(true, 0, ""), resChg: Util_1.U.DeepCopy(Player_1.ModelPlayer.Instance.GetChangePack()) };
        let conf = Xlsx_1.Xlsx.BattleChallengeConf.Get(challengeId);
        if (!conf) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `challenge conf ${challengeId} not found`) };
        }
        let record = this.getCreateRecord(challengeId);
        record.finishTimes += 1;
        if (!record.finishActorId.includes(fesActor.id)) {
            record.finishActorId.push(fesActor.id);
            Player_1.ModelPlayer.Instance.AddResource(pbdef_1.EResourceChangeReason.FinishBattleChallenge, challengeId, ...conf.rewards);
        }
        Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishP0IdBattleChallengeMtimes, 1, challengeId);
        Quest_1.QuestUtil.CheckTarget(pbdef_1.EQuestTargetType.FinishBattleChallengeP0IdMtimes, 1, challengeId);
        PlotDialogue_1.ModelPlotDialogue.Instance.ResetCounterpartChatCount();
        return { ret: ServerUtils_1.ServerUtils.MakeRet(true, 0, ""), resChg: Util_1.U.DeepCopy(Player_1.ModelPlayer.Instance.GetChangePack()) };
    }
    GetMaxFinishChallengeId() {
        let maxChallengeId = 0;
        let info = this.GetInfo();
        if (!info)
            return maxChallengeId;
        for (let id in info.records) {
            const challengeId = parseInt(id);
            if (challengeId > maxChallengeId)
                maxChallengeId = challengeId;
        }
        return maxChallengeId;
    }
    GetChallengeFinishTimes(challengeId) {
        let info = this.GetInfo();
        if (!info || !(challengeId in info.records))
            return 0;
        return info.records[challengeId].finishTimes;
    }
}
exports.ModelBattleChallenge = ModelBattleChallenge;
//# sourceMappingURL=BattleChallenge.js.map