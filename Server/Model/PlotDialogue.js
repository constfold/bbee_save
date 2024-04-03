"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPlotDialogue = void 0;
const DataSave_1 = require("../../Core/DataSave");
const Util_1 = require("../../Core/Util");
// const Xlsx_1 = require("../../Gen/Xlsx");
const pbdef_1 = require("../../Gen/pbdef");
const Player_1 = require("./Player");
// const ServerUtils_1 = require("../../Server/ServerUtils");
// const Task_1 = require("../../Server/Module/Task");
// const Common_1 = require("../../Server/Module/Common");
// const Notepad_1 = require("../../Server/Module/Notepad");
// const MessageBoard_1 = require("../../Server/Module/MessageBoard");
const Task_2 = require("./Task");
class ModelPlotDialogue extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.SMPlayerPlotDialogue.create();
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
    get plotDialogue() {
        return this.data.plotDialogue;
    }
    dialogueUnlocked(dialogueId) {
        return dialogueId in this.plotDialogue;
    }
    dialogueResults(id) {
        return this.plotDialogue[id]?.result ?? "";
    }
    dialogueFinished(id) {
        return this.plotDialogue[id]?.finished ?? false;
    }
    checkDialogueUnlock(dialogueConf) {
        return Common_1.CommonUtils.CheckUnlocked(dialogueConf.conditions);
    }
    checkDeletedDialogue() {
        let toRemove = Object.keys(this.plotDialogue).filter((id) => !Xlsx_1.Xlsx.PlotDialogueConf.Get(parseInt(id), 3));
        for (let discardedDialogueId of toRemove) {
            delete this.data.plotDialogue[String(discardedDialogueId)];
            console.warn("Dialogue", `Remove useless ${discardedDialogueId}`);
        }
    }
    checkPlotDialogue() {
        Xlsx_1.Xlsx.PlotDialogueConf.All.forEach((conf) => {
            if (this.dialogueUnlocked(conf.dialogueId)) {
                if (this.IsDialogReject(conf.dialogueId)) {
                    if (!this.data.discardPlots.includes(conf.dialogueId)) {
                        this.data.discardPlots.push(conf.dialogueId);
                    }
                }
                return;
            }
            let unlock = this.checkDialogueUnlock(conf);
            if (!unlock) {
                return;
            }
            if (this.data.discardPlots.includes(conf.dialogueId)) {
                return;
            }
            this.checkPlotDialogueMutex(conf);
            this.plotDialogue[conf.dialogueId] = pbdef_1.SMPlayerPlotDialogue.PlotDialogue.create({
                id: conf.dialogueId,
                currentStep: 0,
                finished: false,
                options: []
            });
            if (conf.forceMutexDialogue.length > 0) {
                conf.forceMutexDialogue.forEach((mutexDialogueId) => {
                    if (!this.data.discardPlots.includes(mutexDialogueId)) {
                        this.data.discardPlots.push(mutexDialogueId);
                    }
                });
            }
        });
        for (let discardedDialogueId of this.data.discardPlots) {
            delete this.data.plotDialogue[String(discardedDialogueId)];
        }
    }
    checkPlotDialogueMutex(newDialogueConf) {
        if (newDialogueConf.mutexGroup == 0) {
            return;
        }
        let groupFinishCount = this.data.groupFinishCount[newDialogueConf.mutexGroup] ?? 0;
        if (groupFinishCount > 0) {
            if (!this.data.discardPlots.includes(newDialogueConf.dialogueId)) {
                this.data.discardPlots.push(newDialogueConf.dialogueId);
            }
            return;
        }
        for (let unlockedDialogueIdStr of Object.keys(this.data.plotDialogue)) {
            let unlockedDialogueId = parseInt(unlockedDialogueIdStr);
            let unlockedDialogueConf = Xlsx_1.Xlsx.PlotDialogueConf.Get(unlockedDialogueId, 3);
            if (!unlockedDialogueConf) {
                this.data.discardPlots.push(unlockedDialogueId);
                continue;
            }
            if (unlockedDialogueConf.mutexGroup == newDialogueConf.mutexGroup) {
                if (newDialogueConf.priority <= unlockedDialogueConf.priority) {
                    if (!this.data.discardPlots.includes(unlockedDialogueId)) {
                        this.data.discardPlots.push(unlockedDialogueId);
                    }
                }
                else {
                    if (!this.data.discardPlots.includes(newDialogueConf.dialogueId)) {
                        this.data.discardPlots.push(newDialogueConf.dialogueId);
                    }
                }
            }
        }
    }
    checkAllPlotDialogueMutex() {
        for (let unlockedDialogueIdStr of Object.keys(this.data.plotDialogue)) {
            let unlockedDialogueId = parseInt(unlockedDialogueIdStr);
            let unlockedDialogueConf = Xlsx_1.Xlsx.PlotDialogueConf.Get(unlockedDialogueId);
            if (!unlockedDialogueConf) {
                this.data.discardPlots.push(unlockedDialogueId);
                continue;
            }
            if (unlockedDialogueConf.forceMutexDialogue.length > 0) {
                unlockedDialogueConf.forceMutexDialogue.forEach((mutexDialogueId) => {
                    if (!this.data.discardPlots.includes(mutexDialogueId)) {
                        this.data.discardPlots.push(mutexDialogueId);
                        console.warn("Dialogue", `Remove useless ${mutexDialogueId}`);
                    }
                });
            }
        }
        for (let discardedDialogueId of this.data.discardPlots) {
            delete this.data.plotDialogue[String(discardedDialogueId)];
        }
    }
    UnlockDialogue(dialogueId) {
        let conf = Xlsx_1.Xlsx.PlotDialogueConf.Get(dialogueId);
        if (!conf) {
            return;
        }
        this.plotDialogue[conf.dialogueId] = pbdef_1.SMPlayerPlotDialogue.PlotDialogue.create({
            id: conf.dialogueId,
            currentStep: 0,
            finished: false,
            options: []
        });
    }
    GetPlayerPlotDialogue() {
        this.checkPlotDialogue();
        this.checkDeletedDialogue();
        this.checkAllPlotDialogueMutex();
        let dialogueResults = Object.values(this.data.plotDialogue).filter((p) => p.finished).map((p) => [p.id, p.result]).flat(1);
        Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.TriggerP0PlotP1Result, 1, ...dialogueResults);
        Notepad_1.NotepadUtil.CheckEvent();
        MessageBoard_1.MessageBoardUtil.CheckMessage();
        return Util_1.U.DeepCopy(this.data);
    }
    PromoteDialogue(dialogueId, step, options, finish, result) {
        let dialogue = this.plotDialogue[dialogueId];
        if (!dialogue) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ClientParamInvalid, `${dialogueId} not unlocked`);
        }
        dialogue.currentStep = step;
        dialogue.options.push(...options);
        dialogue.finished = finish;
        dialogue.result = result;
        let dialogueResults = Object.values(this.data.plotDialogue).filter((p) => p.finished).map((p) => [p.id, p.result]).flat(1);
        Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.TriggerP0PlotP1Result, 1, ...dialogueResults);
        Notepad_1.NotepadUtil.CheckEvent();
        MessageBoard_1.MessageBoardUtil.CheckMessage();
        if (!dialogue.finished) {
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        let dialogueConf = Xlsx_1.Xlsx.PlotDialogueConf.Get(dialogueId);
        if (dialogueConf.realDialogueId != 0) {
            this.plotDialogue[dialogueConf.realDialogueId] = Util_1.U.DeepCopy(dialogue);
        }
        if (dialogueConf.mutexGroup != 0) {
            this.data.groupFinishCount[dialogueConf.mutexGroup] = (this.data.groupFinishCount[dialogueConf.mutexGroup] ?? 0) + 1;
        }
        if (!Player_1.ModelPlayer.Instance.EnoughResource(...dialogueConf.cost)) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.PlayerResourceNotEnough, `${dialogueConf.cost} not enough`);
        }
        Player_1.ModelPlayer.Instance.CostResource(pbdef_1.EResourceChangeReason.PlotDialogue, dialogueId, ...dialogueConf.cost);
        if (dialogueConf.rewardResult.includes(dialogue.result) || dialogueConf.rewardResult.includes("Any")) {
            Player_1.ModelPlayer.Instance.AddResource(pbdef_1.EResourceChangeReason.PlotDialogue, dialogueId, ...dialogueConf.reward);
        }
        let assetPlot = Xlsx_1.Xlsx.DialogueAssetPlotConf.Get(dialogueConf?.assetId, 3);
        let assetBase = Xlsx_1.Xlsx.DialogueAssetBaseConf.Get(dialogueConf?.assetId, 3);
        if ((!assetPlot) || (assetPlot.kind == pbdef_1.EPlotDialogueKind.Default)) {
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        let currentTypeCount = this.data.counterpartCount[assetBase.counterpartId] ?? pbdef_1.SMPlayerPlotDialogue.CounterpartTypeCount.create({ typeCount: {} });
        let currentCount = currentTypeCount.typeCount[assetPlot.kind] ?? 0;
        let counterpartConf = Xlsx_1.Xlsx.DialogueCounterpartConf.Get(assetBase.counterpartId);
        let limit = counterpartConf.limit.find((r) => r.kind == assetPlot.kind);
        if (currentCount >= limit?.times ?? 0) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.PlotDialogueCounterpartChatLimit, `${assetBase.counterpartId} chat limit`);
        }
        currentCount++;
        currentTypeCount.typeCount[assetPlot.kind] = currentCount;
        this.data.counterpartCount[assetBase.counterpartId] = currentTypeCount;
        Task_2.ModelTask.Instance.RefreshTasks();
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    ResetCounterpartChatCount() {
        this.data.counterpartCount = {};
    }
    SetCounterpartChatMax(dialogId) {
        let dialogConf = Xlsx_1.Xlsx.PlotDialogueConf.Get(dialogId);
        if (!dialogConf)
            return;
        Xlsx_1.Xlsx.DialogueAssetPlotConf.All.forEach((r) => {
            if (r.id == dialogConf.assetId && (r.kind == pbdef_1.EPlotDialogueKind.Chat || r.kind == pbdef_1.EPlotDialogueKind.Sub)) {
                let assetBase = Xlsx_1.Xlsx.DialogueAssetBaseConf.Get(r.id);
                let cpConf = Xlsx_1.Xlsx.DialogueCounterpartConf.Get(assetBase.counterpartId);
                this.data.counterpartCount[assetBase.counterpartId] = pbdef_1.SMPlayerPlotDialogue.CounterpartTypeCount.create({ typeCount: {} });
                let limitCount = cpConf.limit.find((x) => x.kind == r.kind)?.times ?? 0;
                this.data.counterpartCount[assetBase.counterpartId].typeCount[r.kind] = limitCount;
            }
        });
    }
    IsDialogReject(dialogId) {
        return this.data.rejectDialog.includes(dialogId);
    }
    RejectDialog(dialogId) {
        if (dialogId && !this.IsDialogReject(dialogId)) {
            this.data.rejectDialog.push(dialogId);
        }
    }
}
exports.ModelPlotDialogue = ModelPlotDialogue;
//# sourceMappingURL=PlotDialogue.js.map