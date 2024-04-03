"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerModel = void 0;
// const csharp_1 = require("csharp");
const pbdef_1 = require("../../Gen/pbdef");
const BreedDungeon_1 = require("./BreedDungeon");
const ExploreDungeon_1 = require("./ExploreDungeon");
const Player_1 = require("./Player");
const Tutorial_1 = require("./Tutorial");
const PlotDialogue_1 = require("./PlotDialogue");
const BattleChallenge_1 = require("./BattleChallenge");
const ClientCustomData_1 = require("./ClientCustomData");
const Achievement_1 = require("./Achievement");
const Task_1 = require("./Task");
const Notepad_1 = require("./Notepad");
const MessageBoard_1 = require("./MessageBoard");
const Quest_1 = require("./Quest");
// const Xlsx_1 = require("../../Gen/Xlsx");
const ProtobufTools_1 = require("../../ProtobufTools");
const Util_1 = require("../../Core/Util");
var ServerModel;
(function (ServerModel) {
    let modelMap = new Map();
    let saveId = "AutoSave";
    let lastGameTime = null;
    let inheritEaData = true;
    function createModelMap() {
        let model = new Map();
        model.set(Player_1.ModelPlayer.name, Player_1.ModelPlayer.NewInstance());
        model.set(BreedDungeon_1.ModelBreedDungeon.name, BreedDungeon_1.ModelBreedDungeon.NewInstance());
        model.set(Tutorial_1.ModelTutorial.name, Tutorial_1.ModelTutorial.NewInstance());
        model.set(ExploreDungeon_1.ModelExploreDungeon.name, ExploreDungeon_1.ModelExploreDungeon.NewInstance());
        model.set(PlotDialogue_1.ModelPlotDialogue.name, PlotDialogue_1.ModelPlotDialogue.NewInstance());
        model.set(BattleChallenge_1.ModelBattleChallenge.name, BattleChallenge_1.ModelBattleChallenge.NewInstance());
        model.set(ClientCustomData_1.ModelClientCustomData.name, ClientCustomData_1.ModelClientCustomData.NewInstance());
        model.set(Achievement_1.ModelAchievement.name, Achievement_1.ModelAchievement.NewInstance());
        model.set(Task_1.ModelTask.name, Task_1.ModelTask.NewInstance());
        model.set(Notepad_1.ModelNotepad.name, Notepad_1.ModelNotepad.NewInstance());
        model.set(MessageBoard_1.ModelMessageBoard.name, MessageBoard_1.ModelMessageBoard.NewInstance());
        model.set(Quest_1.ModelQuest.name, Quest_1.ModelQuest.NewInstance());
        return model;
    }
    function ResetModelMap() {
        modelMap = createModelMap();
    }
    ServerModel.ResetModelMap = ResetModelMap;
    function createDataSave() {
        let ds = pbdef_1.DataSave.create();
        ds.id = saveId;
        return ds;
    }
    function setModelMessage(m, ds) {
        m.forEach((value, key) => {
            let buffer = value.SerializeToBytes();
            let u8buffer = new Uint8Array(buffer);
            ds.messages.push(pbdef_1.DataSave.Message.create({ type: key, data: u8buffer, }));
        });
    }
    function createSummary() {
        let summary = pbdef_1.DataSave.Summary.create();
        summary.timestamp = Number(csharp_1.NOAH.GameTime.utc);
        summary.challenge = pbdef_1.DataSave.Summary.Challenge.create();
        summary.breedNormal = pbdef_1.DataSave.Summary.Breed.create();
        summary.breedMaster = pbdef_1.DataSave.Summary.Breed.create();
        return summary;
    }
    function CreateInitDataSave() {
        let ds = createDataSave();
        let allModel = createModelMap();
        setModelMessage(allModel, ds);
        ds.summary = createSummary();
        return ds;
    }
    ServerModel.CreateInitDataSave = CreateInitDataSave;
    function Save() {
        let ds = createDataSave();
        setModelMessage(modelMap, ds);
        ds.savedTimes = Player_1.ModelPlayer.Instance.GetGameSavedTimes();
        ds.finalBossPass = ClientCustomData_1.ModelClientCustomData.Instance.IsPassFinalBoss();
        ds.inheritEaData = inheritEaData;
        ds.summary = GenerateSummary();
        return ds;
    }
    ServerModel.Save = Save;
    function Load(ds) {
        lastGameTime = csharp_1.NOAH.GameTime.utc;
        ResetModelMap();
        let loadedKeys = [];
        if (ds) {
            loadedKeys.push(...LoadModels(ds));
        }
        for (let key of modelMap.keys()) {
            if (!loadedKeys.includes(key)) {
                let model = modelMap.get(key);
                model.Initialize(saveId);
            }
        }
        Player_1.ModelPlayer.Instance.UpdateGameTotalDuration(ds?.summary?.duration ?? 0);
    }
    ServerModel.Load = Load;
    function GenerateSummary() {
        let summary = createSummary();
        let lastDuration = Player_1.ModelPlayer.Instance.GetGameTotalDuration();
        let utcNow = csharp_1.NOAH.GameTime.utc;
        lastGameTime = lastGameTime ?? utcNow;
        summary.duration = lastDuration + Number(utcNow - lastGameTime);
        Player_1.ModelPlayer.Instance.UpdateGameTotalDuration(summary.duration);
        Player_1.ModelPlayer.Instance.UpdateGameSavedTimes();
        console.info("Archive", `GenerateSummary utcNow: ${utcNow}, lastGameTime: ${lastGameTime}, duration: ${lastDuration} -> ${summary.duration}`);
        lastGameTime = utcNow;
        let fesTotalScoreMax = 0;
        let fesActorMaxScoreMap = Player_1.ModelPlayer.Instance.GetFesMaxScore();
        for (var score of Object.values(fesActorMaxScoreMap)) {
            fesTotalScoreMax += Number(score) ?? 0;
        }
        summary.fesActorTotalScoreMax = fesTotalScoreMax;
        let breedRecord = Player_1.ModelPlayer.Instance.GetBreedDungeonRecord();
        summary.breedNormal.tryTimes = breedRecord.normal_try_times;
        summary.breedNormal.finishTimes = breedRecord.normal_finish_times;
        summary.breedMaster.tryTimes = breedRecord.master_try_times;
        summary.breedMaster.finishTimes = breedRecord.master_finish_times;
        summary.challenge.id = BattleChallenge_1.ModelBattleChallenge.Instance.GetMaxFinishChallengeId();
        summary.bestFesActorScore = 0;
        for (var id of Object.keys(fesActorMaxScoreMap)) {
            let score = fesActorMaxScoreMap[id];
            if (summary.bestFesActorScore < score) {
                summary.bestFesActorScore = score;
                summary.bestFesActorId = Number(id);
            }
        }
        return summary;
    }
    function LoadModels(ds) {
        saveId = ds.id;
        inheritEaData = ds.inheritEaData;
        let loadedKeys = [];
        for (let message of ds.messages) {
            let model = modelMap.get(message.type);
            if (model) {
                model.MergeFromBytes(message.data);
                loadedKeys.push(message.type);
            }
        }
        return loadedKeys;
    }
    function RecoverAll() {
        modelMap.forEach((value, key) => value.Recover());
    }
    ServerModel.RecoverAll = RecoverAll;
    function getModelMessage(ds, modelType, index = -1) {
        let message = ds.messages[index];
        if (!message || message.type != modelType) {
            for (let i = 0; i < ds.messages.length; i++) {
                let m = ds.messages[i];
                if (m.type == modelType) {
                    message = m;
                    index = i;
                    break;
                }
            }
        }
        if (!message)
            console.error("Archive", `get model message failed. model type: ${modelType}, index: ${index}`);
        return [message, index];
    }
    function getAllModelForRead() {
        return modelMap.size == 0 ? createModelMap() : modelMap;
    }
    function Deserialize(ds) {
        let allModel = getAllModelForRead();
        let archive = ds.toJSON();
        for (let index = 0; index < archive.messages.length; index++) {
            let messageJson = archive.messages[index];
            let model = allModel.get(messageJson.type);
            if (model) {
                let [message, _] = getModelMessage(ds, messageJson.type, index);
                if (message) {
                    let jsonObj = model.BytesToJson(message.data);
                    if (jsonObj)
                        messageJson.data = jsonObj;
                }
            }
            else {
                console.warn("Archive", `Get model failed. model type: ${messageJson.type}`);
            }
        }
        return archive;
    }
    ServerModel.Deserialize = Deserialize;
    function Serialize(archive) {
        let allModel = getAllModelForRead();
        for (let messageJson of archive.messages) {
            let model = allModel.get(messageJson.type);
            if (model) {
                if (typeof messageJson.data == "string") {
                    console.warn("Archive", `model type: ${messageJson.type} will preserve data`);
                }
                else {
                    messageJson.data = model.JsonToBytes(messageJson.data);
                }
            }
            else {
                console.warn("Archive", `Get model failed. model type: ${messageJson.type}`);
            }
        }
        return pbdef_1.DataSave.fromObject(archive);
    }
    ServerModel.Serialize = Serialize;
    function inheritSummary(from, to) {
        if (from?.summary) {
            if (!to?.summary)
                to.summary = createSummary();
            to.summary.fesActorTotalScoreMax = from.summary.fesActorTotalScoreMax;
            to.summary.bestFesActorId = from.summary.bestFesActorId;
            to.summary.bestFesActorScore = from.summary.bestFesActorScore;
        }
    }
    function Inherit(from, to) {
        let result = true;
        let allModel = getAllModelForRead();
        for (let conf of Xlsx_1.Xlsx.ArchiveInheritFields.All) {
            let [fromMessage, index] = getModelMessage(from, conf.modelName);
            if (!fromMessage) {
                result = false;
                continue;
            }
            let [toMessage, _] = getModelMessage(to, conf.modelName, index);
            if (!toMessage) {
                result = false;
                continue;
            }
            let model = allModel.get(conf.modelName);
            if (model) {
                let from = model.DeserializeFromBytes(fromMessage.data);
                if (!from) {
                    result = false;
                    continue;
                }
                let to = model.DeserializeFromBytes(toMessage.data);
                if (!to) {
                    result = false;
                    continue;
                }
                if (conf.inheritAllField) {
                    to = Util_1.U.DeepCopy(from);
                }
                else {
                    for (let field of conf.inheritField) {
                        if (!model.InheritField(from, to, field))
                            result = false;
                    }
                }
                if (!model.CustomInherit(from, to)) {
                    result = false;
                    console.error("ArchiveInerit", `model ${conf.modelName} inherit custom fail`);
                }
                toMessage.data = new Uint8Array((0, ProtobufTools_1.PBEncode)(to));
            }
            else {
                result = false;
                console.error("ArchiveInerit", `model ${conf.modelName} is not exist`);
            }
        }
        inheritSummary(from, to);
        return result;
    }
    ServerModel.Inherit = Inherit;
    function createEaData(ds) {
        return {
            Data: ds,
            AcePoint: 0,
            PrototypeAnalyzer: 0,
        };
    }
    function GetEaData(ds) {
        let data = createEaData(ds);
        if (!ds)
            return data;
        const playerModelName = "ModelPlayer";
        let [playerMessage, _] = getModelMessage(ds, playerModelName);
        if (!playerMessage) {
            console.info("Archive", `${playerModelName} message not exist`);
            return data;
        }
        let playerIns = Player_1.ModelPlayer.NewInstance();
        try {
            playerIns.MergeFromBytes(playerMessage.data);
            data.AcePoint = playerIns.GetEaAcePoint();
            data.PrototypeAnalyzer = playerIns.GetEaPrototypeAnalyzer();
        }
        catch (err) {
            console.info("Archive", `merge ea ${playerModelName} bytes fail`);
            return data;
        }
        return data;
    }
    ServerModel.GetEaData = GetEaData;
    function AddEaData(ds, ea) {
        const playerModelName = "ModelPlayer";
        let [playerMessage, index] = getModelMessage(ds, playerModelName);
        if (!playerMessage) {
            console.info("Archive", `${playerModelName} message not exist`);
            return false;
        }
        let playerIns = Player_1.ModelPlayer.NewInstance();
        try {
            playerIns.MergeFromBytes(playerMessage.data);
            playerIns.AddEaResource(ea.AcePoint, ea.PrototypeAnalyzer);
            ds.inheritEaData = true;
        }
        catch (err) {
            console.info("Archive", `merge ea ${playerModelName} bytes fail`);
            return false;
        }
        let buffer = playerIns.SerializeToBytes();
        let u8buffer = new Uint8Array(buffer);
        ds.messages[index] = pbdef_1.DataSave.Message.create({
            type: playerModelName,
            data: u8buffer,
        });
        return true;
    }
    ServerModel.AddEaData = AddEaData;
})(ServerModel = exports.ServerModel || (exports.ServerModel = {}));
//# sourceMappingURL=ModelManager.js.map