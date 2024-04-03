"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelQuest = void 0;
// const DataBinding_1 = require("../../DataBinding");
const DataSave_1 = require("../../Core/DataSave");
const Util_1 = require("../../Core/Util");
// const ServerUtils_1 = require("../../Server/ServerUtils");
// const Common_1 = require("../../Server/Module/Common");
// const Xlsx_1 = require("../../Gen/Xlsx");
const pbdef_1 = require("../../Gen/pbdef");
const Player_1 = require("./Player");
const BattleChallenge_1 = require("./BattleChallenge");
// const Misc_1 = require("../../Misc");
// const csharp_1 = require("csharp");
// const macros_1 = require("../../macros");
class ModelQuest extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.SMPlayerQuest.create();
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
    get Quests() {
        return this.data.quests;
    }
    GetCurrentQuestInfo() {
        let quests = [];
        let rewardQuestId = [];
        let needInit = true;
        for (let questId in this.data.quests) {
            needInit = false;
            let quest = this.data.quests[questId];
            if (quest.state == pbdef_1.EQuestState.None)
                continue;
            if (quest.state == pbdef_1.EQuestState.Reward) {
                rewardQuestId.push(parseInt(questId));
                continue;
            }
            quests.push(Util_1.U.DeepCopy(quest));
        }
        if (needInit && Misc_1.Misc.questMisc?.initQuestId) {
            let conf = Xlsx_1.Xlsx.QuestConf.Get(Misc_1.Misc.questMisc.initQuestId);
            if (conf) {
                this.Take(Misc_1.Misc.questMisc.initQuestId);
                let quest = this.data.quests[Misc_1.Misc.questMisc.initQuestId];
                if (quest)
                    quests.push(Util_1.U.DeepCopy(quest));
            }
        }
        return [quests, rewardQuestId];
    }
    HasQuest() {
        for (let conf of Xlsx_1.Xlsx.QuestConf.All) {
            let quest = this.data.quests[conf.id];
            if (!quest || quest.state != pbdef_1.EQuestState.Reward) {
                return true;
            }
        }
        return false;
    }
    GetQuestState(questId) {
        let quest = this.data.quests[questId];
        if (quest === undefined) {
            return pbdef_1.EQuestState.None;
        }
        else {
            return quest?.state;
        }
    }
    GetQuestProgress(questId) {
        let progress = [];
        let conf = Xlsx_1.Xlsx.QuestConf.Get(questId);
        if (!conf) {
            return progress;
        }
        let quest = this.data.quests[questId];
        if (quest === undefined) {
            for (let i = 0; i < conf.target.length; i++) {
                progress[i] = 0;
            }
        }
        else {
            progress = quest.progress.slice();
            for (let i = 0; i < conf.target.length; i++) {
                progress[i] = 0;
            }
        }
        return progress;
    }
    GetQuestNeedFinishPrompt(questId) {
        let quest = this.data.quests[questId];
        if (quest === undefined) {
            return false;
        }
        else {
            return quest?.needFinishPrompt;
        }
    }
    preQuestComplete(preQuestId) {
        if (preQuestId) {
            let preQuest = this.data.quests[preQuestId];
            if (preQuest === undefined || preQuest.state != pbdef_1.EQuestState.Reward) {
                return false;
            }
        }
        return true;
    }
    QuestNeedUnlock(questId) {
        let conf = Xlsx_1.Xlsx.QuestConf.Get(questId);
        if (!conf) {
            return false;
        }
        if (!this.preQuestComplete(conf.preQuestId)) {
            return false;
        }
        let quest = this.data.quests[questId];
        if (quest && quest.state != pbdef_1.EQuestState.None) {
            return false;
        }
        return Common_1.CommonUtils.CheckUnlocked(conf.unlock);
    }
    initQuestProgress(quest) {
        let conf = Xlsx_1.Xlsx.QuestConf.Get(quest.questId);
        if (!conf) {
            return;
        }
        for (let i = 0; i < conf.target.length; i++) {
            quest.progress[i] = 0;
        }
    }
    createQuest(questId) {
        let quest = pbdef_1.STQuest.create({
            questId: questId,
        });
        this.initQuestProgress(quest);
        this.data.quests[questId] = quest;
        return quest;
    }
    UnlockQuest(questId) {
        let quest = this.data.quests[questId];
        if (quest === undefined) {
            quest = this.createQuest(questId);
        }
        quest.state = pbdef_1.EQuestState.Unlock;
        quest.takeTimestamp = 0;
        quest.needFinishPrompt = false;
        return quest;
    }
    createQuestTargetRecord(targetType) {
        let targetRecord = pbdef_1.QuestTargetRecord.create();
        this.data.targetRecords[targetType] = targetRecord;
        return targetRecord;
    }
    GetCreateQuestTargetRecord(targetType) {
        let targetRecord = this.data.targetRecords[targetType];
        if (!targetRecord)
            targetRecord = this.createQuestTargetRecord(targetType);
        return targetRecord;
    }
    AddTargetRecordQuestId(targetRecord, questId) {
        if (!targetRecord.questIds.includes(questId)) {
            targetRecord.questIds.push(questId);
        }
    }
    refreshTargetRecord(target, questId) {
        let targetRecord = this.data.targetRecords[target.type];
        if (!targetRecord)
            return;
        let start = targetRecord.questIds.indexOf(questId);
        if (start >= 0)
            targetRecord.questIds.splice(start, 1);
        if (targetRecord.questIds.length == 0)
            delete this.data.targetRecords[target.type];
    }
    setProgress(quest, index, progress, target) {
        quest.progress[index] = Math.min(progress, target.maxProgress);
        return progress >= target.maxProgress;
    }
    SetQuestFinish(quest, finished) {
        if (finished) {
            console.info("Quest", `quest ${quest.questId} finish, preState:${pbdef_1.EQuestState[quest.state]}`);
            if (quest.state != pbdef_1.EQuestState.Finished)
                DataBinding_1.DB.Quest.Finished.Notify(quest.questId);
            quest.state = pbdef_1.EQuestState.Finished;
            const initQuestId = Misc_1.Misc.questMisc?.initQuestId;
            if (!initQuestId || quest.questId != initQuestId)
                quest.needFinishPrompt = true;
        }
    }
    updateQuestProgress(quest, targets) {
        let finished = true;
        for (let i = 0; i < targets.length; i++) {
            let target = targets[i];
            switch (target.type) {
                case pbdef_1.EQuestTargetType.NpcDialog: {
                    quest.progress[i] = target.maxProgress;
                    break;
                }
                case pbdef_1.EQuestTargetType.ConsciousUpToMlevel: {
                    if (!this.setProgress(quest, i, Player_1.ModelPlayer.Instance.GetConsciousLevel(), target))
                        finished = false;
                    break;
                }
                case pbdef_1.EQuestTargetType.OwnMfesActorWithScoreGeP0: {
                    let params = Util_1.U.ParseIntStrings(target.params);
                    let score = params.length > 0 ? params[0] : 0;
                    if (!this.setProgress(quest, i, Player_1.ModelPlayer.Instance.GetGeScoreFesActorCount(score), target))
                        finished = false;
                    break;
                }
                case pbdef_1.EQuestTargetType.FinishBattleChallengeP0IdMtimes: {
                    let progress = 0;
                    if (target.params.length > 0) {
                        let challengeId = parseInt(target.params[0]);
                        progress = BattleChallenge_1.ModelBattleChallenge.Instance.GetChallengeFinishTimes(challengeId);
                    }
                    else {
                        progress = target.maxProgress;
                    }
                    if (!this.setProgress(quest, i, progress, target))
                        finished = false;
                    break;
                }
                case pbdef_1.EQuestTargetType.OwnMconsciousCrystal: {
                    if (!this.setProgress(quest, i, Player_1.ModelPlayer.Instance.GetConsciousCrystalCount(), target))
                        finished = false;
                    break;
                }
                case pbdef_1.EQuestTargetType.OwnMavatar: {
                    if (!this.setProgress(quest, i, Player_1.ModelPlayer.Instance.GetOwnAvatarCount(), target))
                        finished = false;
                    break;
                }
                case pbdef_1.EQuestTargetType.SelectMdiffrentBless: {
                    let targetRecord = this.data.targetRecords[target.type];
                    if (!targetRecord) {
                        targetRecord = this.createQuestTargetRecord(target.type);
                        let ids = Player_1.ModelPlayer.Instance.GetSelectedBless();
                        targetRecord.records.push(...ids.map((b) => b.toString()));
                    }
                    this.AddTargetRecordQuestId(targetRecord, quest.questId);
                    if (!this.setProgress(quest, i, targetRecord.records.length, target))
                        finished = false;
                    break;
                }
                case pbdef_1.EQuestTargetType.UnlockMbaseActor: {
                    if (!this.setProgress(quest, i, Player_1.ModelPlayer.Instance.GetOwnBaseActorCount(), target))
                        finished = false;
                    break;
                }
                case pbdef_1.EQuestTargetType.TotalGetMdifferentPotential: {
                    if (!this.setProgress(quest, i, Player_1.ModelPlayer.Instance.GetPotentialRecordCount(), target))
                        finished = false;
                    break;
                }
                default: {
                    finished = false;
                    break;
                }
            }
        }
        this.SetQuestFinish(quest, finished);
    }
    Take(questId) {
        let conf = Xlsx_1.Xlsx.QuestConf.Get(questId);
        if (!conf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `quest conf ${questId} not found`);
        }
        let quest = this.data.quests[questId];
        if (quest === undefined) {
            if (this.preQuestComplete(conf.preQuestId) && Common_1.CommonUtils.CheckUnlocked(conf.unlock)) {
                quest = this.createQuest(questId);
                quest.state = pbdef_1.EQuestState.InProgress;
                quest.takeTimestamp = Number(csharp_1.NOAH.GameTime.utc);
                this.updateQuestProgress(quest, conf.target);
            }
        }
        else {
            if (quest.state == pbdef_1.EQuestState.Unlock) {
                quest.state = pbdef_1.EQuestState.InProgress;
                quest.takeTimestamp = Number(csharp_1.NOAH.GameTime.utc);
                this.updateQuestProgress(quest, conf.target);
            }
        }
        return ServerUtils_1.ServerUtils.MakeRet(true, 0, "");
    }
    isTargetAchieve(conf, quest) {
        for (let i = 0; i < conf.target.length; i++) {
            let target = conf.target[i];
            if (target.type != pbdef_1.EQuestTargetType.NpcDialog) {
                let progress = i < quest.progress.length ? quest.progress[i] : 0;
                if (progress < target.maxProgress) {
                    return false;
                }
            }
        }
        return true;
    }
    HandIn(questId) {
        let conf = Xlsx_1.Xlsx.QuestConf.Get(questId);
        if (!conf) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `quest conf ${questId} not found`) };
        }
        let quest = this.data.quests[questId];
        if (quest === undefined) {
            if (this.preQuestComplete(conf.preQuestId) && Common_1.CommonUtils.CheckUnlocked(conf.unlock)) {
                quest = this.createQuest(questId);
                quest.state = pbdef_1.EQuestState.Unlock;
            }
        }
        if (quest && (quest.state == pbdef_1.EQuestState.Finished || this.isTargetAchieve(conf, quest))) {
            quest.state = pbdef_1.EQuestState.Reward;
            quest.needFinishPrompt = false;
            Player_1.ModelPlayer.Instance.AddResource(pbdef_1.EResourceChangeReason.Quest, questId, ...conf.reward);
            for (let conf of Xlsx_1.Xlsx.QuestConf.All) {
                if (conf.preQuestId != questId) {
                    continue;
                }
                if (this.QuestNeedUnlock(conf.id)) {
                    this.UnlockQuest(conf.id);
                }
            }
            for (let target of conf.target) {
                this.refreshTargetRecord(target, questId);
            }
        }
        return { ret: ServerUtils_1.ServerUtils.MakeRet(true, 0, ""), resChg: Util_1.U.DeepCopy(Player_1.ModelPlayer.Instance.GetChangePack()) };
    }
    FinishPrompted(questIds) {
        let promptedQuestId = [];
        for (let questId of questIds) {
            let quest = this.data.quests[questId];
            if (quest && quest.state == pbdef_1.EQuestState.Finished) {
                quest.needFinishPrompt = false;
                promptedQuestId.push(questId);
            }
        }
        return promptedQuestId;
    }
    ResetProgress(questId, index) {
        let quest = this.data.quests[questId];
        quest.progress[index] = 0;
        for (let i = index - 1; i >= 0; i--) {
            if (quest.progress[i] == undefined) {
                quest.progress[i] = 0;
            }
            else {
                break;
            }
        }
    }
    QuestDebug(questId, questState, targetIndex, targetProgress) {
        if (!macros_1.USING_GMTOOL && !macros_1.UNITY_EDITOR)
            return;
        let conf = Xlsx_1.Xlsx.QuestConf.Get(questId);
        if (!conf) {
            console.info("QuestDebug", `Quest ${questId} conf not exists`);
            return [false, "invalid quest id"];
        }
        let msg = "";
        let needRefresh = true;
        let needRefreshTargetRecord = false;
        let quest = this.data.quests[questId];
        this.QuestOutput(questId);
        switch (questState) {
            case pbdef_1.EQuestState.None: {
                if (quest) {
                    needRefreshTargetRecord = true;
                    delete this.data.quests[questId];
                    console.info("QuestDebug", `Delete quest ${questId}`);
                }
                else {
                    msg = "quest have not";
                    needRefresh = false;
                }
                break;
            }
            case pbdef_1.EQuestState.Unlock: {
                if (quest) {
                    this.initQuestProgress(quest);
                    quest.takeTimestamp = 0;
                }
                quest = this.UnlockQuest(questId);
                needRefreshTargetRecord = true;
                console.info("QuestDebug", `Unlock quest: ${JSON.stringify(quest)}`);
                break;
            }
            case pbdef_1.EQuestState.InProgress: {
                for (let i = 0; i < conf.target.length; i++) {
                    msg = "invalid quest state";
                }
                if (!quest)
                    quest = this.UnlockQuest(questId);
                quest.needFinishPrompt = false;
                if (quest.state != pbdef_1.EQuestState.InProgress) {
                    this.Take(questId);
                }
                if (targetIndex < 0 || targetIndex >= conf.target.length)
                    msg = "invalid target index";
                let finished = true;
                let hasNonDialogTarget = false;
                for (let i = 0; i < conf.target.length; i++) {
                    let target = conf.target[i];
                    if (target.type == pbdef_1.EQuestTargetType.NpcDialog) {
                        if (targetProgress != target.maxProgress) {
                            return [false, "dialog target can not set progress except maxProgress"];
                        }
                    }
                    else {
                        hasNonDialogTarget = true;
                    }
                    if (i == targetIndex) {
                        if (!this.setProgress(quest, targetIndex, targetProgress, target))
                            finished = false;
                        msg = `set quest target ${targetIndex} progress ${quest.progress[targetIndex]}`;
                    }
                    else {
                        let progress = i < quest.progress.length ? quest.progress[i] : 0;
                        if (progress < target.maxProgress)
                            finished = false;
                    }
                }
                if (conf.target.length > 0 && !hasNonDialogTarget) {
                    return [false, "dialog quest can not set InProgress state"];
                }
                this.SetQuestFinish(quest, finished);
                if (finished)
                    msg = msg == "" ? "quest finished" : `${msg}, quest finished`;
                console.info("QuestDebug", `Take quest: ${JSON.stringify(quest)}`);
                break;
            }
            case pbdef_1.EQuestState.Finished: {
                if (!quest)
                    quest = this.UnlockQuest(questId);
                for (let i = 0; i < conf.target.length; i++) {
                    let target = conf.target[i];
                    this.setProgress(quest, i, target.maxProgress, target);
                }
                this.SetQuestFinish(quest, true);
                console.info("QuestDebug", `Finish quest: ${JSON.stringify(quest)}`);
                break;
            }
            case pbdef_1.EQuestState.Reward: {
                if (!quest)
                    quest = this.UnlockQuest(questId);
                this.SetQuestFinish(quest, true);
                this.HandIn(questId);
                console.info("QuestDebug", `HandIn quest: ${JSON.stringify(quest)}`);
                break;
            }
            default: {
                msg = "invalid quest state";
                needRefresh = false;
            }
        }
        if (needRefreshTargetRecord) {
            for (let target of conf.target) {
                this.refreshTargetRecord(target, questId);
            }
        }
        return [needRefresh, msg];
    }
    QuestOutput(questId) {
        if (!macros_1.USING_GMTOOL && !macros_1.UNITY_EDITOR)
            return;
        if (questId <= 0) {
            console.info("QuestDebug", `All Quest data: ${JSON.stringify(this.data)}`);
        }
        else {
            let conf = Xlsx_1.Xlsx.QuestConf.Get(questId);
            if (!conf) {
                console.info("QuestDebug", `Quest ${questId} conf not exists`);
                return;
            }
            let quest = this.data.quests[questId];
            if (quest) {
                console.info("QuestDebug", `Quest ${questId} data: ${JSON.stringify(quest)}`);
            }
            else {
                console.info("QuestDebug", `Quest ${questId} have not`);
            }
        }
    }
}
exports.ModelQuest = ModelQuest;
//# sourceMappingURL=Quest.js.map