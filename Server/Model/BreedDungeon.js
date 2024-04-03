"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelBreedDungeon = void 0;
const DataSave_1 = require("../../Core/DataSave");
const P = require("../../Gen/pbdef");
// const Xlsx_1 = require("../../Gen/Xlsx");
// const Misc_1 = require("../../Misc");
// const ServerUtils_1 = require("../../Server/ServerUtils");
const Player_1 = require("./Player");
const Util_1 = require("../../Core/Util");
// const Actor_1 = require("../../Server/Module/Actor");
// const XlsxUtils_1 = require("../../Server/Module/XlsxUtils");
// const Dungeon_1 = require("../../Server/Module/Dungeon");
// const Bless_1 = require("../../Server/Module/Bless");
// const Buff_1 = require("../../Server/Module/Buff");
// const Potential_1 = require("../../Server/Module/Potential");
const PlotDialogue_1 = require("./PlotDialogue");
// const Task_1 = require("../../Server/Module/Task");
const Task_2 = require("./Task");
// const Common_1 = require("../../Server/Module/Common");
// const Quest_1 = require("../../Server/Module/Quest");
// const csharp_1 = require("csharp");
class ModelBreedDungeon extends DataSave_1.DataSaveCore.DataSaveWrapper {
    _shopDevices;
    _blessRandomGenerator;
    _potentialRandomGenerator;
    constructor() {
        let t = P.STBreedDungeon.create();
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
    Copy() {
        return Util_1.U.DeepCopy(this.data);
    }
    get potentialRandomGenerator() {
        if (!this._potentialRandomGenerator) {
            this._potentialRandomGenerator = new Potential_1.PotentialUtils.OrderPotentialRandomGenerator(this.baseInfo.actorId, this.FesActor.potentials);
        }
        return this._potentialRandomGenerator;
    }
    get blessRandomGenerator() {
        if (!this._blessRandomGenerator) {
            this._blessRandomGenerator = new Bless_1.BlessUtils.FactionBlessRandomGenerator(this.FesActor.blesses, this.baseInfo.factorActorUid.length > 0, true);
        }
        return this._blessRandomGenerator;
    }
    get baseInfo() {
        if (!this.data.baseInfo) {
            this.data.baseInfo = new P.STBreedDungeon.BaseInfo;
        }
        return this.data.baseInfo;
    }
    get Id() {
        return this.baseInfo.id;
    }
    get actorInfo() {
        if (!this.data.actorInfo) {
            this.data.actorInfo = new P.STBreedDungeon.ActorInfo;
        }
        return this.data.actorInfo;
    }
    get taskInfo() {
        return this.data.taskInfo;
    }
    get rewardInfo() {
        if (!this.data.rewardInfo) {
            this.data.rewardInfo = P.STBreedDungeon.RewardInfo.create({
                stageSelectRewards: P.STBreedDungeonStageSelectRewards.create({ rewards: [] }),
                potentialRefreshRecord: []
            });
        }
        return this.data.rewardInfo;
    }
    get randomInfo() {
        if (!this.data.randomInfo) {
            this.data.randomInfo = new P.STBreedDungeon.RandomInfo;
        }
        if (!this.data.randomInfo.chaosEventInfo) {
            this.data.randomInfo.chaosEventInfo = new Array();
        }
        return this.data.randomInfo;
    }
    get resourceInfo() {
        if (!this.data.resourceInfo) {
            this.data.resourceInfo = P.STBreedDungeon.ResourceInfo.create({ count: {} });
            this.initResources();
        }
        return this.data.resourceInfo;
    }
    initResources() {
        Object.values(P.EBreedDungeonResType).forEach((v) => {
            this.resourceInfo.count[v] = 0;
        });
    }
    get deviceInfo() {
        if (!this.data.deviceInfo) {
            this.data.deviceInfo = new P.STBreedDungeon.DeviceInfo;
        }
        return this.data.deviceInfo;
    }
    get buffInfo() {
        if (!this.data.buffInfo) {
            this.data.buffInfo = new P.STBreedDungeon.BuffInfo;
        }
        if (!this.data.buffInfo.eventBuffsRound)
            this.data.buffInfo.eventBuffsRound = new Array();
        if (!this.data.buffInfo.eventDebuffsRound)
            this.data.buffInfo.eventDebuffsRound = new Array();
        return this.data.buffInfo;
    }
    get functionInfo() {
        if (!this.data.functionInfo) {
            this.data.functionInfo = new P.STBreedDungeon.FunctionInfo;
        }
        return this.data.functionInfo;
    }
    get activeInfo() {
        if (!this.data.activeInfo) {
            this.data.activeInfo = new P.DungeonActiveInfo;
        }
        return this.data.activeInfo;
    }
    Clear() {
        this.clear();
    }
    clear() {
        this.data = P.STBreedDungeon.create();
        this.data.playerId = this.saveId;
        this["_conf"] = null;
        this._blessRandomGenerator = null;
        this._potentialRandomGenerator = null;
    }
    get conf() {
        this["_conf"] = this["_conf"] || Xlsx_1.Xlsx.BreedDungeonConf.Get(this.baseInfo.id);
        return this["_conf"];
    }
    get initialized() {
        return this.baseInfo.actorId != 0;
    }
    get factorActorUid() {
        return this.baseInfo.factorActorUid;
    }
    get FesActor() {
        return this.actorInfo.fesActor;
    }
    get phases() {
        return this.baseInfo.phases;
    }
    get finalPhase() {
        return this.baseInfo.currentPhase == this.conf?.maxPhase;
    }
    get currentPhaseIndex() {
        return this.baseInfo.currentPhase;
    }
    get mode() {
        return this.baseInfo.mode;
    }
    get heat() {
        return this.baseInfo.heat;
    }
    get currentPhaseInfo() {
        if (this.baseInfo.currentPhase - 1 >= this.phases.length || this.baseInfo.currentPhase < 1) {
            return null;
        }
        return this.phases[this.baseInfo.currentPhase - 1];
    }
    get phaseFinished() {
        let phaseInfo = this.currentPhaseInfo;
        if (!phaseInfo) {
            return false;
        }
        let phaseCount = Object.keys(phaseInfo.roomRandomed).length;
        if (phaseInfo.currentStageIndex != phaseCount) {
            return false;
        }
        if (phaseInfo.rooms.length != phaseCount) {
            return false;
        }
        return phaseInfo.rooms[phaseInfo.currentStageIndex - 1].finished;
    }
    get phaseRewarded() {
        let phaseInfo = this.currentPhaseInfo;
        if (!phaseInfo) {
            return false;
        }
        let phaseCount = Object.keys(phaseInfo.roomRandomed).length;
        if (phaseInfo.currentStageIndex != phaseCount) {
            return false;
        }
        if (phaseInfo.rooms.length != phaseCount) {
            return false;
        }
        let rewarded = phaseInfo.rooms[phaseInfo.currentStageIndex - 1].rewarded;
        if (rewarded) {
            phaseInfo.finished = true;
        }
        return rewarded;
    }
    get finished() {
        if (this.data.finished) {
            return true;
        }
        if (!this.finalPhase) {
            return false;
        }
        if (this.phaseRewarded) {
            this.data.finished = true;
            return true;
        }
    }
    get currentRoom() {
        let phaseInfo = this.currentPhaseInfo;
        if (!phaseInfo) {
            return null;
        }
        return phaseInfo.rooms[phaseInfo.currentStageIndex - 1];
    }
    get currentRoomConf() {
        let phaseInfo = this.currentPhaseInfo;
        let room = this.currentRoom;
        if (!room) {
            return null;
        }
        let conf = Xlsx_1.Xlsx.BreedDungeonRoomConf.Get(room.roomType, phaseInfo.theme, phaseInfo.currentStageIndex);
        let functions = this.dungeonFunctions(P.EBreedDungeonFunction.PhemeReplace).filter((val) => val.phemeReplace.roomType == room.roomType);
        let func = functions.find((val) => val.phemeReplace.oldTheme == this.currentPhaseInfo.theme);
        if (func) {
            console.info("BreedFunction", `theme replace ${func.phemeReplace.oldTheme} => ${func.phemeReplace.newTheme}`);
            conf = Xlsx_1.Xlsx.BreedDungeonRoomConf.Get(room.roomType, func.phemeReplace.newTheme, phaseInfo.currentStageIndex);
        }
        return conf;
    }
    get currentScene() {
        return Xlsx_1.Xlsx.SceneStageBase.Get(this.currentRoom.stageIdx)?.Topic;
    }
    get phaseConf() {
        return Xlsx_1.Xlsx.BreedDungeonPhaseConf.Get(this.baseInfo.id, this.baseInfo.currentPhase);
    }
    get rewardToGet() {
        return this.rewardInfo.stageSelectRewards?.rewardType != P.EBreedDungeonStageSelectRewardType.None;
    }
    addResource(type, value, useAddRate = true, customAddRate = 0) {
        let addRate = 0;
        if (useAddRate) {
            if (type == P.EBreedDungeonResType.Hashrate) {
                addRate = Actor_1.FesActorUtils.GetFesActorAttrByType(this.actorInfo.fesActor, P.EAttrType.HashrateDropAddRate);
            }
        }
        if (customAddRate != 0) {
            addRate += customAddRate;
        }
        this.resourceInfo.count[type] += Math.floor(value * (1 + addRate));
        if (type == P.EBreedDungeonResType.Coin) {
            this.resourceInfo.count[P.EBreedDungeonResType.TotalCoin] += Math.floor(value * (1 + addRate));
        }
    }
    getResource(type) {
        return this.resourceInfo.count[type] || 0;
    }
    costResource(type, value) {
        this.resourceInfo.count[type] -= value;
        if (type == P.EBreedDungeonResType.Coin && value > 0) {
            Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.CostMexchangePoint, value);
        }
    }
    resourceEnough(type, value, allowDebt = 0) {
        if (this.resourceInfo.count[type] < 0 && Math.abs(this.resourceInfo.count[type]) >= allowDebt) {
            return false;
        }
        return this.resourceInfo.count[type] + allowDebt >= value;
    }
    initializeActorInfo(actorId, fesUid, deltaAttrs) {
        this.baseInfo.actorId = actorId;
        this.baseInfo.currentPhase = 1;
        let baseActor = Player_1.ModelPlayer.Instance.GetBaseActor(actorId);
        if (!baseActor) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BaseActorNotOwn, `actor ${actorId} not exist`);
        }
        let r = this.initializeFesActor(baseActor, fesUid, deltaAttrs);
        if (!r.success) {
            return r;
        }
        this.initFactorActorRewards();
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    initializeFesActor(baseActor, fesUid, deltaAttrs) {
        if (fesUid.length > Misc_1.Misc.breedDungeonMisc.factorActorCount) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `fesUid length ${fesUid.length} > ${Misc_1.Misc.breedDungeonMisc.factorActorCount}`);
        }
        let factorActors = [];
        this.baseInfo.factorActorUid = fesUid;
        for (let i = 0; i < fesUid.length; i++) {
            let fesActor = Player_1.ModelPlayer.Instance.GetFesActor(fesUid[i]);
            if (!fesActor) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.FesActorUidNotFound, `fes actor ${fesUid[i]} not exist`);
            }
            factorActors.push(fesActor);
            this.baseInfo.factorScore += fesActor.score;
            this.baseInfo.eachFactorScore.push(fesActor.score);
        }
        let newFesActor = Actor_1.FesActorUtils.Generate(Player_1.ModelPlayer.Instance.NextFesUid(), baseActor);
        if (!newFesActor) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `fes actor generate failed`);
        }
        let sanModeConf = Misc_1.Misc.breedDungeonMisc.modeSanConf[this.mode];
        if (!sanModeConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `san mode conf not found ${this.mode}`);
        }
        let extraHealthFlaskCount = 0;
        this.dungeonFunctions(P.EBreedDungeonFunction.HealthFlaskAdd).forEach((r) => {
            extraHealthFlaskCount += r.healthFlaskAdd.addCount;
        });
        if (extraHealthFlaskCount != 0) {
            console.info("BreedFunction", `health flask add ${extraHealthFlaskCount}`);
        }
        let hfcount = Actor_1.FesActorUtils.GetFesActorAttrByType(newFesActor, P.EAttrType.HealthFlaskCountMax);
        Actor_1.FesActorUtils.SetFesActorAttrByType(newFesActor, P.EAttrType.HealthFlaskCountMax, hfcount + extraHealthFlaskCount);
        Actor_1.FesActorUtils.SetFesActorAttrByType(newFesActor, P.EAttrType.SanMax, sanModeConf.max);
        let sanDefaultReduce = 0;
        this.dungeonFunctions(P.EBreedDungeonFunction.SanDefaultReduce).forEach((r) => {
            sanDefaultReduce += r.sanDefaultReduce.reduce;
        });
        Actor_1.FesActorUtils.SetFesActorAttrByType(newFesActor, P.EAttrType.SanMin, sanModeConf.min - sanDefaultReduce);
        Actor_1.FesActorUtils.SetFesActorAttrByType(newFesActor, P.EAttrType.San, sanModeConf.defaultValue - sanDefaultReduce, true);
        this.actorInfo.fesActor = newFesActor;
        let brdunMisc = Misc_1.Misc.breedDungeonMisc;
        let hashRateAdd = 0;
        for (let i = 0; i < factorActors.length; i++) {
            let fesActor = factorActors[i];
            let attrsDelta = Actor_1.FesActorUtils.InheritAttrFromFactorActor(newFesActor, fesActor, i);
            deltaAttrs.push(...attrsDelta);
            hashRateAdd += fesActor.score * brdunMisc.inheritBaseHashratePerScore + brdunMisc.inheritBaseHashrate;
        }
        deltaAttrs = (0, Actor_1.MergeAttr)(...deltaAttrs);
        this.addResource(P.EBreedDungeonResType.Hashrate, hashRateAdd);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    newPhaseInfo() {
        return P.STBreedDungeonPhase.create({ rooms: [], roomRandomed: {}, roomDevices: {}, selectedIndex: [], phaseDevices: P.STBreedDungeonDeviceMap.create({ info: {} }) });
    }
    shuffleRooms(phaseInfo) {
        for (let key in phaseInfo.roomRandomed) {
            Util_1.U.ShuffleArray(phaseInfo.roomRandomed[key].rooms);
        }
    }
    generatePhase(forceTheme = 0) {
        let phaseConf = this.phaseConf;
        if (!phaseConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `phase ${this.baseInfo.currentPhase} not exist`);
        }
        let phaseInfo = this.randomInfo.preparePhases[this.currentPhaseIndex - 1];
        this.phases.push(phaseInfo);
        phaseInfo.phaseIndex = this.currentPhaseIndex;
        phaseInfo.currentStageIndex = 0;
        let theme = 0;
        if (forceTheme == 0) {
            let themeRecordList = Player_1.ModelPlayer.Instance.GetBreedThemeRecord(this.mode, this.currentPhaseIndex);
            let highPriorityRandomList = [];
            let themeRandomList = [];
            phaseConf.themes.forEach((t) => {
                let themeLabel = Misc_1.Misc.breedDungeonMisc.themeLabel[t] ?? "default";
                if (this.randomInfo.randomedThemeLabels.includes(themeLabel)) {
                    return;
                }
                themeRandomList.push(t);
                if (!themeRecordList.includes(themeLabel) && (Misc_1.Misc.breedDungeonMisc.modePhaseThemeRecordLimit <= themeRecordList.length)) {
                    highPriorityRandomList.push(t);
                }
            });
            if (highPriorityRandomList.length > 0) {
                theme = Util_1.U.RandomChoice(highPriorityRandomList);
            }
            else {
                theme = Util_1.U.RandomChoice(themeRandomList);
            }
        }
        else {
            theme = forceTheme;
        }
        if (theme == 0) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `phase ${this.baseInfo.currentPhase} theme not exist`);
        }
        phaseInfo.theme = theme;
        this.refreshPhaseRoomRandomInfo();
        let themeLabel = Misc_1.Misc.breedDungeonMisc.themeLabel[theme] ?? "default";
        this.randomInfo.randomedThemeLabels.push(themeLabel);
        Player_1.ModelPlayer.Instance.UpdateBreedThemeRecord(this.mode, this.currentPhaseIndex, themeLabel);
        let phaseStageCount = XlsxUtils_1.XlsxUtils.BreedDungeonPhaseStageCount.get(phaseInfo.phaseIndex);
        if (phaseStageCount <= 0) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `theme ${theme} not exist`);
        }
        this.shuffleRooms(phaseInfo);
        for (let deviceId of phaseConf.deviceIds) {
            let deviceInfo = this.getDeviceInfo(deviceId);
            deviceInfo.deviceFrom = P.EBreedDungeonDeviceFrom.PhaseFix;
            phaseInfo.phaseDevices.info[deviceId] = deviceInfo;
        }
        this.randomInfo.roomCountByType = {};
        let addNewSanDebuff = this.dungeonFunctions(P.EBreedDungeonFunction.NewPhaseSanDebuff);
        addNewSanDebuff.forEach((r) => {
            Dungeon_1.DungeonUtils.AddNewSanBuffDirect(this, r.newPhaseSanDebuff.pool, !r.newPhaseSanDebuff.isBuff);
        });
        this.debugRooms(phaseInfo);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    debugRooms(phaseInfo) {
        let roomCount = new Util_1.U.DefaultNumberMap(this.baseInfo.roomTypeCount, 0);
        for (let key in phaseInfo.roomRandomed) {
            let rooms = phaseInfo.roomRandomed[key].rooms;
            rooms.forEach((r) => roomCount.add(r.roomType));
            let roomStr = rooms.map((r) => Util_1.U.GetLocale(`RoomType_${r.roomType}`)).join(",");
            console.log("RoomRandom", `phase ${phaseInfo.phaseIndex} stage ${key} score ${phaseInfo.roomRandomed[key].dropScore} room type ${roomStr}`);
        }
        this.baseInfo.roomTypeCount = roomCount.toObjectMap();
    }
    setStageIdx(room, themeStageRoomConf) {
        if (themeStageRoomConf.roomType == P.EBreedDungeonRoomType.Fight || themeStageRoomConf.roomType == P.EBreedDungeonRoomType.Elite) {
            return;
        }
        let stageId = Util_1.U.RandomChoice(themeStageRoomConf.stageList);
        let stageRes = Xlsx_1.Xlsx.SceneStageBase.Get(stageId);
        if (!stageRes) {
            return;
        }
        room.stageIdx = stageId;
    }
    randomStageIdx(roomConf) {
        let validStageList = [];
        let checkRecord = roomConf.roomType == P.EBreedDungeonRoomType.Fight || roomConf.roomType == P.EBreedDungeonRoomType.Elite;
        let randomedBoss = this.randomInfo.randomedBoss;
        switch (roomConf.roomType) {
            case P.EBreedDungeonRoomType.Fight:
            case P.EBreedDungeonRoomType.Elite:
                for (let stageId of roomConf.stageList) {
                    let stageRes = Xlsx_1.Xlsx.SceneStageBase.Get(stageId);
                    if (!stageRes) {
                        return;
                    }
                    if (stageRes.SceneTag && (this.baseInfo.randomedStagesTags.includes(stageRes.SceneTag))) {
                        continue;
                    }
                    validStageList.push(stageRes);
                }
                if (validStageList.length == 0) {
                    for (let stageId of roomConf.stageList) {
                        let stageRes = Xlsx_1.Xlsx.SceneStageBase.Get(stageId);
                        if (!stageRes) {
                            return;
                        }
                        if (this.baseInfo.randomedStages.includes(stageRes.Idx)) {
                            continue;
                        }
                        validStageList.push(stageRes);
                    }
                }
                break;
            case P.EBreedDungeonRoomType.Boss:
                let allBossRandomed = true;
                let stageResList = [];
                let bossList = new Set();
                for (let stageId of roomConf.stageList) {
                    let stageRes = Xlsx_1.Xlsx.SceneStageBase.Get(stageId);
                    if (!stageRes) {
                        return;
                    }
                    bossList.add(stageRes.BossId);
                    stageResList.push(stageRes);
                }
                allBossRandomed = Util_1.U.IsSubArray(randomedBoss, Array.from(bossList));
                if (allBossRandomed) {
                    validStageList = stageResList;
                }
                else {
                    validStageList = stageResList.filter((x) => {
                        return randomedBoss.indexOf(x.BossId) < 0;
                    });
                }
                break;
            default:
                for (let stageId of roomConf.stageList) {
                    let stageRes = Xlsx_1.Xlsx.SceneStageBase.Get(stageId);
                    if (!stageRes) {
                        return;
                    }
                    validStageList.push(stageRes);
                }
                break;
        }
        if (validStageList.length <= 0) {
            return;
        }
        let stageRes = Util_1.U.RandomChoice(validStageList);
        if (!stageRes) {
            return;
        }
        if (checkRecord) {
            if (stageRes.SceneTag) {
                this.baseInfo.randomedStagesTags.push(stageRes.SceneTag);
            }
            this.baseInfo.randomedStages.push(stageRes.Idx);
        }
        return stageRes.Idx;
    }
    checkRoomStageIdx(room) {
        if (room.stageIdx) {
            return;
        }
        let roomConf = this.currentRoomConf;
        if (!roomConf) {
            return;
        }
        let stageIdx = this.randomStageIdx(roomConf);
        if (!stageIdx) {
            return;
        }
        room.stageIdx = stageIdx;
    }
    checkRoomEvents(room) {
        let roomConf = this.currentRoomConf;
        if (!roomConf) {
            return;
        }
        if (roomConf.roomType == P.EBreedDungeonRoomType.Event) {
            let poolId = roomConf.event.eventsPool;
            let eventGroups = Xlsx_1.Xlsx.BreedDungeonEventPoolConf.All.filter((r) => {
                if (r.eventsPool != poolId) {
                    return false;
                }
                if (this.randomInfo.randomedEventsGroup.includes(r.events.join("_"))) {
                    return false;
                }
                return true;
            });
            if (eventGroups.length > 0) {
                let eventGroup = Util_1.U.RandomChoice(eventGroups);
                let noEvent = this.checkEventConditions(room, eventGroup.events);
                if (noEvent) {
                    console.error("BreedDungeon", `evenet group ${eventGroup.events} no valid event`);
                    room.events.push(Misc_1.Misc.breedDungeonMisc.defaultEventId);
                }
                this.randomInfo.randomedEventsGroup.push(eventGroup.events.join("_"));
            }
            room.events.forEach((event) => {
                let eventConf = Xlsx_1.Xlsx.DungeonRoomEventConf.Get(event);
                if (eventConf.type == P.EDungeonRoomEventType.ChaosChallenge) {
                    let chaosEventInfo = new P.ChaosEventInfo();
                    chaosEventInfo.eventId = event;
                    eventConf.rewards.forEach((reward) => {
                        if (reward.type == P.EDungeonRoomEventRewardType.ChaosChallengeBuffPool) {
                            let buffPoolId = reward.num;
                            let randomGroup = XlsxUtils_1.XlsxUtils.GetDungeonEventChaosBuffPool(buffPoolId);
                            randomGroup = randomGroup.filter((r) => this.buffInfo.eventDebuffsRound.findIndex((b) => b.buffId == r.buffId) < 0);
                            randomGroup = randomGroup.filter((r) => room.chaosEventInfo.findIndex((info) => info.buffId == r.buffId) < 0);
                            if (randomGroup.length > 0) {
                                let result = Util_1.U.RandomChoice(randomGroup);
                                chaosEventInfo.level = result.level;
                                chaosEventInfo.buffId = result.buffId;
                                chaosEventInfo.effectRound = result.effectRound;
                            }
                        }
                    });
                    eventConf.rewards.forEach((reward) => {
                        if (reward.type == P.EDungeonRoomEventRewardType.ChaosChallengeRewardPool) {
                            let rewardPoolId = reward.num;
                            let randomGroup = XlsxUtils_1.XlsxUtils.GetDungeonEventChaosRewardPool(rewardPoolId).filter(r => r.level.index == chaosEventInfo.level);
                            randomGroup = randomGroup.filter((r) => {
                                if (r.type == P.EDungeonRoomEventRewardType.ChaosRewardBuff) {
                                    if (this.buffInfo.eventBuffsRound.findIndex((b) => b.buffId == r.level.value) >= 0)
                                        return false;
                                }
                                if (room.chaosEventInfo.findIndex((info) => info.rewardType == r.type) >= 0)
                                    return false;
                                return true;
                            });
                            if (randomGroup.length > 0) {
                                let result = Util_1.U.RandomChoice(randomGroup);
                                chaosEventInfo.rewardType = result.type;
                                chaosEventInfo.value = result.level.value;
                            }
                        }
                    });
                    room.chaosEventInfo.push(chaosEventInfo);
                }
            });
        }
    }
    getCompareTypeValue(tp) {
        switch (tp) {
            case P.EDungeonRoomEventConditionType.BlessQuality1:
                return this.FesActor.blesses.filter((r) => XlsxUtils_1.XlsxUtils.GetBlessQualityByDisplay(r.id, r.quality) == 1).length;
            case P.EDungeonRoomEventConditionType.BlessQuality2:
                return this.FesActor.blesses.filter((r) => XlsxUtils_1.XlsxUtils.GetBlessQualityByDisplay(r.id, r.quality) == 2).length;
            case P.EDungeonRoomEventConditionType.BlessQuality3:
                return this.FesActor.blesses.filter((r) => XlsxUtils_1.XlsxUtils.GetBlessQualityByDisplay(r.id, r.quality) == 3).length;
            case P.EDungeonRoomEventConditionType.BlessQuality4:
                return this.FesActor.blesses.filter((r) => XlsxUtils_1.XlsxUtils.GetBlessQualityByDisplay(r.id, r.quality) >= 4).length;
            case P.EDungeonRoomEventConditionType.DataPoint:
                return this.getResource(P.EBreedDungeonResType.Coin);
            case P.EDungeonRoomEventConditionType.Hash:
                return this.getResource(P.EBreedDungeonResType.Hashrate);
            case P.EDungeonRoomEventConditionType.Hpr:
                let hpMax = Actor_1.FesActorUtils.GetFesActorAttrRealValue(this.FesActor, P.EAttrType.MaxHp);
                let hpr = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.Hp, true);
                let baseMaxHp = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.MaxHp);
                return hpMax * hpr / baseMaxHp * 10000;
            case P.EDungeonRoomEventConditionType.HealthFlask:
                let hpFlaskCount = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskCount);
                let useCount = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskUseCount, true);
                return hpFlaskCount - useCount;
            case P.EDungeonRoomEventConditionType.San:
                return Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.San, true);
            case P.EDungeonRoomEventConditionType.SanBuff:
                return this.buffInfo.sanBuffsRound.length;
            case P.EDungeonRoomEventConditionType.SanDebuff:
                return this.buffInfo.sanDebuffsRound.length;
            case P.EDungeonRoomEventConditionType.PotentialNum:
                return this.FesActor.potentials.length;
            case P.EDungeonRoomEventConditionType.ContinuousPerfectKillMax:
                return this.activeInfo.continuousPerfectKillMax;
            case P.EDungeonRoomEventConditionType.ContinuousPerfectKillCur:
                return this.activeInfo.continuousPerfectKillCur;
            default:
                return 0;
        }
    }
    GetSanBuffPool() {
        let san = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.San, true);
        for (let r of Xlsx_1.Xlsx.BreedDungeonSanValueConf.All) {
            if (san < Util_1.U.FloatFloor(r.sanMax) && san >= Util_1.U.FloatFloor(r.sanMin)) {
                return r;
            }
        }
    }
    checkEventBlessReward(blessResType, quality, num) {
        if (num >= 0) {
            this.addResource(blessResType, num);
        }
        else {
            let endsBless = Bless_1.BlessUtils.GetEndOfBlessTree(this.FesActor.blesses).filter((b) => b.quality == quality);
            for (let i = 0; i > num; i--) {
                Actor_1.FesActorUtils.DelBless(this.FesActor, Util_1.U.RandomChoice(endsBless));
            }
        }
    }
    checkEventReward(rewardType, num, afterBalance = false) {
        switch (rewardType) {
            case P.EDungeonRoomEventRewardType.Hash:
                this.addResource(P.EBreedDungeonResType.Hashrate, num);
                break;
            case P.EDungeonRoomEventRewardType.DataPoint:
                this.addResource(P.EBreedDungeonResType.Coin, num);
                break;
            case P.EDungeonRoomEventRewardType.BlessQuality1:
                this.checkEventBlessReward(P.EBreedDungeonResType.BlessQuality1, 1, num);
                break;
            case P.EDungeonRoomEventRewardType.BlessQuality2:
                this.checkEventBlessReward(P.EBreedDungeonResType.BlessQuality2, 2, num);
                break;
            case P.EDungeonRoomEventRewardType.BlessQuality3:
                this.checkEventBlessReward(P.EBreedDungeonResType.BlessQuality3, 3, num);
                break;
            case P.EDungeonRoomEventRewardType.BlessQuality4:
                this.checkEventBlessReward(P.EBreedDungeonResType.BlessQuality4, 4, num);
                break;
            case P.EDungeonRoomEventRewardType.Potential:
                this.refreshPotentialReward();
                break;
            case P.EDungeonRoomEventRewardType.HpRecover:
                Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, num / 10000);
                break;
            case P.EDungeonRoomEventRewardType.HealthFlask:
                let hpFlaskCountMax = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskCountMax);
                let hpFlaskCount = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskCount);
                let useCount = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskUseCount, true);
                let flaskAdd = Math.min((hpFlaskCountMax - (hpFlaskCount - useCount)), num);
                Actor_1.FesActorUtils.SetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskCount, flaskAdd + hpFlaskCount);
                break;
            case P.EDungeonRoomEventRewardType.San:
                Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.San, num);
                break;
            case P.EDungeonRoomEventRewardType.SanBuff:
            case P.EDungeonRoomEventRewardType.SanDebuff:
                let debuff = rewardType == P.EDungeonRoomEventRewardType.SanDebuff;
                let buffList = debuff ? this.buffInfo.sanDebuffsRound : this.buffInfo.sanBuffsRound;
                let sanBuffPoolConf = this.GetSanBuffPool();
                let sanBuffPool = debuff ? sanBuffPoolConf.sanDebuffPool : sanBuffPoolConf.sanBuffPool;
                if (num > 0) {
                    for (let i = 0; i < num; i++) {
                        Dungeon_1.DungeonUtils.AddNewSanBuffDirect(this, sanBuffPool, debuff, afterBalance);
                    }
                }
                else {
                    for (let i = 0; i > num; i--) {
                        if (buffList.length > 0) {
                            let remove = Util_1.U.RandomChoice(buffList);
                            Util_1.U.RemoveElement(buffList, remove);
                        }
                    }
                }
                break;
            case P.EDungeonRoomEventRewardType.SanBuffRoundAdd:
                this.buffInfo.sanBuffsRound.forEach((v) => {
                    v.effectRound += num;
                });
                break;
            case P.EDungeonRoomEventRewardType.MaxHp:
                Actor_1.FesActorUtils.AddAttr(this.FesActor, new P.STAttr({ type: P.EAttrType.HpRateEq, value: num / 10000 }));
                break;
            case P.EDungeonRoomEventRewardType.BlessQualityUp:
                if (this.currentRoom.roomType == P.EBreedDungeonRoomType.Event) {
                    this.refreshBlessUpReward(num);
                }
                else {
                    this.addResource(P.EBreedDungeonResType.QualityPoint, num);
                }
                break;
            default:
                break;
        }
        return { rewarded: true, ret: ServerUtils_1.ServerUtils.MakeRet(true) };
    }
    CheckEventReward(event) {
        let rewarded = false;
        let ret = ServerUtils_1.ServerUtils.MakeRet(true);
        let eventConf = Xlsx_1.Xlsx.DungeonRoomEventConf.Get(event);
        if (!eventConf)
            return { rewarded, ret };
        let unlock = this.checkEventCondition(event);
        if (!unlock)
            return { rewarded, ret };
        if (eventConf.type != P.EDungeonRoomEventType.ChaosChallenge) {
            eventConf.rewards.forEach((r) => {
                let eventHappen = true;
                if (r.probability > 0)
                    eventHappen = Util_1.U.Bernouli(r.probability);
                if (eventHappen)
                    this.checkEventReward(r.type, r.num);
                this.currentRoom.isEventGetArr.push(eventHappen);
            });
        }
        else {
            this.currentRoom.isEventGetArr.push(true, true);
            let chaosEventInfo = this.currentRoom.chaosEventInfo.find((val) => val.eventId == this.currentRoom.selectEvent);
            if (chaosEventInfo) {
                this.checkEventReward(chaosEventInfo.rewardType, chaosEventInfo.value);
            }
        }
        this.currentRoom.isEventGet = this.currentRoom.isEventGetArr.some((val) => val);
        ret = ServerUtils_1.ServerUtils.MakeRet(true);
        return { rewarded, ret };
    }
    checkEventCondition(event) {
        let eventConf = Xlsx_1.Xlsx.DungeonRoomEventConf.Get(event);
        if (!eventConf) {
            return false;
        }
        let unlock = true;
        if (eventConf.conditions.length > 0) {
            unlock = eventConf.conditions.every((r) => {
                return Util_1.U.CompareCondition(r.compare, this.getCompareTypeValue(r.type), r.compareValue);
            });
        }
        if (!unlock) {
            console.info("DungeonEvent", `event ${event} condition not targeted`);
        }
        return unlock;
    }
    checkEventConditions(room, events) {
        let noEvent = true;
        for (let event of events) {
            let unlock = this.checkEventCondition(event);
            room.events.push(event);
            if (!unlock) {
                room.invalidEvents.push(event);
            }
            else {
                noEvent = false;
            }
        }
        return noEvent;
    }
    refreshPhaseRoomRandomInfo() {
        for (let [key, value] of Object.entries(this.currentPhaseInfo.roomRandomed)) {
            value.rooms.forEach((r) => {
                let roomConf = Xlsx_1.Xlsx.BreedDungeonRoomConf.Get(r.roomType, this.currentPhaseInfo.theme, parseInt(key));
                let functions = this.dungeonFunctions(P.EBreedDungeonFunction.PhemeReplace).filter((val) => val.phemeReplace.roomType == r.roomType);
                let func = functions.find((val) => val.phemeReplace.oldTheme == this.currentPhaseInfo.theme);
                if (func) {
                    console.info("BreedFunction", `theme replace ${func.phemeReplace.oldTheme} => ${func.phemeReplace.newTheme}`);
                    roomConf = Xlsx_1.Xlsx.BreedDungeonRoomConf.Get(roomConf.roomType, func.phemeReplace.newTheme, roomConf.stageIndex);
                }
                if (roomConf)
                    this.setStageIdx(r, roomConf);
            });
        }
    }
    fillPhase() {
        let roundResult = Dungeon_1.DungeonUtils.GenerateRoundTypeResult();
        let extraRoomMap = new Map();
        let funcs = this.dungeonFunctions(P.EBreedDungeonFunction.ExtraHpShop);
        if (funcs.length > 0) {
            console.info("BreedFunction", `HpShop Extra count ${funcs[0].extraRoom.count}`);
            extraRoomMap.set(P.EBreedDungeonRoomType.HpShop, funcs[0].extraRoom.count);
        }
        let roomResult = Dungeon_1.DungeonUtils.GenerateRoomTypeResult(roundResult, 0, extraRoomMap);
        let rewardResult = Dungeon_1.DungeonUtils.GenerateRoomRewardResult(roundResult, roomResult);
        let replaceEliteFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.ExtraElite);
        if (replaceEliteFuncs.length > 0) {
            console.info("RoomRandom", `Elite Before: ${ServerUtils_1.ServerUtils.BuildRoomRandomLog(roundResult, Dungeon_1.DungeonUtils.BuildRealRoomTypeResult(roomResult, rewardResult), rewardResult)}`);
            let rFunc = replaceEliteFuncs[0];
            let rNum = rFunc.extraRoom.count;
            let arr = [];
            for (let phaseIdx = 0; phaseIdx < roomResult.length; phaseIdx++) {
                for (let roomIdx = 0; roomIdx < roomResult[phaseIdx].length; roomIdx++) {
                    if (roomResult[phaseIdx][roomIdx].includes(P.EBreedDungeonRoomType.Fight) && rFunc.extraRoom.replaceRoomRewardTypes.includes(rewardResult[phaseIdx][roomIdx])) {
                        arr.push({ phaseIdx: phaseIdx, roomIdx: roomIdx });
                    }
                }
            }
            if (arr.length - rNum > arr.length / 2) {
                Util_1.U.RandomSample(arr.slice(arr.length / 3, arr.length), rNum).forEach((result) => {
                    roomResult[result.phaseIdx][result.roomIdx].forEach((val, idx) => {
                        if (val == P.EBreedDungeonRoomType.Fight) {
                            roomResult[result.phaseIdx][result.roomIdx][idx] = P.EBreedDungeonRoomType.Elite;
                            rewardResult[result.phaseIdx][result.roomIdx] = P.EBreedDungeonRoomRewardType.Bless;
                        }
                    });
                });
            }
            else {
                for (let i = arr.length - 1; i >= 0; i--) {
                    if (rNum > 0) {
                        rNum--;
                        roomResult[arr[i].phaseIdx][arr[i].roomIdx].forEach((val, idx) => {
                            if (val == P.EBreedDungeonRoomType.Fight) {
                                roomResult[arr[i].phaseIdx][arr[i].roomIdx][idx] = P.EBreedDungeonRoomType.Elite;
                                rewardResult[arr[i].phaseIdx][arr[i].roomIdx] = P.EBreedDungeonRoomRewardType.Bless;
                            }
                        });
                    }
                }
            }
        }
        let replacePotentialFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.ExtraPotential);
        if (replacePotentialFuncs.length > 0) {
            console.info("RoomRandom", `SKill Before: ${ServerUtils_1.ServerUtils.BuildRoomRandomLog(roundResult, Dungeon_1.DungeonUtils.BuildRealRoomTypeResult(roomResult, rewardResult), rewardResult)}`);
            let rFunc = replacePotentialFuncs[0];
            let rNum = rFunc.extraRoom.count;
            let arr = [];
            for (let phaseIdx = 0; phaseIdx < roomResult.length; phaseIdx++) {
                for (let roomIdx = 0; roomIdx < roomResult[phaseIdx].length; roomIdx++) {
                    if (roomResult[phaseIdx][roomIdx].includes(P.EBreedDungeonRoomType.Fight) && rFunc.extraRoom.replaceRoomRewardTypes.includes(rewardResult[phaseIdx][roomIdx])) {
                        arr.push({ phaseIdx: phaseIdx, roomIdx: roomIdx });
                    }
                }
            }
            Util_1.U.RandomSample(arr, rNum).forEach((result) => {
                roomResult[result.phaseIdx][result.roomIdx].forEach((val, idx) => {
                    if (val == P.EBreedDungeonRoomType.Fight) {
                        rewardResult[result.phaseIdx][result.roomIdx] = P.EBreedDungeonRoomRewardType.Skill;
                    }
                });
            });
        }
        roomResult = Dungeon_1.DungeonUtils.BuildRealRoomTypeResult(roomResult, rewardResult);
        if (Player_1.ModelPlayer.Instance.GetAssistModeStatus()) {
            for (let i = 0; i < roundResult.length; i++) {
                let left = 0;
                let right = 0;
                for (let j = 1; j < roundResult[i].length - 1; j++) {
                    if (roundResult[i][j] != P.EBreedDungeonRoundType.Function) {
                        if (roundResult[i][j - 1] != P.EBreedDungeonRoundType.Function)
                            right = j;
                        if (left == right) {
                            left = j;
                            right = j;
                        }
                    }
                    else {
                        if (left != right)
                            break;
                    }
                }
                let delIndex = -1;
                if (left == right) {
                    delIndex = Math.round(Util_1.U.Random(1, 6));
                }
                else {
                    if (left == 0)
                        left++;
                    if (right == 7)
                        right--;
                    delIndex = Math.round(Util_1.U.Random(left, right));
                }
                roundResult[i] = roundResult[i].filter((_, idx) => idx != delIndex);
                roomResult[i] = roomResult[i].filter((_, idx) => idx != delIndex);
                rewardResult[i] = rewardResult[i].filter((_, idx) => idx != delIndex);
            }
        }
        console.info("RoomRandom", `${ServerUtils_1.ServerUtils.BuildRoomRandomLog(roundResult, roomResult, rewardResult)}`);
        for (let i = 0; i < roomResult.length; i++) {
            let phaseInfo = this.newPhaseInfo();
            roomResult[i].forEach((val, idx) => {
                let roomList = new P.STBreedDungeonRoomList();
                if (this.conf.tag == "newbie") {
                    let newbieConf = Xlsx_1.Xlsx.NewbieRoomConf.Get(i + 1, idx + 1, 3);
                    if (Player_1.ModelPlayer.Instance.GetAssistModeStatus()) {
                        if (idx >= 4)
                            newbieConf = Xlsx_1.Xlsx.NewbieRoomConf.Get(i + 1, idx + 2, 3);
                    }
                    if (newbieConf) {
                        roomList.rewardType = newbieConf.roundRewardType;
                        roomList.rooms = newbieConf.rooms.map((rr) => new P.STBreedDungeonRoom({ roomType: rr, finished: false }));
                    }
                    else {
                        roomList.rewardType = rewardResult[i][idx];
                        roomList.rooms = val.map((rr) => new P.STBreedDungeonRoom({ roomType: rr, finished: false }));
                    }
                }
                else {
                    roomList.rewardType = rewardResult[i][idx];
                    roomList.rooms = val.map((rr) => new P.STBreedDungeonRoom({ roomType: rr, finished: false }));
                }
                phaseInfo.roomRandomed[idx + 1] = roomList;
            });
            this.randomInfo.preparePhases.push(phaseInfo);
        }
    }
    getDeviceConf(deviceId) {
        return Xlsx_1.Xlsx.BreedDungeonDeviceConf.Get(deviceId);
    }
    isShopDevices(deviceId) {
        if (this._shopDevices && this._shopDevices.length > 0) {
            return this._shopDevices.includes(deviceId);
        }
        this._shopDevices = this.getCurrentShopRoomDevices();
        return this._shopDevices.includes(deviceId);
    }
    getCurrentShopRoomDevices() {
        let ret = new Set();
        let currentPhase = this.currentPhaseInfo;
        if (!currentPhase) {
            return [];
        }
        let currentRoom = this.currentRoom;
        if (!currentRoom) {
            return [];
        }
        let shopRoomTypes = [P.EBreedDungeonRoomType.Shop, P.EBreedDungeonRoomType.SpShop];
        if (!shopRoomTypes.includes(currentRoom.roomType)) {
            return [];
        }
        let roomConf = this.currentRoomConf;
        let devicesPoolId = roomConf.devicesPoolId;
        for (let poolId of devicesPoolId) {
            if (roomConf.roomType == P.EBreedDungeonRoomType.Shop) {
                let useAnotherPoolFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.UseAnotherPool);
                let func = useAnotherPoolFuncs.find((func) => func.useAnotherPool.roomType == P.EBreedDungeonRoomType.Shop && func.useAnotherPool.oldPoolId == poolId);
                if (func)
                    poolId = func.useAnotherPool.newPoolId;
            }
            let poolConf = Xlsx_1.Xlsx.BreedDungeonDevicePool.Get(poolId);
            for (let item of poolConf.devices) {
                ret.add(item.id);
            }
        }
        return Array.from(ret);
    }
    updateDeviceCost(cost) {
        let priceUpConf = Dungeon_1.DungeonUtils.GetSanBuffConfByType(this, P.EBreedDungeonSanBuffEffectType.ShopPriceUp);
        let heatShopPriceUp = this.dungeonFunctions(P.EBreedDungeonFunction.ShopPriceModify);
        let addPercent = 0;
        heatShopPriceUp.forEach((conf) => addPercent += conf.shopPriceModify.rate);
        if (priceUpConf && priceUpConf.effectParams) {
            let priceUpPercent = priceUpConf.effectParams[0];
            addPercent += priceUpPercent;
        }
        return Math.round(cost * (1 + (addPercent / 10000)));
    }
    updateSpDeviceInfo(deviceConf, deviceInfo) {
        if (deviceConf.type == P.EBreedDungeonDeviceType.ResToRes) {
            let ruleConf = Xlsx_1.Xlsx.BreedDungeonResToResDeviceRule.Get(deviceConf.ruleId);
            if (!ruleConf) {
                return;
            }
            let targetDeviceId = ruleConf.targetDeviceId;
            let targetDeviceConf = this.getDeviceConf(targetDeviceId);
            if (!targetDeviceConf) {
                return;
            }
            let targetDeviceInfo = this.getDeviceInfo(targetDeviceId);
            let resCount = this.resourceInfo.count[targetDeviceConf.costType];
            let useCount = targetDeviceConf.selectCount - targetDeviceInfo.canUseCount;
            if (useCount > targetDeviceConf.selectCost.length) {
                return;
            }
            let selectCostSlice = targetDeviceConf.selectCost.slice(useCount);
            for (let cost of selectCostSlice) {
                resCount -= cost;
                if (resCount < 0) {
                    break;
                }
            }
            let useCost = 0;
            if (resCount < 0) {
                useCost = -resCount;
            }
            else {
                useCost = selectCostSlice[selectCostSlice.length - 1] - resCount % selectCostSlice[selectCostSlice.length - 1];
            }
            if (this.isShopDevices(deviceInfo.id)) {
                useCost = this.updateDeviceCost(useCost);
            }
            deviceInfo.currentUseCost = useCost;
        }
        if (deviceConf.type == P.EBreedDungeonDeviceType.SpPreferedBless || deviceConf.type == P.EBreedDungeonDeviceType.EventSpPreferedBless) {
            let useCount = deviceConf.selectCount - deviceInfo.canUseCount;
            let refreshCount = deviceConf.refreshCount - deviceInfo.canRefreshCount;
            if (deviceInfo.canUseCount) {
                deviceInfo.currentUseCost = deviceConf.selectCost[useCount];
            }
            if (deviceInfo.canRefreshCount) {
                deviceInfo.currentRefreshCost = deviceConf.refreshCost[refreshCount];
            }
            if (this.isShopDevices(deviceInfo.id)) {
                let useCost = this.updateDeviceCost(deviceInfo.currentUseCost);
                deviceInfo.currentUseCost = useCost;
            }
        }
    }
    updateDeviceInfo(deviceConf, deviceInfo) {
        deviceInfo.callInfo.phaseIndex = this.currentPhaseIndex;
        deviceInfo.callInfo.roomIndex = this.currentPhaseInfo.rooms.length;
        let useCount = deviceConf.selectCount - deviceInfo.canUseCount;
        let refreshCount = deviceInfo.refreshedCount;
        let useCost = 0;
        let refreshCost = 0;
        if (!deviceConf.ruleId) {
            if (deviceConf.selectCost && deviceInfo.canUseCount > 0) {
                useCost = deviceConf.selectCost[useCount];
            }
            if (deviceConf.refreshCost && deviceInfo.canRefreshCount) {
                refreshCost = deviceConf.refreshCost[refreshCount];
            }
            if (this.isShopDevices(deviceInfo.id)) {
                useCost = this.updateDeviceCost(useCost);
            }
        }
        else {
            this.updateSpDeviceInfo(deviceConf, deviceInfo);
            useCost = deviceInfo.currentUseCost;
            refreshCost = deviceInfo.currentRefreshCost;
        }
        deviceInfo.currentUseCost = useCost;
        deviceInfo.currentRefreshCost = refreshCost;
    }
    getDeviceInfo(deviceId) {
        let deviceConf = this.getDeviceConf(deviceId);
        let devicesMap = this.deviceInfo.refreshDevices[deviceConf.refresh];
        if (!devicesMap) {
            devicesMap = { info: {} };
            this.deviceInfo.refreshDevices[deviceConf.refresh] = devicesMap;
        }
        let phaseInfo = this.currentPhaseInfo;
        let roomIndex = phaseInfo.rooms.length;
        let firstInit = false;
        if (!(deviceId in devicesMap.info)) {
            firstInit = true;
            devicesMap.info[deviceId] = new P.STBreedDungeonDevice({ callInfo: {} });
        }
        let deviceInfo = devicesMap.info[deviceId];
        let needRefresh = false;
        switch (deviceConf.refresh) {
            case P.EBreedDungeonRefreshType.Phase:
                needRefresh = deviceInfo.callInfo.phaseIndex != this.currentPhaseIndex;
                break;
            case P.EBreedDungeonRefreshType.Room:
                needRefresh = (deviceInfo.callInfo.phaseIndex != this.currentPhaseIndex) || (deviceInfo.callInfo.roomIndex != roomIndex);
                break;
            case P.EBreedDungeonRefreshType.Always:
                needRefresh = true;
                break;
        }
        if (needRefresh || firstInit) {
            let refreshCount = 0;
            this.dungeonFunctions(P.EBreedDungeonFunction.RefreshDevice).forEach((r) => {
                if (r.refreshDevice.deviceId == deviceId) {
                    refreshCount += r.refreshDevice.refreshCount;
                }
            });
            deviceInfo.id = deviceConf.deviceId;
            deviceInfo.type = deviceConf.type;
            deviceInfo.canUseCount = deviceConf.selectCount;
            deviceInfo.canRefreshCount = deviceConf.refreshCount + refreshCount;
            if (deviceConf.type == P.EBreedDungeonDeviceType.GambleInfinite) {
                if (Misc_1.Misc.breedDungeonMisc.isGambleInfinite) {
                    deviceInfo.infiniteGambleRandomed = [];
                }
                else {
                    deviceInfo.infiniteGambleRandomed = deviceInfo.infiniteGambleRandomed ?? [];
                }
                deviceInfo.infiniteGamblePool = deviceConf.infiniteGamblePool;
                let useAnotherPoolFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.UseAnotherPool);
                let func = useAnotherPoolFuncs.find((func) => func.useAnotherPool.roomType == P.EBreedDungeonRoomType.GambleInfinite && func.useAnotherPool.oldPoolId == deviceInfo.infiniteGamblePool);
                if (func) {
                    deviceInfo.infiniteGamblePool = func.useAnotherPool.newPoolId;
                }
            }
            this.updateDeviceInfo(deviceConf, deviceInfo);
        }
        return deviceInfo;
    }
    getInheritBless() {
        let inheritBlesses = new Array();
        this.baseInfo.factorActorUid.forEach((factorUid, index) => {
            if (!this.rewardInfo.inheritBlessEnable.includes(index + 1)) {
                return;
            }
            let factorActor = Player_1.ModelPlayer.Instance.GetFesActor(factorUid);
            if (factorActor) {
                let factorInheritBlesses = factorActor.inheritBlesses ?? [];
                factorInheritBlesses.forEach((factorBless) => {
                    let conf = Xlsx_1.Xlsx.BlessConf.Get(factorBless.id);
                    if (conf) {
                        if (conf.invalid)
                            return;
                        let findResult = inheritBlesses.find((b) => b.id == factorBless.id);
                        if (findResult) {
                            if (findResult.quality < factorBless.quality) {
                                findResult.quality = factorBless.quality;
                                return;
                            }
                        }
                        findResult = inheritBlesses.find((b) => {
                            let findBlessConf = Xlsx_1.Xlsx.BlessConf.Get(b.id);
                            let status = findBlessConf.triggerGroup != P.EPlayerTriggerGroup.None && findBlessConf.triggerGroup == conf.triggerGroup;
                            if (status)
                                return true;
                            status = findBlessConf.faction == conf.faction && findBlessConf.gradation == conf.gradation;
                            if (status) {
                                if (findBlessConf.gradation != 4)
                                    return true;
                            }
                            status = findBlessConf.secondFaction != 0 && conf.secondFaction != 0;
                            if (!status)
                                return false;
                            return findBlessConf.truePre[0] == conf.truePre[0];
                        });
                        if (findResult) {
                            return;
                        }
                        factorBless.source = P.EBreedDungeonBlessSource.Master;
                        inheritBlesses.push(factorBless);
                    }
                });
            }
        });
        return inheritBlesses;
    }
    sanBuffFunctions() {
        let ret = [];
        let buffLevelMap = Util_1.U.Counter(this.buffInfo.sanBuffsRound.map(r => r.buffId), this.buffInfo.sanDebuffsRound.map(r => r.buffId));
        for (let [k, v] of buffLevelMap) {
            let r = Xlsx_1.Xlsx.BreedDungeonSanBuffLevelConf.Get(k, v);
            if (!r) {
                continue;
            }
            if (r.effectType == P.EBreedDungeonSanBuffEffectType.DungeonFunction) {
                ret.push(...r.effectParams);
            }
        }
        return ret;
    }
    initFactorActorRewards() {
        let skillcount = 0;
        this.baseInfo.factorActorUid.forEach((factorUid, index) => {
            let factorActor = Player_1.ModelPlayer.Instance.GetFesActor(factorUid);
            if (!factorActor) {
                return;
            }
            let funcs = this.dungeonFunctions(P.EBreedDungeonFunction.MasterLimit);
            Xlsx_1.Xlsx.BreedDungeonInheritReward.All.filter((r) => {
                if (r.index != (index + 1)) {
                    return false;
                }
                if (r.actorId != factorActor.id) {
                    return false;
                }
                if (factorActor.score < r.unlockScore) {
                    return false;
                }
                return true;
            }).forEach((r) => {
                switch (r.inheritType) {
                    case P.EInheritType.Skill:
                        Actor_1.FesActorUtils.AddSkill(this.FesActor, P.STActiveSkill.create({
                            fromActorId: factorActor.id,
                            id: r.skill.id,
                            level: r.skill.level,
                        }));
                        skillcount++;
                        break;
                    case P.EInheritType.Talent:
                        if (funcs.some((func) => func.masterLimit.index == r.index && func.masterLimit.type == r.inheritType))
                            break;
                        Actor_1.FesActorUtils.AddTalent(this.FesActor, P.STTalent.create({
                            fromActorId: factorActor.id,
                            id: r.talent.id,
                            quality: r.talent.quality,
                        }));
                        break;
                    case P.EInheritType.Attr:
                        if (funcs.some((func) => func.masterLimit.index == r.index && func.masterLimit.type == r.inheritType))
                            break;
                        this.rewardInfo.inheritAttrs.push(...r.attrs);
                        break;
                    case P.EInheritType.Bless:
                        if (funcs.some((func) => func.masterLimit.index == r.index && func.masterLimit.type == r.inheritType))
                            break;
                        this.rewardInfo.inheritBlessEnable.push(r.index);
                    default:
                        break;
                }
            });
        });
        this.rewardInfo.inheritAttrs = (0, Actor_1.MergeAttr)(...this.rewardInfo.inheritAttrs);
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.InheritP0TeacherSkillMtimes, 1, this.FesActor.skills.length);
    }
    addFactorActorAttr() {
        let factorAttrAddRate = 0;
        this.dungeonFunctions(P.EBreedDungeonFunction.FactorAttrRewardAdd).forEach((r) => {
            factorAttrAddRate += (r.factorAttrRewardAdd.addRate / 10000);
        });
        let addAttrs = this.rewardInfo.inheritAttrs.map((a) => {
            return P.STAttr.create({
                type: a.type,
                value: a.value * (1 + factorAttrAddRate),
            });
        });
        Actor_1.FesActorUtils.AddAttr(this.FesActor, ...addAttrs);
    }
    extraAddResource() {
        let extraAddConf = Misc_1.Misc.breedDungeonMisc.modeResAdd[this.mode];
        if (extraAddConf) {
            for (let x of extraAddConf.resAdd) {
                this.addResource(x.type, x.count);
            }
        }
        this.dungeonFunctions(P.EBreedDungeonFunction.InitBreedResource).forEach((r) => {
            r.initBreedResource.breedResources.forEach((x) => {
                this.addResource(x.type, x.count);
            });
        });
    }
    selectRoom(selectRoomIndex = 0) {
        let phaseInfo = this.currentPhaseInfo;
        if (phaseInfo.rooms.length > 0) {
            let currentRoom = phaseInfo.rooms[phaseInfo.currentStageIndex - 1];
            if (!(currentRoom.finished && currentRoom.rewarded)) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonRoomNotFinished, "breed dungeon room not finished");
            }
        }
        phaseInfo.currentStageIndex += 1;
        let currentStageIndex = phaseInfo.currentStageIndex;
        let currentRooms = phaseInfo.roomRandomed[currentStageIndex].rooms;
        if (selectRoomIndex >= currentRooms.length) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, "select room index out of range");
        }
        let selectRoom = currentRooms[selectRoomIndex];
        let roomConf = Xlsx_1.Xlsx.BreedDungeonRoomConf.Get(selectRoom.roomType, phaseInfo.theme, currentStageIndex);
        if (!roomConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `breed dungeon room res type ${selectRoom.roomType}, theme ${phaseInfo.theme}, stage ${currentStageIndex}`);
        }
        if (selectRoom.roomType == P.EBreedDungeonRoomType.Shop)
            selectRoom.canRefreshCount = Misc_1.Misc.breedDungeonMisc.shopInitRefreshCount;
        phaseInfo.rooms.push(selectRoom);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    deviceConf(deviceId) {
        return Xlsx_1.Xlsx.BreedDungeonDeviceConf.Get(deviceId);
    }
    getPhaseRoomDevices(phaseInfo) {
        if (phaseInfo.currentStageIndex == 0) {
            return null;
        }
        else {
            if (!(phaseInfo.currentStageIndex - 1 in phaseInfo.roomDevices)) {
                phaseInfo.roomDevices[phaseInfo.currentStageIndex - 1] = P.STBreedDungeonDeviceMap.create({ info: {} });
            }
            return phaseInfo.roomDevices[phaseInfo.currentStageIndex - 1];
        }
    }
    eventRewardTypeToResType(rewardType) {
        switch (rewardType) {
            case P.EDungeonRoomEventRewardType.BlessQuality1:
                return P.EBreedDungeonResType.BlessQuality1;
            case P.EDungeonRoomEventRewardType.BlessQuality2:
                return P.EBreedDungeonResType.BlessQuality2;
            case P.EDungeonRoomEventRewardType.BlessQuality3:
                return P.EBreedDungeonResType.BlessQuality3;
            case P.EDungeonRoomEventRewardType.BlessQuality4:
                return P.EBreedDungeonResType.BlessQuality4;
            default:
                return P.EBreedDungeonResType.None;
        }
    }
    genCurrentRoomDevicesRecord(phaseInfo) {
        let curRoom = this.currentRoom;
        if (!curRoom) {
            return false;
        }
        let phaseStageConf = Xlsx_1.Xlsx.BreedDungeonPhaseStageConf.Get(this.Id, phaseInfo.phaseIndex, phaseInfo.currentStageIndex);
        if (!phaseStageConf) {
            return false;
        }
        let roomDevices = this.getPhaseRoomDevices(phaseInfo);
        for (let deviceId of phaseStageConf.deviceIds) {
            let deviceInfo = this.getDeviceInfo(deviceId);
            roomDevices.info[deviceId] = deviceInfo;
        }
        let roomConf = Xlsx_1.Xlsx.BreedDungeonRoomConf.Get(curRoom.roomType, phaseInfo.theme, phaseInfo.currentStageIndex);
        if (!roomConf) {
            return false;
        }
        for (let deviceId of roomConf.deviceIds) {
            let deviceInfo = this.getDeviceInfo(deviceId);
            deviceInfo.deviceFrom = P.EBreedDungeonDeviceFrom.RoomFix;
            roomDevices.info[deviceId] = deviceInfo;
        }
        let hpFlaskCount = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskCount);
        let useCount = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskUseCount, true);
        let hpFlaskCountMax = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HealthFlaskCountMax);
        let hpFlaskMax = (hpFlaskCount - useCount) >= hpFlaskCountMax;
        if (roomConf.devicesPoolId.length > 0) {
            let randomedList = [];
            let gambleType = P.EBreedDungeonGambleType.None;
            for (let poolId of roomConf.devicesPoolId) {
                if (roomConf.roomType == P.EBreedDungeonRoomType.Shop) {
                    let useAnotherPoolFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.UseAnotherPool);
                    let func = useAnotherPoolFuncs.find((func) => func.useAnotherPool.roomType == P.EBreedDungeonRoomType.Shop && func.useAnotherPool.oldPoolId == poolId);
                    if (func)
                        poolId = func.useAnotherPool.newPoolId;
                }
                let devicesPool = Xlsx_1.Xlsx.BreedDungeonDevicePool.Get(poolId);
                if (!devicesPool) {
                    continue;
                }
                if (devicesPool.devices) {
                    let deviceWeightMod = this.dungeonFunctions(P.EBreedDungeonFunction.DeviceWeightModify, curRoom);
                    let weightMap = new Util_1.U.DefaultNumberMap();
                    deviceWeightMod.forEach((mod) => {
                        mod.deviceWeightModify.deviceWeights.forEach((weight) => {
                            weightMap.set(weight.deviceId, weight.weight);
                        });
                    });
                    let randomCount = devicesPool.randomCount;
                    if (randomCount > 0) {
                        for (let i = 0; i < randomCount; i++) {
                            let randomList = [];
                            for (let device of devicesPool.devices) {
                                let deviceConf = this.deviceConf(device.id);
                                if (!deviceConf) {
                                    continue;
                                }
                                if (deviceConf.type == P.EBreedDungeonDeviceType.RemoveSanDebuff && this.buffInfo.sanDebuffsRound.length == 0) {
                                    continue;
                                }
                                if (deviceConf.showupMax > 0 && ((this.randomInfo.deviceShowupCount[device.id] ?? 0) >= deviceConf.showupMax)) {
                                    continue;
                                }
                                if ((roomConf.roomType == P.EBreedDungeonRoomType.Gamble) &&
                                    (gambleType != P.EBreedDungeonGambleType.None) &&
                                    (deviceConf.gambleType != gambleType)) {
                                    continue;
                                }
                                if (deviceConf.type == P.EBreedDungeonDeviceType.Attr) {
                                    if (deviceConf.attrs.some((r) => r.type == P.EAttrType.HealthFlaskCount) && hpFlaskMax) {
                                        continue;
                                    }
                                }
                                if (deviceConf.type == P.EBreedDungeonDeviceType.Gamble) {
                                    let gambleConf = Xlsx_1.Xlsx.BreedDungeonGambleRandomConf.Get(deviceConf.gambleId);
                                    if (gambleConf.attrs.some((r) => r.type == P.EAttrType.HealthFlaskCount) && hpFlaskMax) {
                                        continue;
                                    }
                                }
                                if (deviceConf.type == P.EBreedDungeonDeviceType.AddBuff) {
                                    if (deviceConf.rewardBuff.some((buffRound) => this.buffInfo.sanBuffsRound.findIndex((val) => val.buffId == buffRound.buffId) >= 0))
                                        continue;
                                }
                                if (deviceConf.type == P.EBreedDungeonDeviceType.SpPreferedBless || deviceConf.type == P.EBreedDungeonDeviceType.PreferedBless) {
                                    if (this.blessRandomGenerator.GetBlessFactionCanRandom().length == 0) {
                                        continue;
                                    }
                                }
                                if (randomedList.map((r) => r.deviceId).includes(device.id)) {
                                    continue;
                                }
                                randomList.push(new ServerUtils_1.ServerUtils.ElementWithWeight(weightMap.get(device.id, device.weight), deviceConf));
                            }
                            if (randomList.length == 0) {
                                break;
                            }
                            let result = ServerUtils_1.ServerUtils.RandomWeighted(randomList);
                            randomedList.push({ deviceId: result.deviceId, priority: devicesPool.priority });
                            if (roomConf.roomType == P.EBreedDungeonRoomType.Gamble) {
                                gambleType = result.gambleType;
                            }
                        }
                    }
                }
            }
            for (let randomResult of randomedList) {
                let deviceInfo = this.getDeviceInfo(randomResult.deviceId);
                deviceInfo.lock = false;
                deviceInfo.deviceFrom = P.EBreedDungeonDeviceFrom.RoomRandom;
                roomDevices.info[randomResult.deviceId] = deviceInfo;
                deviceInfo.discount = 0;
                deviceInfo.priority = randomResult.priority;
                let conf = this.deviceConf(deviceInfo.id);
                if (conf.dynamicBlessSeries) {
                    let seriesArr = this.blessRandomGenerator.GetBlessSeriesCanRandom();
                    if (seriesArr.length > 0)
                        deviceInfo.series = seriesArr[0];
                }
            }
            if (curRoom.roomType == P.EBreedDungeonRoomType.Shop) {
                if (randomedList.length > 1) {
                    let shopLockFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.ShopChoiceLock);
                    if (shopLockFuncs.length > 0) {
                        let shopLockCount = shopLockFuncs[0].choiceLock.count;
                        let devices = Util_1.U.RandomSample(randomedList, shopLockCount);
                        devices.forEach((device) => roomDevices.info[device.deviceId].lock = true);
                    }
                }
            }
            if (curRoom.roomType == P.EBreedDungeonRoomType.Shop) {
                let discount = Util_1.U.Sum(this.dungeonFunctions(P.EBreedDungeonFunction.ShopDeviceDisccount, curRoom).map((mod) => mod?.shopDeviceDiscount?.discount ?? 0));
                let noLockDeviceList = randomedList.filter((val) => !roomDevices.info[val.deviceId].lock);
                let discountDevice = Util_1.U.RandomChoice(noLockDeviceList);
                roomDevices.info[discountDevice.deviceId].discount = discount;
                roomDevices.info[discountDevice.deviceId].priority = discountDevice.priority;
            }
        }
        let deviceReplaceFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.DeviceReplace);
        deviceReplaceFuncs.forEach((func) => {
            if (func.deviceReplace.oldDeviceId in roomDevices.info) {
                let deviceInfo = roomDevices.info[func.deviceReplace.oldDeviceId];
                delete roomDevices.info[func.deviceReplace.oldDeviceId];
                roomDevices.info[func.deviceReplace.newDeviceId] = this.getDeviceInfo(func.deviceReplace.newDeviceId);
                roomDevices.info[func.deviceReplace.newDeviceId].lock = deviceInfo.lock;
                roomDevices.info[func.deviceReplace.newDeviceId].priority = deviceInfo.priority;
                roomDevices.info[func.deviceReplace.newDeviceId].discount = deviceInfo.discount;
            }
        });
        return true;
    }
    dropReward(dropInfo, roomConf, noDamageTaken = false) {
        let currentRoom = this.currentRoom;
        if (!currentRoom) {
            return;
        }
        let typeSet = new Set();
        let dropConfRes = new Util_1.U.DefaultNumberMap();
        if (currentRoom.dropId) {
            let resDropConf = Xlsx_1.Xlsx.BreedDungeonResDrop.Get(currentRoom.dropId);
            if (!resDropConf) {
                return;
            }
            if (roomConf.extraResAdd) {
                let dropByType = {};
                for (let dropItem of resDropConf.resDrop) {
                    dropByType[dropItem.type] = dropItem.count;
                }
                for (let [attrType, resType] of Actor_1.FesActorUtils.EXTRA_RES_DROP_ATTR_TYPE) {
                    let addRatio = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, attrType);
                    this.addResource(resType, Math.round(dropByType[resType] * addRatio));
                }
            }
            for (let dropItem of resDropConf.resDrop) {
                typeSet.add(dropItem.type);
                dropConfRes.add(dropItem.type, dropItem.count);
            }
        }
        if (roomConf.dropId) {
            let fixedDropConf = Xlsx_1.Xlsx.BreedDungeonResDrop.Get(roomConf.dropId);
            for (let dropItem of fixedDropConf.resDrop) {
                typeSet.add(dropItem.type);
                dropConfRes.add(dropItem.type, dropItem.count);
            }
        }
        let san = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.San, true);
        let resourceAddFunctions = this.dungeonFunctions(P.EBreedDungeonFunction.ResourceAdd, currentRoom);
        let quickFinishRewards = this.dungeonFunctions(P.EBreedDungeonFunction.QuickFinishReward, currentRoom);
        let addRateByType = new Util_1.U.DefaultMap([]);
        let addValueByType = new Util_1.U.DefaultMap([]);
        if (Dungeon_1.DungeonUtils.FightRoomType(currentRoom.roomType)) {
            for (let qfr of quickFinishRewards) {
                if (currentRoom.useTime <= qfr.quickFinishReward.timeLimit) {
                    for (let v of qfr.quickFinishReward.dropAdds) {
                        if (v.isRatio) {
                            addRateByType.get(v.type).push(v.value / 10000);
                        }
                        else {
                            addValueByType.get(v.type).push(v.value);
                        }
                    }
                }
            }
        }
        if (noDamageTaken) {
            let noDamgageTakenRewards = this.dungeonFunctions(P.EBreedDungeonFunction.NoDamageTakenReward, currentRoom);
            if (Dungeon_1.DungeonUtils.FightRoomType(currentRoom.roomType)) {
                for (let ndtr of noDamgageTakenRewards) {
                    if (ndtr.noDamageTakenReward.limitRoomType != P.EBreedDungeonRoomType.None) {
                        if (ndtr.noDamageTakenReward.limitRoomType != currentRoom.roomType)
                            continue;
                    }
                    for (let v of ndtr.noDamageTakenReward.dropAdds) {
                        if (v.isRatio) {
                            addRateByType.get(v.type).push(v.value / 10000);
                        }
                        else {
                            addValueByType.get(v.type).push(v.value);
                        }
                    }
                    Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, ndtr.noDamageTakenReward.hpRecover / 10000);
                }
            }
        }
        for (let r of resourceAddFunctions) {
            for (let v of r.resourceAdd.resources) {
                if (v.isRatio) {
                    if (v.useHeatValue) {
                        addRateByType.get(v.type).push(this.baseInfo.heat / 100);
                    }
                    else {
                        addRateByType.get(v.type).push(v.value / 10000);
                    }
                }
                else {
                    addValueByType.get(v.type).push(v.value);
                }
            }
        }
        let sanAddRate = Dungeon_1.DungeonUtils.GetAddRateBySanValue(this.mode, san);
        for (let dropType of typeSet) {
            let addrate = Util_1.U.Sum(addRateByType.get(dropType));
            console.info("BreedFunction", `res add rate: ${addrate} dropType:${dropType}`);
            if (roomConf.roomType == P.EBreedDungeonRoomType.Boss) {
                this.addResource(dropType, dropConfRes.get(dropType), true, sanAddRate + addrate);
            }
            else {
                this.addResource(dropType, (dropInfo?.breedResCount[dropType] ?? 0), true, sanAddRate + addrate);
            }
        }
        for (let [dropType, addValues] of addValueByType) {
            this.addResource(dropType, Util_1.U.Sum(addValues), false);
        }
        if (dropInfo?.resources.length > 0) {
            let resList = dropInfo?.resources;
            if (currentRoom.rewardType == P.EBreedDungeonRoomRewardType.Ap)
                resList.push(Util_1.U.DeepCopy(Misc_1.Misc.randomRoomMisc.apReward));
            let playerResAddFunc = this.dungeonFunctions(P.EBreedDungeonFunction.PlayerResourceAdd);
            resList.forEach((res) => {
                let addFunc = playerResAddFunc.find((val) => val.playerResAdd.type == res.id && val.playerResAdd.id == res.id);
                let newRes = new P.STResource(res);
                if (addFunc) {
                    if (addFunc.playerResAdd.useHeatValue) {
                        newRes.count = Math.round(newRes.count * (1 + this.baseInfo.heat / 100));
                    }
                    else {
                        newRes.count = Math.round(newRes.count * (1 + addFunc.playerResAdd.addRate / 10000));
                    }
                    console.info("BreedFunction", `player res add type:${res.type} id:${res.id} old:${res.count} new:${newRes.count}`);
                }
                this.rewardInfo.rewards.push(newRes);
            });
        }
    }
    checkRoomFinishType(activeInfo, roomInfo) {
        roomInfo.finishType = P.ERoomFinishType.Normal;
        if (this.randomInfo.usedAttrToResDevices.includes(Misc_1.Misc.breedDungeonMisc.startCountPerfectAfterDevice)) {
            if (Dungeon_1.DungeonUtils.RoomFinishTypeRelated.includes(roomInfo.roomType)) {
                if (activeInfo.damageTaken == 0) {
                    roomInfo.finishType = P.ERoomFinishType.Perfect;
                    this.rewardInfo.perfectFinishRoomCount++;
                }
            }
        }
    }
    finishRoom(useTime, activeInfo, dropInfo) {
        let phaseInfo = this.currentPhaseInfo;
        if (phaseInfo.rooms.length < phaseInfo.currentStageIndex) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonRoomNotSelected, "breed dungeon room not selected");
        }
        let roomInfo = this.currentRoom;
        roomInfo.finished = true;
        roomInfo.useTime = useTime;
        Actor_1.FesActorUtils.FillActiveAttrsWithReq(this.FesActor, ...activeInfo?.activeAttrs);
        Object.keys(activeInfo.monsterKilled).forEach((k) => {
            let count = activeInfo.monsterKilled[k];
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.KillPnMonsterMtimes, count, k);
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.KillPnMonsterUsingP0ActorMtimes, count, this.FesActor.id, k);
        });
        let roomConf = this.currentRoomConf;
        if (!roomConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, "breed dungeon theme stage room res not found");
        }
        if (roomConf.roomType == P.EBreedDungeonRoomType.Boss && roomConf.boss && roomConf.boss.potentialReward) {
            this.rewardInfo.potentialReward = true;
        }
        phaseInfo.totalDamageTaken += activeInfo.damageTaken;
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.FinishP0TypeRoomLeP1DamageMtimes, 1, roomConf.roomType, activeInfo.damageTaken);
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.FinishP0TypeRoomLeP1SecondsMtimes, 1, roomConf.roomType, useTime);
        if (!this.phaseFinished) {
            let r = this.randomRoomPlot(phaseInfo.currentStageIndex + 1);
            if (!r.success) {
                return r;
            }
        }
        if (Dungeon_1.DungeonUtils.FightRoomType(roomInfo.roomType)) {
            this.addFactorActorAttr();
        }
        if (roomInfo.roomType == P.EBreedDungeonRoomType.Boss) {
            this.rewardInfo.dungeonBossKilled.push(roomInfo.stageIdx);
            let plotsDroped = this.rewardInfo.rewards.filter((r) => r.type == P.EResourceType.PlotFragment);
            let plotFragments = Common_1.CommonUtils.DropPlotFragment(roomConf.boss?.plotDropRule, plotsDroped);
            if (plotFragments.length > 0) {
                this.rewardInfo.rewards.push(...plotFragments);
            }
            Player_1.ModelPlayer.Instance.RecordKilledBosses(`${phaseInfo.theme}`);
            let res;
            switch (this.currentPhaseIndex) {
                case 1:
                    res = this.checkHeatReward(P.EHeatRewardCondition.PassStage1);
                    break;
                case 2:
                    res = this.checkHeatReward(P.EHeatRewardCondition.PassStage2);
                    break;
                case 3:
                    res = this.checkHeatReward(P.EHeatRewardCondition.PassStage3);
                    break;
                case 4:
                    res = this.checkHeatReward(P.EHeatRewardCondition.PassStage4);
                    break;
            }
            if (res)
                this.rewardInfo.rewards.push(res);
            if (activeInfo.damageTaken == 0) {
                this.buffInfo.sanDebuffsRound = [];
                Dungeon_1.DungeonUtils.AddNewSanBuffDirect(this, 2, false);
            }
        }
        this.recoveryHp(roomInfo);
        let resources = this.dungeonFunctions(P.EBreedDungeonFunction.FinishPlayerResource, roomInfo);
        resources.forEach((v) => {
            this.rewardInfo.rewards.push(...v.finishPlayerResource.resources);
        });
        this.dropReward(dropInfo, roomConf, activeInfo.damageTaken == 0);
        this.checkRoomFinishType(activeInfo, roomInfo);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    recoveryHp(roomInfo) {
        let disableHpRecovery = Dungeon_1.DungeonUtils.GetSanBuffConfByType(this, P.EBreedDungeonSanBuffEffectType.HpRecoveryDisable);
        if (disableHpRecovery) {
            return;
        }
        if (Dungeon_1.DungeonUtils.FightRoomType(roomInfo.roomType)) {
            let value = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.DungeonRoomFinishHpRecovery);
            Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, value);
        }
        let finishHpRecovers = this.dungeonFunctions(P.EBreedDungeonFunction.FinishHpRecover, roomInfo);
        finishHpRecovers.forEach((r) => {
            Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, r.finishRoomHpRecover.value, r.finishRoomHpRecover.isRatio);
        });
    }
    checkPotentialReward() {
        if (!this.rewardInfo.potentialReward) {
            return { reward: false, ret: ServerUtils_1.ServerUtils.MakeRet(true) };
        }
        this.rewardInfo.potentialReward = false;
        if (this.refreshPotentialReward()) {
            return { reward: true, ret: ServerUtils_1.ServerUtils.MakeRet(true) };
        }
        return { reward: false, ret: ServerUtils_1.ServerUtils.MakeRet(true) };
    }
    checkAttrReward() {
        let ret = [];
        let roomConf = this.currentRoomConf;
        if (!roomConf) {
            return ret;
        }
        let attrsDrop = Dungeon_1.DungeonUtils.GetAttrDrop(roomConf.attrsDropPool);
        let dropAttrAdd = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.AttrDropAdd);
        ret = attrsDrop.map(x => {
            return {
                type: x.type,
                value: x.value + dropAttrAdd,
            };
        });
        return ret;
    }
    selectBless(blessIndex, source) {
        let stageRewards = this.rewardInfo.stageSelectRewards;
        let reward = stageRewards.rewards[blessIndex];
        let bless = Bless_1.BlessUtils.SkillToBless(reward.skill);
        if (source != P.EBreedDungeonBlessSource.None) {
            bless.source = source;
        }
        this.costResource(P.EBreedDungeonResType.QualityPoint, reward.skill.quality - reward.skill.oldQuality);
        if (!bless.history)
            bless.history = new Array();
        bless.history.push(new P.DungeonInfo({
            phaseIndex: this.currentPhaseIndex,
            roomIndex: this.currentPhaseInfo.currentStageIndex,
            oldQuality: reward.skill.oldQuality,
            newQuality: reward.skill.quality
        }));
        Actor_1.FesActorUtils.AddBless(this.FesActor, bless);
        this.blessRandomGenerator.UpdateBless(bless);
        if (reward.replaceSkill) {
            Actor_1.FesActorUtils.DelBless(this.FesActor, Bless_1.BlessUtils.SkillToBless(reward.replaceSkill));
        }
        if (reward.inheritBless.length > 0) {
            for (let b of reward.inheritBless) {
                Actor_1.FesActorUtils.AddBless(this.FesActor, b);
                this.blessRandomGenerator.UpdateBless(b);
            }
        }
        switch (stageRewards.rewardType) {
            case P.EBreedDungeonStageSelectRewardType.PreferedBless:
                break;
            case P.EBreedDungeonStageSelectRewardType.UpgradeBless:
                this.rewardInfo.blessUpgradeCount[bless.id] += 1;
                break;
            case P.EBreedDungeonStageSelectRewardType.IterateBless:
                this.rewardInfo.rewardedIteratedBlesses.push(bless.id);
                break;
            default:
                break;
        }
        this.rewardInfo.stageSelectRewards = P.STBreedDungeonStageSelectRewards.create();
        if (!this.baseInfo.selectedBlesses.includes(bless.id)) {
            this.baseInfo.selectedBlesses.push(bless.id);
            Dungeon_1.DungeonUtils.CheckBlessSeriesAch(this.baseInfo.selectedBlesses);
        }
        Actor_1.FesActorUtils.RefreshBlessActive(this.FesActor.blesses);
        console.info("Random", `current bless count ${this.baseInfo.selectedBlesses.length}`);
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.SelectMbless, 1);
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Task, P.ETaskType.SelectMdiffrentBless, 1, bless.id);
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.SelectMdiffrentBless, 1, bless.id);
        const conf = Xlsx_1.Xlsx.BlessConf.Get(bless.id);
    }
    selectPotential(potentialIndex) {
        let rewardInfo = this.rewardInfo.stageSelectRewards;
        if (potentialIndex >= rewardInfo.rewards.length) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, "select potential index invalid");
        }
        this.rewardInfo.potentialRefreshRecord = [];
        let potential = Potential_1.PotentialUtils.SkillToPotential(rewardInfo.rewards[potentialIndex].skill);
        if (!potential.history)
            potential.history = new Array();
        potential.history.push(new P.DungeonInfo({
            phaseIndex: this.currentPhaseIndex,
            roomIndex: this.currentPhaseInfo.currentStageIndex,
        }));
        Actor_1.FesActorUtils.AddPotential(this.FesActor, potential);
        this.potentialRandomGenerator.UpdatePotential(potential);
        this.rewardInfo.stageSelectRewards = P.STBreedDungeonStageSelectRewards.create();
        if (!this.baseInfo.selectedPotential.includes(potential.id)) {
            this.baseInfo.selectedPotential.push(potential.id);
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.GetMdiffrentPotentials, 1);
            Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.TotalGetMdifferentPotential, 1);
        }
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.GetMpotential, 1);
        console.info("Random", `current potential count ${this.baseInfo.selectedPotential.length}`);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    selectTalent(talentIndex) {
        let rewardInfo = this.rewardInfo.stageSelectRewards;
        Actor_1.FesActorUtils.AddTalent(this.FesActor, rewardInfo.rewards[talentIndex].talent);
        this.rewardInfo.stageSelectRewards = P.STBreedDungeonStageSelectRewards.create();
    }
    costDevice(deviceConf, deviceInfo, leftDebt, room) {
        if (deviceInfo.type != deviceConf.type) {
            return { cost: 0, success: false };
        }
        if (deviceInfo.canUseCount == 0) {
            return { cost: 0, success: false };
        }
        let discount = deviceInfo.discount > 0 ? deviceInfo.discount : 10000;
        let cost = Math.round(deviceInfo.currentUseCost * (discount / 10000));
        let leftDebtCostType = leftDebt.get(deviceConf.costType);
        if (this.resourceEnough(deviceConf.costType, cost, leftDebtCostType)) {
            this.costResource(deviceConf.costType, cost);
        }
        else {
            return { cost: 0, success: false };
        }
        deviceInfo.canUseCount -= 1;
        deviceInfo.discount = 0;
        this.updateDeviceInfo(deviceConf, deviceInfo);
        return { cost: cost, success: true };
    }
    refreshDevice(deviceConf, deviceInfo, leftDebt, room) {
        if (deviceInfo.type != deviceConf.type) {
            return { cost: 0, success: false };
        }
        if (deviceInfo.canRefreshCount == 0) {
            return { cost: 0, success: false };
        }
        let cost = deviceInfo.currentRefreshCost;
        let leftDebtCostType = leftDebt.get(deviceConf.costType);
        if (this.resourceEnough(deviceConf.costType, cost, leftDebtCostType)) {
            this.costResource(deviceConf.costType, cost);
        }
        else {
            return { cost: 0, success: false };
        }
        deviceInfo.canRefreshCount -= 1;
        deviceInfo.refreshedCount += 1;
        this.updateDeviceInfo(deviceConf, deviceInfo);
        return { cost: cost, success: true };
    }
    randomGambleEffect(gambleId, room) {
        let gambleConf = Xlsx_1.Xlsx.BreedDungeonGambleRandomConf.Get(gambleId);
        if (!gambleConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `gamble ${gambleId} conf not found`);
        }
        if (gambleConf.sanBuffPool != 0) {
            Dungeon_1.DungeonUtils.AddNewSanBuffDirect(this, gambleConf.sanBuffPool);
        }
        if (gambleConf.recoveryType != P.EAttrType.None) {
            Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, gambleConf.recoveryType, gambleConf.recoverValue, gambleConf.isRecoverRatio);
        }
        if (gambleConf.resDropPool != 0) {
            let dropWeights = this.dungeonFunctions(P.EBreedDungeonFunction.DropIdWeightModify, room);
            let dropWeightMod = new Util_1.U.DefaultNumberMap();
            dropWeights.forEach((v) => {
                v.dropIdWeightModify.dropIdWeights.forEach((r) => {
                    dropWeightMod.set(r.dropId, r.weight);
                });
            });
            let dropId = Buff_1.BuffUtils.BreedDropRandomDirect(gambleConf.resDropPool, dropWeightMod);
            let resDropConf = Xlsx_1.Xlsx.BreedDungeonResDrop.Get(dropId);
            if (!resDropConf) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `res drop ${dropId} conf not found`);
            }
            for (let r of resDropConf.resDrop) {
                this.addResource(r.type, r.count);
            }
            this.rewardInfo.rewards.push(...resDropConf.playerResource);
        }
        if (gambleConf.attrs.length > 0) {
            Actor_1.FesActorUtils.AddAttr(this.FesActor, ...gambleConf.attrs);
        }
        if (gambleConf.potentialReward) {
            if (!this.refreshPotentialReward()) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonPotentialRandomPotentialFailed, "no more potential");
            }
        }
        if (gambleConf.blessQualityUpCount > 0) {
            this.refreshBlessUpReward(gambleConf.blessQualityUpCount);
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    randomRoomPlot(index) {
        let excludeIndex = Misc_1.Misc.breedDungeonMisc.phasePlotExcludeRange[this.currentPhaseIndex];
        if (excludeIndex?.index.includes(index)) {
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        let rooms = this.currentPhaseInfo.roomRandomed[index]?.rooms;
        let plots = Player_1.ModelPlayer.Instance.GetPlots();
        let plotByRoomType = new Util_1.U.DefaultMap([]);
        plots.forEach((v) => {
            let plotConf = Xlsx_1.Xlsx.PlotConf.Get(v);
            if (!plotConf) {
                return;
            }
            for (let rt of plotConf.validRoomTypes) {
                plotByRoomType.get(rt, []).push(plotConf);
            }
        });
        for (let r of rooms) {
            let rtPlots = plotByRoomType.get(r.roomType);
            if (rtPlots.length == 0) {
                continue;
            }
            let randomConf = Xlsx_1.Xlsx.PlotRoomRandomConf.Get(r.roomType, rtPlots.length, 1);
            if (!randomConf) {
                continue;
            }
            let plotCount = ServerUtils_1.ServerUtils.RandomWeighted(randomConf.plotCountWeights.map((v) => {
                return { weight: v.weight, value: v.plotCount };
            }));
            let plots = Util_1.U.RandomSample(rtPlots, plotCount ?? 0);
            console.log("BreedDungeon", `${P.EBreedDungeonRoomType[r.roomType]} PlotCount ${plotCount} Plots ${plots.map((r) => r.id)}`);
            for (let p of plots) {
                r.plots.push(p.id);
                r.functions.push(...p.activeEffects);
            }
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    addDungeonFunction(...funcs) {
        this.functionInfo.list.push(...funcs);
    }
    addPhaseFunctions(phaseInfo, ...funcs) {
        phaseInfo.functions.push(...funcs);
    }
    dungeonFunctions(functionType, room = null, onlyRoom = false) {
        let funcconfs = [];
        let curRoom = room ?? this.currentRoom;
        if (curRoom) {
            let functions = curRoom.functions.concat(curRoom.sanFunctions);
            functions.forEach((v) => {
                let funcconf = Xlsx_1.Xlsx.BreedDungeonFunctionConf.Get(v, 1);
                if (!funcconf) {
                    return;
                }
                if (funcconf.type == functionType) {
                    funcconfs.push(funcconf);
                }
            });
            if (onlyRoom) {
                return funcconfs;
            }
        }
        this.currentPhaseInfo?.functions.forEach((v) => {
            let funcconf = Xlsx_1.Xlsx.BreedDungeonFunctionConf.Get(v, 1);
            if (!funcconf) {
                return;
            }
            if (funcconf.type == functionType) {
                funcconfs.push(funcconf);
            }
        });
        this.functionInfo.list.forEach((v) => {
            let funcconf = Xlsx_1.Xlsx.BreedDungeonFunctionConf.Get(v, 1);
            if (!funcconf) {
                return;
            }
            if (funcconf.type == functionType) {
                funcconfs.push(funcconf);
            }
        });
        return funcconfs;
    }
    refreshModeTrigger() {
        this.buffInfo.modeTriggers = [];
        this.buffInfo.modeEnvTriggers = [];
        let triggers = this.dungeonFunctions(P.EBreedDungeonFunction.ModeTrigger).concat(this.dungeonFunctions(P.EBreedDungeonFunction.Trigger));
        triggers.forEach((r) => {
            this.buffInfo.modeTriggers.push(...r.trigger.triggers);
            this.buffInfo.modeEnvTriggers.push(...r.trigger.envTrigger);
        });
        if (this.baseInfo.heat > 0 && Misc_1.Misc.heatMisc.bossEnhanceTrigger != 0) {
            this.buffInfo.modeEnvTriggers.push(new P.STMonsterEnvTrigger({
                id: Misc_1.Misc.heatMisc.bossEnhanceTrigger,
                level: this.baseInfo.heat,
                whiteTags: "Boss"
            }));
        }
    }
    initHeatInfo() {
        let heatRecord = Player_1.ModelPlayer.Instance.GetHeatSelectRecord();
        let heatDebuffEffects = new Array();
        for (let [heatPunishType, level] of Object.entries(heatRecord.punishLevelMap)) {
            if (level == 0)
                continue;
            let heatPunishConf = Xlsx_1.Xlsx.HeatPunishConf.Get(parseInt(heatPunishType), level);
            if (!heatPunishConf)
                continue;
            this.baseInfo.heat += heatPunishConf.san;
            heatDebuffEffects.push(...heatPunishConf.effects.filter((val) => val != 0));
        }
        let heatBuffEffects = new Array();
        let effectRecord = Player_1.ModelPlayer.Instance.GetHeatEffectRecord();
        for (let [effectId, status] of Object.entries(effectRecord.heatEffectSwitchMap)) {
            if (status) {
                let effectConf = Xlsx_1.Xlsx.HeatEffectConf.Get(parseInt(effectId));
                if (effectConf) {
                    let effectArr = new Array();
                    effectConf.level.forEach((level) => {
                        if (this.baseInfo.heat >= level.activeSan)
                            effectArr = level.effects;
                    });
                    heatBuffEffects.push(...effectArr);
                }
            }
        }
        this.addDungeonFunction(...heatDebuffEffects);
        this.addDungeonFunction(...heatBuffEffects);
    }
    checkHeatReward(condition) {
        for (let i = 0; i < Xlsx_1.Xlsx.HeatRewardConf.All.length; i++) {
            let conf = Xlsx_1.Xlsx.HeatRewardConf.All[i];
            if (conf.sanMin > 999)
                continue;
            if (!(conf.level in this.rewardInfo.heatRewardMap.levelMap)) {
                this.rewardInfo.heatRewardMap.levelMap[conf.level] = new P.RewardLevelConditionMap.ConditionMap({ condMap: {} });
            }
            let condMap = this.rewardInfo.heatRewardMap.levelMap[conf.level].condMap;
            for (let j = 0; j < conf.reward.length; j++) {
                let r = conf.reward[j];
                if (r.cond != condition)
                    continue;
                if (!(r.cond in condMap))
                    condMap[r.cond] = 0;
                if (r.max > condMap[r.cond]) {
                    condMap[r.cond] += 1;
                    return r.res;
                }
            }
        }
        return null;
    }
    BreedDungeonEnter(req, res) {
        if (this.baseInfo?.actorId) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotFinish, "breed dungeon not finish");
        }
        this.clear();
        this.baseInfo.id = req.breedDungeonId;
        this.baseInfo.mode = req.mode;
        if (Player_1.ModelPlayer.Instance.GetAssistModeStatus()) {
            Xlsx_1.Xlsx.AssistModeConf.All.forEach((conf) => this.addDungeonFunction(...conf.effects));
            let assistLevelMap = Player_1.ModelPlayer.Instance.GetAssistModeLevel();
            for (let [key, value] of Object.entries(assistLevelMap)) {
                let assistLevelConf = Xlsx_1.Xlsx.AssistLevelValueConf.Get(parseInt(key), value, 3);
                if (assistLevelConf) {
                    this.addDungeonFunction(...assistLevelConf.effects);
                }
            }
        }
        else {
            this.initHeatInfo();
        }
        this.addDungeonFunction(...this.conf.functions);
        this.addDungeonFunction(...Player_1.ModelPlayer.Instance.GetConsciousCrystalEffects());
        let fesCount = Player_1.ModelPlayer.Instance.GetFesActorUid().length;
        if (fesCount >= Misc_1.Misc.fesActorMisc.fesCountLimit) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.FesActorMaxCount, `fes actor max count ${fesCount}`);
        }
        let r = this.initializeActorInfo(req.actorId, req.factorActorUid, res.attrDelta);
        if (!r.success) {
            return r;
        }
        this.randomInfo.randomedBoss.push(...Player_1.ModelPlayer.Instance.GetRandomedBoss());
        this.randomInfo.killedBosses.push(...Player_1.ModelPlayer.Instance.GetKilledBosses());
        if (!this.conf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `breed dungeon ${req.breedDungeonId} not exist`);
        }
        this.fillPhase();
        Player_1.ModelPlayer.Instance.GetShopActiveBuff().forEach((val) => this.buffInfo.sanBuffsRound.push(new P.BuffRound({ buffId: val, effectRound: 999 })));
        let ret = this.generatePhase(req.forceSelectTheme);
        if (!ret.success) {
            return ret;
        }
        r = this.randomRoomPlot(1);
        if (!r.success) {
            return r;
        }
        this.extraAddResource();
        Xlsx_1.Xlsx.BreedDungeonConditionFunctionConf.All.forEach((r) => {
            if (r.breedDungeonId != req.breedDungeonId) {
                return;
            }
            if (!Common_1.CommonUtils.CheckUnlocked(r.conditions)) {
                return;
            }
            this.addPhaseFunctions(this.currentPhaseInfo, ...r.functions);
        });
        this.refreshModeTrigger();
        let attrs = this.dungeonFunctions(P.EBreedDungeonFunction.Attr);
        let extraAttrs = [];
        attrs.forEach((r) => extraAttrs.push(...r.attr.attrs));
        Actor_1.FesActorUtils.AddAttr(this.FesActor, ...extraAttrs);
        Actor_1.FesActorUtils.AddAttr(this.FesActor, ...Player_1.ModelPlayer.Instance.GetConsciousLevelAttr());
        this.dungeonFunctions(P.EBreedDungeonFunction.PotentialSkip).forEach((r) => {
            this.rewardInfo.potentialSkipCount += r.potentialSkip.count;
        });
        let bpRecord = Player_1.ModelPlayer.Instance.GetPotentialBlessRecord(req.actorId);
        this.baseInfo.selectedBlesses = bpRecord.blesses;
        this.baseInfo.selectedPotential = bpRecord.potentials;
        this.baseInfo.unlockBlessItems = Player_1.ModelPlayer.Instance.GetFunctypeItems(P.EItemFuncType.BlessUnlock);
        this.rewardInfo.taskCheckProgress = Task_2.ModelTask.Instance.GetTaskCurrentProgress(...Misc_1.Misc.taskMisc.progressCheckTaskList).toObjectMap();
        this.rewardInfo.heatRewardMap = Util_1.U.DeepCopy(Player_1.ModelPlayer.Instance.GetActorHeatRewardRecord(this.baseInfo.actorId));
        this.functionInfo.heat = this.baseInfo.heat;
        this.getInheritBless().forEach((bless) => {
            let copyBless = Util_1.U.DeepCopy(bless);
            copyBless.history = [new P.DungeonInfo({ oldQuality: bless.quality, newQuality: bless.quality })];
            copyBless.active = false;
            Actor_1.FesActorUtils.AddBless(this.FesActor, copyBless);
            this.blessRandomGenerator.UpdateBless(copyBless);
        });
        let addInheritBlessRefreshFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.RefreshInheritBless);
        addInheritBlessRefreshFuncs.forEach((func) => this.FesActor.inheritBlessCanRefreshCount += func.inheritBlessAdd.value);
        let potentialRefreshFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.RefreshPotential);
        potentialRefreshFuncs.forEach((func) => this.rewardInfo.potentialCanRefreshCount += func.potentialRefreshAdd.value);
        res.potentialCanRefreshCount = this.rewardInfo.potentialCanRefreshCount;
        this.baseInfo.beginTimestamp = Number(csharp_1.NOAH.GameTime.utc);
        res.buffInfo = Util_1.U.DeepCopy(this.buffInfo);
        res.phaseInfo = Util_1.U.DeepCopy(this.currentPhaseInfo);
        Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        res.currentPhase = this.currentPhaseIndex;
        res.resourceCount = this.resourceInfo.count;
        res.functionInfo = Util_1.U.DeepCopy(this.functionInfo);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonLoad(res) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        this.baseInfo.beginTimestamp = Number(csharp_1.NOAH.GameTime.utc);
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonRefreshNextRoom(res) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        let phaseInfo = this.currentPhaseInfo;
        if (!phaseInfo) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        if (this.finished) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonFinished, "breed dungeon not start");
        }
        if (this.rewardToGet) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonRewardNotSelect, "breed dungeon reward to get");
        }
        let roomList = phaseInfo.roomRandomed[phaseInfo.currentStageIndex + 1];
        let notFightRoomArr = roomList.rooms.filter((r) => !Dungeon_1.DungeonUtils.FightRoomType(r.roomType));
        let fightRoomArr = roomList.rooms.filter((r) => Dungeon_1.DungeonUtils.FightRoomType(r.roomType));
        switch (roomList.rewardType) {
            case P.EBreedDungeonRoomRewardType.Bless:
                let seriesArr = this.blessRandomGenerator.GetBlessSeriesCanRandom();
                let newSeriesArr = [];
                if (seriesArr.length > 0) {
                    let isFirstBless = false;
                    if (phaseInfo.phaseIndex == 1)
                        isFirstBless = !phaseInfo.rooms.some((r) => r.rewardType == P.EBreedDungeonRoomRewardType.Bless);
                    while (newSeriesArr.length < fightRoomArr.length) {
                        if (newSeriesArr.length == seriesArr.length)
                            break;
                        let seriesWithWeightArr = [];
                        seriesArr.forEach((series) => {
                            if (!newSeriesArr.includes(series)) {
                                seriesWithWeightArr.push({ weight: 10000, value: series });
                            }
                        });
                        let blessSeriesFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.BlessSeriesProbAdd);
                        let totalAddWeight = 0;
                        seriesWithWeightArr.forEach((obj) => {
                            let func = blessSeriesFuncs.find((func) => func.blessSeriesProbAdd.series == obj.value);
                            if (func) {
                                totalAddWeight += obj.weight * (func.blessSeriesProbAdd.value / 10000);
                                obj.weight += obj.weight * (func.blessSeriesProbAdd.value / 10000);
                            }
                        });
                        let downWeight = 0;
                        let count = seriesWithWeightArr.filter((obj) => obj.weight == 10000).length;
                        downWeight = totalAddWeight / count;
                        seriesWithWeightArr.forEach((obj) => {
                            if (obj.weight == 10000)
                                obj.weight -= downWeight;
                            if (obj.weight <= 1)
                                obj.weight = 1;
                            if (obj.weight > 10000 && isFirstBless && newSeriesArr.length < fightRoomArr.length)
                                newSeriesArr.push(obj.value);
                        });
                        if (seriesWithWeightArr.some((item) => newSeriesArr.includes(item.value)))
                            continue;
                        seriesWithWeightArr = seriesWithWeightArr.filter((item) => !newSeriesArr.includes(item.value));
                        let result = ServerUtils_1.ServerUtils.RandomWeighted(seriesWithWeightArr);
                        if (result)
                            newSeriesArr.push(result);
                    }
                }
                seriesArr = newSeriesArr;
                for (let i = 0; i < seriesArr.length; i++)
                    fightRoomArr[i].series = seriesArr[i];
                let roomsWithSeries = fightRoomArr.filter((r) => r.series != 0);
                if (roomsWithSeries.length == 0) {
                    roomList.rooms = notFightRoomArr.concat(fightRoomArr.slice(0, 1));
                    roomList.rewardType = P.EBreedDungeonRoomRewardType.BlessQualityUp;
                }
                else {
                    roomList.rooms = notFightRoomArr.concat(roomsWithSeries);
                }
                break;
            case P.EBreedDungeonRoomRewardType.Skill:
                let count = 0;
                let { oldOrderArr, newOrderArr } = this.potentialRandomGenerator.GetOrderCanRandom();
                if (oldOrderArr.length > 0)
                    count++;
                if (newOrderArr.length > 0)
                    count++;
                let roomsWithOrder = fightRoomArr.slice(0, count);
                if (roomsWithOrder.length == 0) {
                    roomList.rooms = notFightRoomArr.concat(fightRoomArr.slice(0, 1));
                    roomList.rewardType = P.EBreedDungeonRoomRewardType.BlessQualityUp;
                }
                else {
                    roomsWithOrder = roomsWithOrder.slice(0, 1);
                    roomList.rooms = notFightRoomArr.concat(roomsWithOrder);
                }
                break;
        }
        let hideFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.HideRoomInfo);
        let hideRound = 0;
        let hideCount = 0;
        if (hideFuncs.length > 0) {
            hideRound = hideFuncs[0].hideRoomInfo.round;
            hideCount = hideFuncs[0].hideRoomInfo.count;
        }
        let currentRound = 0;
        this.baseInfo.phases.forEach((phase) => currentRound += phase.rooms.length);
        roomList.rooms.forEach((r) => r.hide = false);
        if (currentRound % hideRound == 0) {
            Util_1.U.RandomSample(roomList.rooms, hideCount).forEach((val) => val.hide = true);
        }
        roomList.rooms.forEach((room) => {
            if (Dungeon_1.DungeonUtils.FightRoomType(room.roomType))
                room.rewardType = roomList.rewardType;
            let roomConf = Xlsx_1.Xlsx.BreedDungeonRoomConf.Get(room.roomType, phaseInfo.theme, phaseInfo.currentStageIndex + 1);
            if (roomConf.dropId != 0) {
                room.dropId = roomConf.dropId;
            }
            if (roomConf.dropPool != 0) {
                let dropIds = XlsxUtils_1.XlsxUtils.BreedDungeonResDropsByPool.get(roomConf.dropPool) ?? [];
                let weightPool = [];
                dropIds.forEach((dropId) => {
                    let conf = Xlsx_1.Xlsx.BreedDungeonResDrop.Get(dropId);
                    if (conf) {
                        weightPool.push({ weight: conf.weight, value: dropId });
                    }
                });
                room.dropId = ServerUtils_1.ServerUtils.RandomWeighted(weightPool) ?? 0;
            }
        });
        res.rooms = Util_1.U.DeepCopy(roomList);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonEnterRoom(req, res) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        let phaseInfo = this.currentPhaseInfo;
        if (!phaseInfo) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        if (this.finished) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonFinished, "breed dungeon not start");
        }
        if (this.rewardToGet) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonRewardNotSelect, "breed dungeon reward to get");
        }
        Actor_1.FesActorUtils.FillActiveAttrsWithReq(this.FesActor, ...req.activeAttrs);
        let ret = this.selectRoom(req.selectRoomIndex);
        if (!ret.success) {
            return ret;
        }
        let currentRoom = this.currentRoom;
        if (currentRoom.roomType == P.EBreedDungeonRoomType.Shop) {
            let shopExtraFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.ShopRefresh);
            shopExtraFuncs.forEach((func) => currentRoom.canRefreshCount += func.shopRefresh.count);
            console.info("BreedFunction", `shop refresh count:${currentRoom.canRefreshCount}`);
            if (currentRoom.canRefreshCount == 0)
                currentRoom.refreshed = true;
        }
        if (this.genCurrentRoomDevicesRecord(phaseInfo)) {
            let roomDevices = this.getPhaseRoomDevices(phaseInfo);
            res.devices = Util_1.U.DeepCopy(roomDevices);
            res.phaseDevices = Util_1.U.DeepCopy(phaseInfo.phaseDevices);
        }
        else {
            res.devices = Util_1.U.DeepCopy(this.getPhaseRoomDevices(phaseInfo));
            res.phaseDevices = Util_1.U.DeepCopy(phaseInfo.phaseDevices);
        }
        this.checkRoomStageIdx(currentRoom);
        currentRoom.sanFunctions.push(...this.sanBuffFunctions());
        console.info("BreedDungeon", `phase:${phaseInfo.phaseIndex} stage:${phaseInfo.currentStageIndex} roomtype:${P.EBreedDungeonRoomType[currentRoom.roomType]} stageIdx:${currentRoom.stageIdx}`);
        let enterHpRecoveres = this.dungeonFunctions(P.EBreedDungeonFunction.EnterHpRecover, currentRoom);
        enterHpRecoveres.forEach((r) => {
            Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, r.enterRoomHpRecover.value, r.enterRoomHpRecover.isRatio);
        });
        let triggers = this.dungeonFunctions(P.EBreedDungeonFunction.Trigger, currentRoom);
        triggers.forEach((r) => {
            currentRoom.triggers.push(...r.trigger.triggers);
            currentRoom.envTriggers.push(...r.trigger.envTrigger);
        });
        let roomRule = Misc_1.Misc.breedDungeonMisc.roomRule[currentRoom.roomType];
        let countDown = roomRule.countDown[this.mode] ?? 0;
        let countDownAddRate = Util_1.U.Sum(this.dungeonFunctions(P.EBreedDungeonFunction.TimeLimitAdd, currentRoom).map((r) => r.timeLimitAdd.addRate));
        currentRoom.countDown = Math.round(countDown * (1 + (countDownAddRate / 10000)));
        if (currentRoom.roomType == P.EBreedDungeonRoomType.Boss) {
            let stageRes = Xlsx_1.Xlsx.SceneStageBase.Get(currentRoom.stageIdx);
            if (!stageRes) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, "boss stage res not found");
            }
            if (!this.randomInfo.randomedBoss.includes(stageRes.BossId)) {
                this.randomInfo.randomedBoss.push(stageRes.BossId);
            }
        }
        this.checkRoomEvents(currentRoom);
        res.buffInfo = Util_1.U.DeepCopy(this.buffInfo);
        res.currentStageIndex = phaseInfo.currentStageIndex;
        res.roomInfo = Util_1.U.DeepCopy(currentRoom);
        res.selectedIndex = phaseInfo.selectedIndex;
        Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        res.deviceShowupCount = Util_1.U.DeepCopy(this.randomInfo.deviceShowupCount);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonEnterPhase(req, res) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        if (this.finished) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonFinished, "breed dungeon not start");
        }
        if (!this.phaseFinished) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonPhaseNotFinished, "breed dungeon phase not finished");
        }
        if (this.rewardToGet) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonRewardNotSelect, "breed dungeon reward to get");
        }
        this.baseInfo.currentPhase++;
        let ret = this.generatePhase();
        if (!ret.success) {
            return ret;
        }
        res.currentPhase = this.currentPhaseIndex;
        res.phaseInfo = Util_1.U.DeepCopy(this.currentPhaseInfo);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    roomAddSan(room) {
        let sanDiscounts = this.dungeonFunctions(P.EBreedDungeonFunction.SanDiscount, room);
        let discount = 10000 + Util_1.U.Sum(sanDiscounts.map((discount) => { return discount.sanDiscount.discount; }));
        Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.San, room.sanAddition * (discount / 10000));
    }
    BreedDungeonSelectEvent(req, res) {
        let currentRoom = this.currentRoom;
        if (!currentRoom) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon room not inited");
        }
        if (currentRoom.selectEvent != 0) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, "event selected");
        }
        if (!currentRoom.events.includes(req.eventId) || (currentRoom.invalidEvents.includes(req.eventId))) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, "event not inclued");
        }
        let eventConf = Xlsx_1.Xlsx.DungeonRoomEventConf.Get(req.eventId);
        if (!eventConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResTableError, "res not found");
        }
        currentRoom.selectEvent = req.eventId;
        let phaseInfo = this.currentPhaseInfo;
        let roomDevices = this.getPhaseRoomDevices(phaseInfo);
        let findIndex = currentRoom.chaosEventInfo.findIndex((r) => r.eventId == req.eventId);
        if (findIndex >= 0) {
            let chaosEventInfo = Util_1.U.DeepCopy(currentRoom.chaosEventInfo[findIndex]);
            chaosEventInfo.phaseIndex = this.currentPhaseIndex;
            chaosEventInfo.roomIndex = this.currentPhaseInfo.rooms.length;
            chaosEventInfo.remainRound = chaosEventInfo.effectRound;
            this.randomInfo.chaosEventInfo.push(chaosEventInfo);
            this.buffInfo.eventDebuffsRound.push(new P.BuffRound({
                buffId: chaosEventInfo.buffId,
                effectRound: chaosEventInfo.effectRound,
                source: P.EDungeonBuffSource.EventChaosChallenge
            }));
            let resType = this.eventRewardTypeToResType(chaosEventInfo.rewardType);
            if (resType != P.EBreedDungeonResType.None && chaosEventInfo.value > 0) {
                for (let deviceId of Misc_1.Misc.breedDungeonMisc.eventDevices) {
                    let deviceInfo = this.getDeviceInfo(deviceId);
                    let deviceConf = this.deviceConf(deviceId);
                    if (deviceConf.type == P.EBreedDungeonDeviceType.EventSpPreferedBless) {
                        if (deviceConf.costType == resType) {
                            roomDevices.info[deviceId] = deviceInfo;
                            break;
                        }
                    }
                }
            }
        }
        else {
            eventConf.rewards.forEach((r) => {
                let resType = this.eventRewardTypeToResType(r.type);
                if (resType != P.EBreedDungeonResType.None && r.num > 0) {
                    for (let deviceId of Misc_1.Misc.breedDungeonMisc.eventDevices) {
                        let deviceInfo = this.getDeviceInfo(deviceId);
                        let deviceConf = this.deviceConf(deviceId);
                        if (deviceConf.type == P.EBreedDungeonDeviceType.EventSpPreferedBless) {
                            if (deviceConf.costType == resType) {
                                roomDevices.info[deviceId] = deviceInfo;
                                break;
                            }
                        }
                    }
                }
            });
        }
        res.devices = Util_1.U.DeepCopy(roomDevices);
        res.roomInfo = Util_1.U.DeepCopy(currentRoom);
        res.chaosEventInfo = Util_1.U.DeepCopy(this.randomInfo.chaosEventInfo);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    refreshBlessReward(specifySeries = 0) {
        let probMap = new Util_1.U.DefaultNumberMap();
        for (let [key, val] of Object.entries(Misc_1.Misc.heatMisc.blessQualityProbAddMap)) {
            probMap.set(parseInt(key), val * this.baseInfo.heat);
        }
        this.blessRandomGenerator.EnhanceCurrentQualityWeight(probMap);
        let result = new Array();
        if (specifySeries == 0) {
            result = this.blessRandomGenerator.RandomBlessFromAvailableFaction(Misc_1.Misc.blessRandomMisc.preferredBlessRandomCount);
        }
        else {
            result = this.blessRandomGenerator.RandomSpecifySeriesFactionNextGradationBless(specifySeries, Misc_1.Misc.blessRandomMisc.preferredBlessRandomCount);
        }
        if (result.length == 0)
            return false;
        let fillBlesses = new Array();
        if (result.length < 3) {
            let maxGradation = Math.max(...result.map((r) => Xlsx_1.Xlsx.BlessConf.Get(r.id)?.gradation ?? 1));
            let factionArr = new Array();
            if (specifySeries != 0) {
                for (let [faction, series] of XlsxUtils_1.XlsxUtils.FactionSeries.entries()) {
                    if (series == specifySeries)
                        factionArr.push(faction);
                }
            }
            else {
                factionArr = this.blessRandomGenerator.GetBlessFactionCanRandom();
            }
            let blessConfArr = new Array();
            factionArr.forEach((faction) => blessConfArr.push(...(XlsxUtils_1.XlsxUtils.FactionBlesses.get(faction) ?? [])));
            blessConfArr = blessConfArr.filter((conf) => !conf.invalid);
            blessConfArr = blessConfArr.filter((conf) => this.FesActor.blesses.findIndex((b) => b.id == conf.id) < 0 && result.findIndex((b) => b.id == conf.id) < 0);
            blessConfArr = blessConfArr.filter((conf) => conf.gradation <= maxGradation);
            fillBlesses = Util_1.U.RandomSample(blessConfArr, 3 - result.length).map((b) => new P.STBless({ id: b.id, quality: 1 }));
        }
        let ret = result.map((b) => new P.STBreedDungeonStageReward({
            skill: Bless_1.BlessUtils.BlessToSkill(b),
            replaceSkill: Bless_1.BlessUtils.BlessToSkill(this.blessRandomGenerator.GetReplaceBless(b))
        }));
        ret.forEach((item) => {
            if (item.replaceSkill) {
                if (item.replaceSkill.quality >= item.skill.quality) {
                    item.skill.quality = item.replaceSkill.quality;
                    if (item.skill.quality < 4)
                        item.skill.quality++;
                    item.skill.oldQuality = item.skill.quality;
                }
            }
        });
        let fillRet = fillBlesses.map((b) => new P.STBreedDungeonStageReward({
            skill: Bless_1.BlessUtils.BlessToSkill(b),
            lockType: this.blessRandomGenerator.GetLockReason(b.id),
        }));
        ret.push(...fillRet);
        let pointCount = this.getResource(P.EBreedDungeonResType.QualityPoint);
        ret.forEach((result) => {
            if (this.blessRandomGenerator.IsBlessCanUp(Bless_1.BlessUtils.SkillToBless(result.skill))) {
                result.skill.quality = result.skill.quality + pointCount > 4 ? 4 : result.skill.quality + pointCount;
            }
        });
        let blessLockCount = 0;
        let blessLockFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.BlessChoiceLock);
        if (blessLockFuncs.length > 0)
            blessLockCount = blessLockFuncs[0].choiceLock.count;
        if (result.length <= blessLockCount)
            blessLockCount = result.length - 1;
        for (let i = 0; i < blessLockCount; i++) {
            let index = ret.findIndex((r) => r.replaceSkill && r.lockType == P.ERewardLockType.None);
            if (index >= 0) {
                ret[index].lockType = P.ERewardLockType.Heat;
            }
            else {
                index = ret.findIndex((r) => r.lockType == P.ERewardLockType.None);
                if (index >= 0)
                    ret[index].lockType = P.ERewardLockType.Heat;
            }
        }
        ret = ret.sort((a, b) => (a.replaceSkill ? 1 : 0) - (b.replaceSkill ? 1 : 0));
        ret = ret.sort((a, b) => a.lockType - b.lockType);
        let count = 0;
        ret.forEach((val) => { if (val.lockType == P.ERewardLockType.None)
            count++; });
        if (count == 1 && ret.length > 1) {
            let temp = ret[1];
            ret[1] = ret[0];
            ret[0] = temp;
        }
        let notSelectPointCount = Misc_1.Misc.breedDungeonMisc.blessNotSelectReward.find((r) => r.type == P.EBreedDungeonResType.Coin)?.count ?? 0;
        let skipAddResFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.AddBlessSkipRes);
        skipAddResFuncs.forEach((func) => notSelectPointCount += func.skipBlessAdd.value);
        this.rewardInfo.stageSelectRewards = new P.STBreedDungeonStageSelectRewards({
            rewards: ret,
            rewardType: P.EBreedDungeonStageSelectRewardType.PreferedBless,
            notSelectPointCount: notSelectPointCount
        });
        return true;
    }
    refreshPotentialReward(refresh = false) {
        let potentialResult = new Array();
        if (refresh) {
            let arr = this.rewardInfo.stageSelectRewards.rewards.filter((val) => val.lockType == P.ERewardLockType.None).map((r) => r.skill.id);
            for (let val of arr) {
                if (this.rewardInfo.potentialRefreshRecord.includes(val))
                    continue;
                this.rewardInfo.potentialRefreshRecord.push(val);
            }
            potentialResult.push(...this.potentialRandomGenerator.RandomAllOrderPotential(Misc_1.Misc.potentialRandomMisc.potentialRandomCount, this.rewardInfo.potentialRefreshRecord ?? []));
        }
        else {
            potentialResult.push(...this.potentialRandomGenerator.RandomAllOrderPotential(Misc_1.Misc.potentialRandomMisc.potentialRandomCount));
        }
        if (potentialResult.length == 0) {
            console.warn("Potential", `random potential fail`);
            return false;
        }
        let potentialRet = potentialResult.map((p) => new P.STBreedDungeonStageReward({ skill: Potential_1.PotentialUtils.PotentialToSkill(p) }));
        let potentialLockCount = 0;
        let potentialLockFuncs = this.dungeonFunctions(P.EBreedDungeonFunction.PotentialChoiceLock);
        if (potentialLockFuncs.length > 0)
            potentialLockCount = potentialLockFuncs[0].choiceLock.count;
        if (potentialResult.length <= potentialLockCount)
            potentialLockCount = potentialResult.length - 1;
        potentialRet = potentialRet.sort((a, b) => {
            let val1 = this.rewardInfo.potentialRefreshRecord.includes(a.skill.id) ? 1 : 0;
            let val2 = this.rewardInfo.potentialRefreshRecord.includes(b.skill.id) ? 1 : 0;
            return val2 - val1;
        });
        for (let i = 0; i < potentialLockCount; i++) {
            potentialRet[i].lockType = P.ERewardLockType.Heat;
        }
        potentialRet = potentialRet.sort((a, b) => a.lockType - b.lockType);
        let notSelectPointCount = Misc_1.Misc.breedDungeonMisc.potentialNotSelectReward.find((r) => r.type == P.EBreedDungeonResType.Coin)?.count ?? 0;
        this.rewardInfo.stageSelectRewards = new P.STBreedDungeonStageSelectRewards({
            rewards: potentialRet,
            rewardType: P.EBreedDungeonStageSelectRewardType.Potential,
            notSelectPointCount: notSelectPointCount
        });
        if (refresh)
            this.rewardInfo.potentialCanRefreshCount--;
        return true;
    }
    refreshBlessUpReward(pointCount) {
        let funcs = this.dungeonFunctions(P.EBreedDungeonFunction.ExtraBlessUpdate);
        let removeArr = new Array();
        funcs.forEach((func) => {
            pointCount += func.blessupdateExtra.count;
            if (func.blessupdateExtra.onlyFirstTime)
                removeArr.push(func.id);
        });
        if (pointCount != 1) {
            console.info("BreedFunction", `bless update count extra:${pointCount - 1}`);
        }
        this.functionInfo.list = this.functionInfo.list.filter((id) => !removeArr.includes(id));
        this.addResource(P.EBreedDungeonResType.QualityPoint, pointCount);
        let upResult = this.blessRandomGenerator.RandomBlessCanUpdate(Misc_1.Misc.blessRandomMisc.blessUpgradeRandomCount);
        if (upResult.length == 0) {
            return false;
        }
        let ret = upResult.map((b) => new P.STBreedDungeonStageReward({ skill: Bless_1.BlessUtils.BlessToSkill(b) }));
        let addPointCount = this.getResource(P.EBreedDungeonResType.QualityPoint);
        ret.forEach((result) => {
            result.skill.quality = result.skill.quality + addPointCount > 4 ? 4 : result.skill.quality + addPointCount;
        });
        if (upResult.length < 3) {
            let blesses = this.FesActor.blesses.filter((b) => upResult.findIndex((r) => r.id == b.id) < 0 && b.active);
            blesses = blesses.filter((b) => {
                if (!b.active)
                    return false;
                let conf = Xlsx_1.Xlsx.BlessConf.Get(b.id);
                if (conf) {
                    if (conf.gradation != 4)
                        return true;
                }
                return false;
            });
            Util_1.U.RandomSample(blesses, 3 - upResult.length).forEach((val) => {
                ret.push(new P.STBreedDungeonStageReward({
                    skill: Bless_1.BlessUtils.BlessToSkill(val),
                    lockType: P.ERewardLockType.MaxQuality
                }));
            });
        }
        let count = 0;
        ret.forEach((val) => { if (val.lockType == P.ERewardLockType.None)
            count++; });
        if (count == 1 && ret.length > 1) {
            let temp = ret[1];
            ret[1] = ret[0];
            ret[0] = temp;
        }
        let notSelectPointCount = Misc_1.Misc.breedDungeonMisc.qualityNotSelectReward.find((r) => r.type == P.EBreedDungeonResType.Coin)?.count ?? 0;
        this.rewardInfo.stageSelectRewards = new P.STBreedDungeonStageSelectRewards({
            rewards: ret,
            rewardType: P.EBreedDungeonStageSelectRewardType.UpgradeBless,
            notSelectPointCount: notSelectPointCount * pointCount
        });
        return true;
    }
    checkRoomReward(currentRoom) {
        switch (currentRoom.rewardType) {
            case P.EBreedDungeonRoomRewardType.Bless:
                if (currentRoom.series == 0) {
                    currentRoom.rewarded = true;
                    break;
                }
                if (currentRoom.roomType == P.EBreedDungeonRoomType.Elite) {
                    this.blessRandomGenerator.SetNextQualityWeight(new Util_1.U.DefaultNumberMap(Misc_1.Misc.blessRandomMisc.eliteBlessQualityWeight));
                }
                if (!this.refreshBlessReward(currentRoom.series))
                    currentRoom.rewarded = true;
                break;
            case P.EBreedDungeonRoomRewardType.Skill:
                if (!this.refreshPotentialReward())
                    currentRoom.rewarded = true;
                break;
            case P.EBreedDungeonRoomRewardType.BlessQualityUp:
                let addCount = 1;
                if (!this.refreshBlessUpReward(addCount))
                    currentRoom.rewarded = true;
                break;
            case P.EBreedDungeonRoomRewardType.Hp:
                Actor_1.FesActorUtils.AddAttr(this.FesActor, Misc_1.Misc.randomRoomMisc.hpReward);
                currentRoom.rewarded = true;
                break;
            case P.EBreedDungeonRoomRewardType.Mp:
                Actor_1.FesActorUtils.AddAttr(this.FesActor, Misc_1.Misc.randomRoomMisc.mpReward);
                currentRoom.rewarded = true;
                break;
            default:
                currentRoom.rewarded = true;
                break;
        }
    }
    BreedDungeonRoomFinish(req, res) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        if (this.finished) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonFinished, "breed dungeon not start");
        }
        if (this.phaseFinished) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonPhaseFinished, "breed dungeon phase finished");
        }
        if (this.rewardToGet) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonRewardNotSelect, "breed dungeon reward to get");
        }
        let currentRoom = this.currentRoom;
        if (!currentRoom) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon room not inited");
        }
        let phaseInfo = this.currentPhaseInfo;
        let r = this.finishRoom(req.useTime, req.activeInfo, req.dropInfo);
        if (!r.success) {
            return r;
        }
        currentRoom.finished = true;
        if (req.activeInfo) {
            this.data.activeInfo = Util_1.U.DeepCopy(req.activeInfo);
        }
        if (currentRoom.roomType == P.EBreedDungeonRoomType.Event) {
            this.CheckEventReward(currentRoom.selectEvent);
            if (this.rewardInfo.stageSelectRewards.rewardType == P.EBreedDungeonStageSelectRewardType.None) {
                currentRoom.rewarded = true;
            }
            else {
                res.stageSelectRewards = Util_1.U.DeepCopy(this.rewardInfo.stageSelectRewards);
            }
        }
        else {
            let { reward, ret } = this.checkPotentialReward();
            if (!ret.success) {
                return ret;
            }
            if (reward) {
                res.stageSelectRewards = Util_1.U.DeepCopy(this.rewardInfo.stageSelectRewards);
            }
            else {
                this.checkRoomReward(currentRoom);
                res.stageSelectRewards = Util_1.U.DeepCopy(this.rewardInfo.stageSelectRewards);
            }
        }
        let phaseFinished = this.phaseFinished;
        if (phaseFinished) {
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.FinishPhaseWithGtP0SanBuffMtimes, 1, this.buffInfo.sanDebuffsRound.length);
        }
        Dungeon_1.DungeonUtils.UpdateSanBuffRound(this.buffInfo.sanDebuffsRound);
        Dungeon_1.DungeonUtils.UpdateSanBuffRound(this.buffInfo.sanBuffsRound);
        let deltaAttrs = this.checkAttrReward();
        if (deltaAttrs) {
            Actor_1.FesActorUtils.AddAttr(this.FesActor, ...deltaAttrs);
            res.attrDelta = deltaAttrs;
        }
        this.actorInfo.blessUseCount = req.blessUseCount;
        this.randomInfo.chaosEventInfo.forEach((info) => {
            if (currentRoom.chaosEventInfo.find((roomInfo) => roomInfo.eventId == info.eventId))
                return;
            info.rewarded = true;
        });
        if (Dungeon_1.DungeonUtils.FightRoomType(currentRoom.roomType)) {
            let eventDebuffFinish = new Array();
            for (let buff of this.buffInfo.eventDebuffsRound) {
                buff.effectRound--;
                if (buff.effectRound == 0) {
                    eventDebuffFinish.push(buff);
                }
            }
            this.randomInfo.chaosEventInfo.forEach((info) => info.remainRound--);
            this.buffInfo.eventDebuffsRound = this.buffInfo.eventDebuffsRound.filter((b) => b.effectRound > 0);
        }
        let current = Number(csharp_1.NOAH.GameTime.utc);
        let delta = current - this.baseInfo.beginTimestamp;
        if (delta < 0)
            delta = 0;
        this.baseInfo.useTime += delta;
        this.baseInfo.beginTimestamp = current;
        res.chaosEventInfo = Util_1.U.DeepCopy(this.randomInfo.chaosEventInfo);
        res.blessUseCount = req.blessUseCount;
        res.resourceCount = this.resourceInfo.count;
        res.roomInfo = Util_1.U.DeepCopy(currentRoom);
        res.buffInfo = Util_1.U.DeepCopy(this.buffInfo);
        Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        res.resChange = Util_1.U.DeepCopy(Player_1.ModelPlayer.Instance.GetChangePack());
        res.playerResource = Util_1.U.DeepCopy(this.rewardInfo.rewards);
        res.perfectFinishRoomCount = this.rewardInfo.perfectFinishRoomCount;
        if (phaseFinished) {
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.FinishPnThemeMtimes, 1, phaseInfo.theme);
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.FinishPhaseLeP1DamageMtimes, 1, phaseInfo.totalDamageTaken);
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.FinishBreedP0PhaseGeP1Heat, 1, phaseInfo.phaseIndex, this.baseInfo.heat);
            Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.FinishBreedP0PhaseMtimes, 1, phaseInfo.phaseIndex);
            Player_1.ModelPlayer.Instance.UpdateDungeonBossRecord(currentRoom.stageIdx, req.activeInfo.damageTaken == 0, currentRoom.useTime);
        }
        if (this.phaseRewarded) {
            phaseInfo.finished = true;
            res.phaseFinished = true;
        }
        else if (!phaseFinished) {
            res.phaseInfo = P.STBreedDungeonPhase.create({ roomRandomed: {}, roomDevices: {} });
            res.phaseInfo.roomDevices = Util_1.U.DeepCopy(phaseInfo.roomDevices);
            res.phaseInfo.roomRandomed[phaseInfo.currentStageIndex + 1] =
                Util_1.U.DeepCopy(phaseInfo.roomRandomed[phaseInfo.currentStageIndex + 1]);
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonRefreshReward(res) {
        switch (this.rewardInfo.stageSelectRewards.rewardType) {
            case P.EBreedDungeonStageSelectRewardType.Potential:
                if (this.rewardInfo.potentialCanRefreshCount == 0) {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.PotentialRefreshCountLimit, "potential refresh limit");
                }
                this.refreshPotentialReward(true);
                res.stageSelectRewards = Util_1.U.DeepCopy(this.rewardInfo.stageSelectRewards);
                res.canRefreshCount = this.rewardInfo.potentialCanRefreshCount;
                break;
            default:
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.NotSupport, "not support");
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonGetReward(req, res) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        let rewardInfo = this.rewardInfo;
        if (req.selectIndex >= rewardInfo.stageSelectRewards.rewards.length) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonRewardIndexInvalid, "breed dungeon reward index invalid");
        }
        if (rewardInfo.stageSelectRewards.rewardType != P.EBreedDungeonStageSelectRewardType.UpgradeBless) {
            if (!req.skip && rewardInfo.stageSelectRewards.rewards[req.selectIndex].lockType != P.ERewardLockType.None) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonRewardIndexInvalid, "reward been lock");
            }
        }
        else {
            if (rewardInfo.stageSelectRewards.rewards.every((r) => r.lockType != P.ERewardLockType.None)) {
                this.rewardInfo.stageSelectRewards = P.STBreedDungeonStageSelectRewards.create();
                res.phaseFinished = this.phaseRewarded;
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                res.resourceCount = Util_1.U.DeepCopy(this.resourceInfo.count);
                return ServerUtils_1.ServerUtils.MakeRet(true);
            }
        }
        let currentRoom = this.currentRoom;
        if (currentRoom) {
            if (currentRoom.finished) {
                currentRoom.rewarded = true;
            }
        }
        if (this.finished) {
            this.data.finished = true;
        }
        if (req.skip) {
            this.addResource(P.EBreedDungeonResType.Coin, this.rewardInfo.stageSelectRewards.notSelectPointCount, false);
            this.rewardInfo.stageSelectRewards = P.STBreedDungeonStageSelectRewards.create();
            res.phaseFinished = this.phaseRewarded;
            Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
            res.fesActor = Util_1.U.DeepCopy(this.FesActor);
            res.resourceCount = Util_1.U.DeepCopy(this.resourceInfo.count);
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        switch (rewardInfo.stageSelectRewards.rewardType) {
            case P.EBreedDungeonStageSelectRewardType.PreferedBless:
                this.selectBless(req.selectIndex, P.EBreedDungeonBlessSource.Preferred);
                break;
            case P.EBreedDungeonStageSelectRewardType.IterateBless:
                this.selectBless(req.selectIndex, P.EBreedDungeonBlessSource.Iterated);
                break;
            case P.EBreedDungeonStageSelectRewardType.Potential:
                this.selectPotential(req.selectIndex);
                break;
            case P.EBreedDungeonStageSelectRewardType.Talent:
                this.selectTalent(req.selectIndex);
                break;
            case P.EBreedDungeonStageSelectRewardType.UpgradeBless:
                this.selectBless(req.selectIndex, P.EBreedDungeonBlessSource.None);
                break;
            default:
                break;
        }
        Player_1.ModelPlayer.Instance.UpdatePotentialBlessRecord(this.FesActor.blesses, this.baseInfo.selectedPotential, this.FesActor.id);
        Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        res.iteratedBlesses = [];
        res.iteratedBlesses.push(...rewardInfo.rewardedIteratedBlesses);
        res.phaseFinished = this.phaseRewarded;
        res.blessUpgradeCount = Util_1.U.DeepCopy(this.rewardInfo.blessUpgradeCount);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    GetInheritBless(req, res) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        if (this.FesActor.inheritBlessRandomList.length > 0 && (!req.refresh || this.FesActor.inheritBlessCanRefreshCount == 0)) {
            res.score = this.FesActor.score;
            res.blesses = Util_1.U.DeepCopy(this.FesActor.inheritBlessRandomList);
            res.canRefreshCount = this.FesActor.inheritBlessCanRefreshCount;
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        let score = Actor_1.FesActorUtils.CalcFesActorScore(this.FesActor);
        let blessCount = Math.min(XlsxUtils_1.XlsxUtils.GetInheritBlessCountByBreedScore(score), this.FesActor.blesses.length);
        let blesses = Actor_1.FesActorUtils.GenerateFesActorLegacyBless(this.FesActor, 3);
        if (blessCount <= 0) {
            res.score = score;
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        if (this.FesActor.inheritBlessRandomList.length > 0 && req.refresh)
            this.FesActor.inheritBlessCanRefreshCount--;
        this.FesActor.inheritBlessRandomList = Util_1.U.DeepCopy(blesses);
        res.score = score;
        res.blesses = Util_1.U.DeepCopy(blesses);
        res.canRefreshCount = this.FesActor.inheritBlessCanRefreshCount;
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    SelectInheritBless(req, res) {
        if (req.selectIndex >= this.FesActor.inheritBlessRandomList.length) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedNoEnoughInheritBless, `index ${req.selectIndex} >= randomlist length ${this.FesActor.inheritBlessRandomList.length}`);
        }
        this.FesActor.inheritBlesses.push(this.FesActor.inheritBlessRandomList[req.selectIndex]);
        let blessCount = Math.min(XlsxUtils_1.XlsxUtils.GetInheritBlessCountByBreedScore(this.FesActor.score), this.FesActor.blesses.length);
        let blesses = Actor_1.FesActorUtils.GenerateFesActorLegacyBless(this.FesActor, 3);
        if (this.FesActor.inheritBlesses.length < blessCount) {
            this.FesActor.inheritBlessRandomList = Util_1.U.DeepCopy(blesses);
        }
        else {
            this.FesActor.inheritBlessRandomList = [];
        }
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        res.blesses = Util_1.U.DeepCopy(this.FesActor.inheritBlessRandomList);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonBalance(req, res) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        Player_1.ModelPlayer.Instance.UpdatePotentialBlessRecord(this.FesActor.blesses, this.baseInfo.selectedPotential, this.baseInfo.actorId);
        if (req.manualQuit) {
            Player_1.ModelPlayer.Instance.ClearShopBuffStatus();
            this.clear();
            Quest_1.QuestUtil.CheckResetProgress();
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        let finish = this.finished;
        if (!this.conf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        if (finish) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotFinish, "need explore dungeon init");
        }
        Actor_1.FesActorUtils.FillActiveAttrsWithReq(this.FesActor, ...(req.activeInfo?.activeAttrs ?? []));
        let rewards = this.rewardInfo.rewards;
        rewards.push(...this.conf.reward);
        let tryTimes = Player_1.ModelPlayer.Instance.GetBreedDungeonTryTimes(this.baseInfo.id);
        if (tryTimes == 0) {
            rewards.push(...this.conf.firstReward);
        }
        rewards = Util_1.U.MergeResources(...rewards);
        this.randomInfo.usedAttrToResDevices.forEach((id) => {
            let deviceConf = Xlsx_1.Xlsx.BreedDungeonDeviceConf.Get(id, 3);
            if (deviceConf) {
                if (deviceConf.attrs[0].value < 0) {
                    let baseAttrConf = Xlsx_1.Xlsx.BaseActorAttrConf.Get(this.FesActor.id);
                    let attr = baseAttrConf.attr.find((attr) => attr.type == P.EAttrType.MaxHp);
                    let currentMaxHp = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.MaxHp);
                    let newMaxHp = currentMaxHp + attr.value * (-deviceConf.attrs[0].value);
                    Actor_1.FesActorUtils.SetFesActorAttrByType(this.FesActor, P.EAttrType.MaxHp, newMaxHp);
                }
            }
        });
        Actor_1.FesActorUtils.FesActorAttrBalance(this.FesActor);
        Player_1.ModelPlayer.Instance.AddResource(P.EResourceChangeReason.BreedDungeonBalance, this.baseInfo.id, ...rewards);
        Player_1.ModelPlayer.Instance.UnLockFesActor(...this.baseInfo.factorActorUid);
        this.FesActor.activeAttrs = [];
        Player_1.ModelPlayer.Instance.AddFesActor(this.FesActor);
        Player_1.ModelPlayer.Instance.MakeChange(P.STResource.create({ type: P.EResourceType.FesActor, id: this.FesActor.uid }), 0, P.STResourcePayload.create({ fesActor: this.FesActor }));
        Player_1.ModelPlayer.Instance.AddBreedDungeonReward(this.baseInfo.id, false, this.mode, this.randomInfo.randomedBoss);
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.FinishBreedLeftGeP0CoinsMtimes, 1, this.getResource(P.EBreedDungeonResType.Coin));
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        res.resChange = Util_1.U.DeepCopy(Player_1.ModelPlayer.Instance.GetChangePack());
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.FinishBreedDungeonWithGeP0TimesGambleMtimes, 1, this.deviceInfo.gambleTimes);
        PlotDialogue_1.ModelPlotDialogue.Instance.ResetCounterpartChatCount();
        Task_2.ModelTask.Instance.CheckTaskStagnation(this.rewardInfo.taskCheckProgress);
        Player_1.ModelPlayer.Instance.SetActorHeatRewardRecord(this.baseInfo.actorId, this.rewardInfo.heatRewardMap);
        res.heatRewardRecord = this.rewardInfo.heatRewardMap;
        res.heatLevel = Player_1.ModelPlayer.Instance.UpdateHeatLevel(this.currentPhaseIndex - 1, this.baseInfo.heat);
        if (!Player_1.ModelPlayer.Instance.GetDynamicScaleStatus()) {
            if (this.currentPhaseIndex == 1) {
                res.assistLevelMap = Player_1.ModelPlayer.Instance.ScaleAssistMode();
            }
            else {
                Player_1.ModelPlayer.Instance.TurnOffDynamicScale();
            }
        }
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.BreedWithP0HeatPunishType, 1, Player_1.ModelPlayer.Instance.GetHeatPunishTypeCount());
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.BreedMtimes, 1);
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.BreedWithP0FesActorMtimes, 1, this.factorActorUid.length);
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.BreedWithP0ConsciousCrystalMtimes, 1, Player_1.ModelPlayer.Instance.GetConsciousCrystalCount());
        Quest_1.QuestUtil.CheckResetProgress();
        let current = Number(csharp_1.NOAH.GameTime.utc);
        let delta = current - this.baseInfo.beginTimestamp;
        if (delta < 0)
            delta = 0;
        this.baseInfo.useTime += delta;
        Player_1.ModelPlayer.Instance.UpdateDungeonActorRecord(this.baseInfo.actorId, false, this.baseInfo.useTime, this.activeInfo.maxCombo, this.activeInfo.continuousPerfectKillMax, this.FesActor.score);
        Player_1.ModelPlayer.Instance.ClearShopBuffStatus();
        this.clear();
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonExploreBalance(finish) {
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        if (!this.conf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        Player_1.ModelPlayer.Instance.UnLockFesActor(...this.baseInfo.factorActorUid);
        Player_1.ModelPlayer.Instance.AddBreedDungeonReward(this.baseInfo.id, finish, this.mode, this.randomInfo.randomedBoss);
        PlotDialogue_1.ModelPlotDialogue.Instance.ResetCounterpartChatCount();
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.BreedMtimes, 1);
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.BreedWithP0FesActorMtimes, 1, this.factorActorUid.length);
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.BreedWithP0ConsciousCrystalMtimes, 1, Player_1.ModelPlayer.Instance.GetConsciousCrystalCount());
        Quest_1.QuestUtil.CheckResetProgress();
        this.clear();
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    InheritBreedDungeon() {
        if (!this.finished) {
            return null;
        }
        let fesActor = Util_1.U.DeepCopy(this.FesActor);
        let chaosEventInfo = this.randomInfo.chaosEventInfo.filter((info) => info.rewarded);
        let eventBuff = Util_1.U.DeepCopy(this.buffInfo.eventBuffsRound);
        let sanbuff = Util_1.U.DeepCopy(this.buffInfo.sanBuffsRound);
        let sandebuff = Util_1.U.DeepCopy(this.buffInfo.sanDebuffsRound);
        let rewards = this.rewardInfo.rewards;
        rewards.push(...this.conf.reward);
        let tryTimes = Player_1.ModelPlayer.Instance.GetBreedDungeonTryTimes(this.baseInfo.id);
        if (tryTimes == 0) {
            rewards.push(...this.conf.firstReward);
        }
        rewards = Util_1.U.MergeResources(...rewards);
        let resources = Util_1.U.DeepCopy(rewards);
        let inheritBlesses = this.getInheritBless();
        let device = this.getDeviceInfo(Misc_1.Misc.exploreMisc.BlessDeviceHistoryId);
        let deviceConf = this.deviceConf(device.id);
        let timeUsed = 0;
        this.baseInfo.phases.forEach((p) => {
            p.rooms.forEach(r => {
                timeUsed += r.useTime;
            });
        });
        return {
            chaosEventInfo: chaosEventInfo,
            eventBuff: eventBuff,
            sanbuff: sanbuff,
            sanDebuff: sandebuff,
            fesActor: fesActor,
            resources: resources,
            res: this.resourceInfo.count,
            inheritBlesses: inheritBlesses,
            blessRefreshTime: device?.refreshedCount ?? 0,
            blessRefreshLeftTime: device?.canRefreshCount ?? 0,
            potentialSkipCount: this.data.rewardInfo.potentialSkipCount,
            mode: this.baseInfo.mode,
            blessSelectCount: deviceConf.selectCount - (device?.canUseCount ?? 0),
            blessSelectCost: Util_1.U.DeepCopy(deviceConf?.selectCost),
            blessRefreshCost: Util_1.U.DeepCopy(deviceConf?.refreshCost),
            functions: this.functionInfo.list,
            selectedPotentials: this.data.baseInfo.selectedPotential,
            selectedBlesses: this.data.baseInfo.selectedBlesses,
            totalTime: timeUsed,
            factorActorUid: this.baseInfo.factorActorUid,
            shopCostTotal: this.deviceInfo.shopCostTotal,
            gambleTimes: this.deviceInfo.gambleTimes,
            blessUseCount: this.actorInfo.blessUseCount,
            taskProgress: this.rewardInfo.taskCheckProgress,
            blessUnlockItems: this.baseInfo.unlockBlessItems,
            bossKilled: this.rewardInfo.dungeonBossKilled,
            usedAttrToResDevices: this.randomInfo.usedAttrToResDevices,
            perfectFinishRoomCount: this.rewardInfo.perfectFinishRoomCount,
            continuousPerfectKillMax: this.activeInfo.continuousPerfectKillMax,
            continuousPerfectKillCur: this.activeInfo.continuousPerfectKillCur,
            bossPerfectKill: this.activeInfo.bossPerfectKill,
            heatRewardMap: this.rewardInfo.heatRewardMap,
            heat: this.baseInfo.heat,
            breedRealUseTime: this.baseInfo.useTime,
            potentialCanRefreshCount: this.rewardInfo.potentialCanRefreshCount
        };
    }
    BreedDungeonAddResDebug() {
        this.resourceInfo.count[P.EBreedDungeonResType.Hashrate] = 1600;
        this.resourceInfo.count[P.EBreedDungeonResType.Coin] = 1000;
        this.resourceInfo.count[P.EBreedDungeonResType.PotentialPoint] = 6;
        return this.resourceInfo.count;
    }
    setFesActorStatus(fesActor) {
        this.data.actorInfo.fesActor.blesses = fesActor.blesses;
        this.data.actorInfo.fesActor.potentials = fesActor.potentials;
        this.data.actorInfo.fesActor.talents = fesActor.talents;
        this.data.actorInfo.fesActor.skills = fesActor.skills;
        Actor_1.FesActorUtils.SetFesActorAttrByType(this.data.actorInfo.fesActor, P.EAttrType.MaxHp, Actor_1.FesActorUtils.GetFesActorAttrByType(fesActor, P.EAttrType.MaxHp));
        Actor_1.FesActorUtils.SetFesActorAttrByType(this.data.actorInfo.fesActor, P.EAttrType.AtkBase, Actor_1.FesActorUtils.GetFesActorAttrByType(fesActor, P.EAttrType.AtkBase));
        Actor_1.FesActorUtils.SetFesActorAttrByType(this.data.actorInfo.fesActor, P.EAttrType.HealthFlaskCount, Actor_1.FesActorUtils.GetFesActorAttrByType(fesActor, P.EAttrType.HealthFlaskCount));
        Actor_1.FesActorUtils.SetFesActorAttrByType(this.data.actorInfo.fesActor, P.EAttrType.MaxMpAdd2, Actor_1.FesActorUtils.GetFesActorAttrByType(fesActor, P.EAttrType.MaxMpAdd2));
        Actor_1.FesActorUtils.SetFesActorAttrByType(this.data.actorInfo.fesActor, P.EAttrType.HpRateEq, Actor_1.FesActorUtils.GetFesActorAttrByType(fesActor, P.EAttrType.HpRateEq));
        Actor_1.FesActorUtils.SetFesActorAttrByType(this.data.actorInfo.fesActor, P.EAttrType.MaxMpAdd3, Actor_1.FesActorUtils.GetFesActorAttrByType(fesActor, P.EAttrType.MaxMpAdd3));
        Actor_1.FesActorUtils.SetFesActorAttrByType(this.data.actorInfo.fesActor, P.EAttrType.RebornMax, Actor_1.FesActorUtils.GetFesActorAttrByType(fesActor, P.EAttrType.RebornMax));
    }
    SkipToNearTargetRoomType(mode, actor, rt, fesActor = null) {
        this.clear();
        let brdconf = Xlsx_1.Xlsx.BreedDungeonConf.All.find((c) => (c.mode == mode && c.tag != "newbie"));
        if (Player_1.ModelPlayer.Instance.GetBaseActorCount(actor) <= 0) {
            Player_1.ModelPlayer.Instance.AddResource(P.EResourceChangeReason.Gm, 0, P.STResource.create({
                type: P.EResourceType.BaseActor, id: actor
            }));
        }
        let ret = this.BreedDungeonEnter(P.ApiBreedDungeonEnter.post.req.create({
            mode: mode,
            actorId: actor,
            breedDungeonId: brdconf.breedDungeonId
        }), P.ApiBreedDungeonEnter.post.res.create());
        this._blessRandomGenerator = null;
        this._potentialRandomGenerator = null;
        if (fesActor) {
            this.setFesActorStatus(fesActor);
        }
        if (!ret.success) {
            return ret;
        }
        let maxPhase = XlsxUtils_1.XlsxUtils.BreedDungeomMaxPhase.get(brdconf.breedDungeonId);
        let targetStageIndex = 0;
        while (this.data.baseInfo.currentPhase <= maxPhase) {
            let phaseInfo = this.currentPhaseInfo;
            for (let [key, value] of Object.entries(phaseInfo.roomRandomed)) {
                if (value.rooms.findIndex((room) => room.roomType == rt) > -1) {
                    targetStageIndex = parseInt(key);
                    break;
                }
            }
            if (targetStageIndex != 0) {
                for (let i = targetStageIndex; i > 1; i--) {
                    let ret = this.BreedDungeonEnterRoom(P.ApiBreedDungeonEnterRoom.post.req.create({ selectRoomIndex: 0 }), P.ApiBreedDungeonEnterRoom.post.res.create());
                    if (!ret.success) {
                        return ret;
                    }
                    if (this.currentRoom.roomType == P.EBreedDungeonRoomType.Event)
                        this.currentRoom.selectEvent = this.currentRoom.events[0];
                    ret = this.BreedDungeonRoomFinish(P.ApiBreedDungeonFinishRoom.post.req.create({
                        activeInfo: P.DungeonActiveInfo.create({}),
                        dropInfo: P.ApiBreedDungeonFinishRoom.post.req.DropInfo.create({
                            breedResCount: {
                                [P.EBreedDungeonResType.Hashrate]: 0,
                                [P.EBreedDungeonResType.Coin]: 0
                            }
                        }),
                    }), P.ApiBreedDungeonFinishRoom.post.res.create());
                    this.rewardInfo.stageSelectRewards = new P.STBreedDungeonStageSelectRewards();
                    this.currentRoom.rewarded = true;
                    if (!ret.success) {
                        return ret;
                    }
                }
                break;
            }
            if (this.data.baseInfo.currentPhase == maxPhase)
                break;
            this.data.baseInfo.currentPhase++;
            this.generatePhase();
        }
        if (targetStageIndex == 0) {
            this.clear();
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    SkipToNearTargetRewardType(mode, actor, rt, fesActor = null) {
        this.clear();
        let brdconf = Xlsx_1.Xlsx.BreedDungeonConf.All.find((c) => (c.mode == mode && c.tag != "newbie"));
        if (Player_1.ModelPlayer.Instance.GetBaseActorCount(actor) <= 0) {
            Player_1.ModelPlayer.Instance.AddResource(P.EResourceChangeReason.Gm, 0, P.STResource.create({
                type: P.EResourceType.BaseActor, id: actor
            }));
        }
        let ret = this.BreedDungeonEnter(P.ApiBreedDungeonEnter.post.req.create({
            mode: mode,
            actorId: actor,
            breedDungeonId: brdconf.breedDungeonId
        }), P.ApiBreedDungeonEnter.post.res.create());
        this._blessRandomGenerator = null;
        this._potentialRandomGenerator = null;
        if (fesActor) {
            this.setFesActorStatus(fesActor);
        }
        if (!ret.success) {
            return ret;
        }
        let maxPhase = XlsxUtils_1.XlsxUtils.BreedDungeomMaxPhase.get(brdconf.breedDungeonId);
        let targetStageIndex = 0;
        while (this.data.baseInfo.currentPhase <= maxPhase) {
            let phaseInfo = this.currentPhaseInfo;
            for (let [key, value] of Object.entries(phaseInfo.roomRandomed)) {
                if (value.rewardType == rt) {
                    targetStageIndex = parseInt(key);
                    break;
                }
            }
            if (targetStageIndex != 0) {
                for (let i = targetStageIndex; i > 1; i--) {
                    ret = this.BreedDungeonEnterRoom(P.ApiBreedDungeonEnterRoom.post.req.create({ selectRoomIndex: 0 }), P.ApiBreedDungeonEnterRoom.post.res.create());
                    if (!ret.success) {
                        return ret;
                    }
                    if (this.currentRoom.roomType == P.EBreedDungeonRoomType.Event)
                        this.currentRoom.selectEvent = this.currentRoom.events[0];
                    ret = this.BreedDungeonRoomFinish(P.ApiBreedDungeonFinishRoom.post.req.create({
                        activeInfo: P.DungeonActiveInfo.create({}),
                        dropInfo: P.ApiBreedDungeonFinishRoom.post.req.DropInfo.create({
                            breedResCount: {
                                [P.EBreedDungeonResType.Hashrate]: 0,
                                [P.EBreedDungeonResType.Coin]: 0
                            }
                        }),
                    }), P.ApiBreedDungeonFinishRoom.post.res.create());
                    this.rewardInfo.stageSelectRewards = new P.STBreedDungeonStageSelectRewards();
                    this.currentRoom.rewarded = true;
                    if (!ret.success) {
                        return ret;
                    }
                }
                break;
            }
            if (this.data.baseInfo.currentPhase == maxPhase)
                break;
            this.data.baseInfo.currentPhase++;
            this.generatePhase();
        }
        if (targetStageIndex == 0) {
            this.clear();
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    SkipTo(mode, phase, stage, actor, fesActor = null) {
        this.clear();
        let brdconf = Xlsx_1.Xlsx.BreedDungeonConf.All.find((c) => (c.mode == mode && c.tag != "newbie"));
        if (Player_1.ModelPlayer.Instance.GetBaseActorCount(actor) <= 0) {
            Player_1.ModelPlayer.Instance.AddResource(P.EResourceChangeReason.Gm, 0, P.STResource.create({
                type: P.EResourceType.BaseActor, id: actor
            }));
        }
        let ret = this.BreedDungeonEnter(P.ApiBreedDungeonEnter.post.req.create({
            mode: mode,
            actorId: actor,
            breedDungeonId: brdconf.breedDungeonId
        }), P.ApiBreedDungeonEnter.post.res.create());
        if (!ret.success) {
            return ret;
        }
        if (fesActor) {
            this.setFesActorStatus(fesActor);
        }
        while (this.data.baseInfo.currentPhase < phase) {
            this.data.baseInfo.currentPhase++;
            this.generatePhase();
        }
        this.data.baseInfo.currentPhase = phase;
        let phaseInfo = this.currentPhaseInfo;
        let currentStage = phaseInfo.currentStageIndex;
        for (let i = currentStage; i < stage - 1; i++) {
            let ret = this.BreedDungeonEnterRoom(P.ApiBreedDungeonEnterRoom.post.req.create({ selectRoomIndex: 0 }), P.ApiBreedDungeonEnterRoom.post.res.create());
            if (!ret.success) {
                return ret;
            }
            if (this.currentRoom.roomType == P.EBreedDungeonRoomType.Event)
                this.currentRoom.selectEvent = this.currentRoom.events[0];
            ret = this.BreedDungeonRoomFinish(P.ApiBreedDungeonFinishRoom.post.req.create({
                activeInfo: P.DungeonActiveInfo.create({}),
                dropInfo: P.ApiBreedDungeonFinishRoom.post.req.DropInfo.create({
                    breedResCount: {
                        [P.EBreedDungeonResType.Hashrate]: 0,
                        [P.EBreedDungeonResType.Coin]: 0
                    }
                }),
            }), P.ApiBreedDungeonFinishRoom.post.res.create());
            if (!ret.success) {
                return ret;
            }
            this.currentRoom.rewarded = true;
            this.rewardInfo.stageSelectRewards = new P.STBreedDungeonStageSelectRewards();
        }
        this.rewardInfo.stageSelectRewards = P.STBreedDungeonStageSelectRewards.create();
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    Finish(mode, actor, fesActor = null) {
        this.clear();
        let brdconf = Xlsx_1.Xlsx.BreedDungeonConf.All.find((c) => c.mode == mode);
        if (Player_1.ModelPlayer.Instance.GetBaseActorCount(actor) <= 0) {
            Player_1.ModelPlayer.Instance.AddResource(P.EResourceChangeReason.Gm, 0, P.STResource.create({
                type: P.EResourceType.BaseActor, id: actor
            }));
        }
        let ret = this.BreedDungeonEnter(P.ApiBreedDungeonEnter.post.req.create({
            mode: mode,
            actorId: actor,
            breedDungeonId: brdconf.breedDungeonId
        }), P.ApiBreedDungeonEnter.post.res.create());
        if (!ret.success) {
            return ret;
        }
        let maxPhase = this.conf.maxPhase;
        while (this.data.baseInfo.currentPhase < maxPhase) {
            this.data.baseInfo.currentPhase++;
            this.generatePhase();
        }
        this.data.baseInfo.currentPhase = maxPhase;
        let phaseInfo = this.currentPhaseInfo;
        let currentStage = phaseInfo.currentStageIndex;
        let maxStageIndex = Object.keys(phaseInfo.roomRandomed).length;
        for (let i = currentStage; i < maxStageIndex - 1; i++) {
            let ret = this.BreedDungeonEnterRoom(P.ApiBreedDungeonEnterRoom.post.req.create({ selectRoomIndex: 0 }), P.ApiBreedDungeonEnterRoom.post.res.create());
            if (!ret.success) {
                return ret;
            }
            if (this.currentRoom.roomType == P.EBreedDungeonRoomType.Event)
                this.currentRoom.selectEvent = this.currentRoom.events[0];
            ret = this.BreedDungeonRoomFinish(P.ApiBreedDungeonFinishRoom.post.req.create({
                activeInfo: P.DungeonActiveInfo.create({}),
                dropInfo: P.ApiBreedDungeonFinishRoom.post.req.DropInfo.create({
                    breedResCount: {
                        [P.EBreedDungeonResType.Hashrate]: 0,
                        [P.EBreedDungeonResType.Coin]: 0
                    }
                }),
            }), P.ApiBreedDungeonFinishRoom.post.res.create());
            if (!ret.success) {
                return ret;
            }
            this.currentRoom.rewarded = true;
            this.rewardInfo.stageSelectRewards = new P.STBreedDungeonStageSelectRewards();
        }
        phaseInfo.finished = true;
        this.data.finished = true;
        if (fesActor) {
            this.data.actorInfo.fesActor = fesActor;
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonRefreshShop(res) {
        let currentRoom = this.currentRoom;
        if (!([P.EBreedDungeonRoomType.Shop, P.EBreedDungeonRoomType.SpShop].includes(currentRoom.roomType))) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedOnlyShopCanRefresh, `current room type ${currentRoom.roomType} not valid`);
        }
        if (currentRoom.refreshed) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonShopPurchased);
        }
        let shopRefreshCost = Misc_1.Misc.breedDungeonMisc.shopRefreshCost[currentRoom.refreshCount];
        if (!this.resourceEnough(shopRefreshCost.type, shopRefreshCost.count)) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.PlayerResourceNotEnough);
        }
        this.costResource(shopRefreshCost.type, shopRefreshCost.count);
        currentRoom.refreshCount++;
        if (currentRoom.canRefreshCount == currentRoom.refreshCount)
            currentRoom.refreshed = true;
        let phaseInfo = this.currentPhaseInfo;
        phaseInfo.roomDevices[phaseInfo.currentStageIndex - 1] = P.STBreedDungeonDeviceMap.create();
        if (this.genCurrentRoomDevicesRecord(phaseInfo)) {
            let roomDevices = this.getPhaseRoomDevices(phaseInfo);
            res.devices = Util_1.U.DeepCopy(roomDevices);
        }
        res.roomInfo = Util_1.U.DeepCopy(currentRoom);
        res.deviceShowupCount = Util_1.U.DeepCopy(this.randomInfo.deviceShowupCount);
        res.resourceCount = Util_1.U.DeepCopy(this.resourceInfo.count);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    BreedDungeonOpenDevice(req, res) {
        let deviceId = req.deviceId;
        let deviceConf = this.getDeviceConf(deviceId);
        if (!deviceConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, "breed dungeon device id invalid");
        }
        if (!this.initialized) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon not start");
        }
        let phaseInfo = this.currentPhaseInfo;
        if (!phaseInfo) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNotInited, "breed dungeon phase not inited");
        }
        Actor_1.FesActorUtils.FillActiveAttrsWithReq(this.FesActor, ...req.activeInfo?.activeAttrs);
        if (req.activeInfo) {
            this.data.activeInfo = Util_1.U.DeepCopy(req.activeInfo);
        }
        let room = this.currentRoom;
        let deviceMap;
        let deviceFromRoom = false;
        if (this.phaseFinished || phaseInfo.rooms.length == 0) {
            deviceMap = phaseInfo.phaseDevices;
        }
        else {
            deviceFromRoom = true;
            deviceMap = this.getPhaseRoomDevices(phaseInfo);
        }
        if (!(deviceId in deviceMap.info)) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonDeviceInfoErr, "breed dungeon device not inited");
        }
        let deviceInfo = this.getDeviceInfo(deviceId);
        if (deviceInfo.lock) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonDeviceInfoErr, "breed dungeon device lock");
        }
        let useCost = 0;
        let leftDebt = new Util_1.U.DefaultNumberMap(null, 0);
        if (room) {
            let debts = this.dungeonFunctions(P.EBreedDungeonFunction.Debt, room);
            debts.forEach((r) => {
                leftDebt.set(r.debt.type, r.debt.max);
            });
        }
        if (this.rewardToGet) {
            let { cost, success } = this.refreshDevice(deviceConf, deviceInfo, leftDebt, room);
            if (!success) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonDeviceInfoErr, "breed dungeon device refresh failed");
            }
            useCost = cost;
        }
        else {
            let { cost, success } = this.costDevice(deviceConf, deviceInfo, leftDebt, room);
            if (!success) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonDeviceInfoErr, "breed dungeon device cost failed");
            }
            useCost = cost;
        }
        let whiteList = [];
        let useCount = (this.deviceInfo.deviceUseCount[deviceId] || 0);
        let blackListConf = Xlsx_1.Xlsx.BreedDungeonBlessBlackListConf.Get(deviceId, useCount + 1, 3);
        if (blackListConf) {
            blackListConf.blesses.forEach((r) => whiteList.push(r));
        }
        let ret = null;
        switch (deviceConf.type) {
            case P.EBreedDungeonDeviceType.PreferedBless:
                let deviceExtraRefreshTimes = this.dungeonFunctions(P.EBreedDungeonFunction.RefreshDevice, room, true);
                deviceExtraRefreshTimes.forEach((r) => {
                    if (r.refreshDevice.deviceId == deviceId) {
                        deviceInfo.canRefreshCount += r.refreshDevice.refreshCount;
                    }
                });
                if (this.refreshBlessReward(deviceInfo.series)) {
                    ret = ServerUtils_1.ServerUtils.MakeRet(true);
                }
                else {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonBlessRandomBlessFailed, "can not random more bless");
                }
                break;
            case P.EBreedDungeonDeviceType.Potential:
                if (this.refreshPotentialReward()) {
                    ret = ServerUtils_1.ServerUtils.MakeRet(true);
                }
                else {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonPotentialRandomPotentialFailed, "can not random more potential");
                }
                break;
            case P.EBreedDungeonDeviceType.BlessUpgrade:
                this.refreshBlessUpReward(deviceConf.upCount);
                ret = ServerUtils_1.ServerUtils.MakeRet(true);
                break;
            case P.EBreedDungeonDeviceType.RecoverSan:
                let curSan = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.San, true);
                if (curSan > 0) {
                    Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.San, deviceConf.recoverValue, deviceConf.isRecoverRatio);
                }
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                break;
            case P.EBreedDungeonDeviceType.RecoverHp:
                let extraRecovers = this.dungeonFunctions(P.EBreedDungeonFunction.ShopExtraHpRecover, room);
                let extraRatio = 0;
                let extraValue = 0;
                extraRecovers.forEach((v) => {
                    if (v.shopExtraHpRecover.isRatio) {
                        extraRatio += v.shopExtraHpRecover.value;
                    }
                    else {
                        extraValue += v.shopExtraHpRecover.value;
                    }
                });
                let ratio = 1;
                Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, deviceConf.recoverValue * ratio, deviceConf.isRecoverRatio);
                Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, extraValue, false);
                Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, extraRatio, true);
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                break;
            case P.EBreedDungeonDeviceType.ResToRes:
                let ruleConf = Xlsx_1.Xlsx.BreedDungeonResToResDeviceRule.Get(deviceConf.ruleId);
                if (!ruleConf) {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, "breed dungeon res to res device rule not found");
                }
                let targetDeviceId = ruleConf.targetDeviceId;
                let targetDeviceConf = this.deviceConf(targetDeviceId);
                if (!targetDeviceConf) {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, "breed dungeon res to res device not found");
                }
                this.addResource(targetDeviceConf.costType, useCost, false);
                this.updateSpDeviceInfo(deviceConf, deviceInfo);
                break;
            case P.EBreedDungeonDeviceType.RemoveSanDebuff:
                if (this.buffInfo.sanDebuffsRound.length == 0) {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonNoNeedToRemoveDebuff, "breed dungeon san buff empty");
                }
                for (let i = 0; i < deviceConf.sanDebuffRemoveCount; i++) {
                    Dungeon_1.DungeonUtils.RandomRemoveSanBuff(this);
                }
                break;
            case P.EBreedDungeonDeviceType.SkipSanDebuffRound:
                for (let i = 0; i < deviceConf.skipSanDebuffRound; i++) {
                    Dungeon_1.DungeonUtils.UpdateSanBuffRound(this.buffInfo.sanDebuffsRound);
                }
                break;
            case P.EBreedDungeonDeviceType.EventSpPreferedBless:
            case P.EBreedDungeonDeviceType.SpPreferedBless:
                let spBlessRule = Xlsx_1.Xlsx.BreedDungeonSpPreferedBlessDeviceRule.Get(deviceConf.ruleId);
                if (spBlessRule.info.length > 0) {
                    let spWeight = {};
                    spBlessRule.info.forEach((bw) => {
                        spWeight[bw.quality] = bw.weight;
                    });
                    this.blessRandomGenerator.SetNextQualityWeight(new Util_1.U.DefaultNumberMap(spWeight));
                    if (this.refreshBlessReward(deviceInfo.series)) {
                        ret = ServerUtils_1.ServerUtils.MakeRet(true);
                    }
                    else {
                        if (deviceConf.chgResources.length != 0) {
                            deviceConf.chgResources.forEach((res) => this.addResource(res.type, res.count));
                        }
                        else {
                            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedDungeonBlessRandomBlessFailed, "can not random more bless");
                        }
                    }
                }
                else {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResTableError, "no sp rule");
                }
                break;
            case P.EBreedDungeonDeviceType.Rest:
                let san = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.San, true);
                if (san > 0) {
                    Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.San, deviceConf.recoverValue, deviceConf.isRecoverRatio);
                }
                this.dungeonFunctions(P.EBreedDungeonFunction.BuffModify).forEach((func) => {
                    if (func.buffModify.isDebuff && !func.buffModify.isAdd) {
                        Dungeon_1.DungeonUtils.RandomRemoveSanBuff(this, func.buffModify.count, true);
                    }
                });
                Dungeon_1.DungeonUtils.RandomRemoveSanBuff(this, deviceConf.sanDebuffRemoveCount, true);
                Dungeon_1.DungeonUtils.RandomRemoveSanBuff(this, deviceConf.sanBuffRemoveCount, false);
                let restRecoverDown = this.dungeonFunctions(P.EBreedDungeonFunction.RecoverDown);
                let restRatio = 1;
                restRecoverDown.forEach((conf) => restRatio -= conf.recoverDown.value);
                if (restRatio < 0)
                    restRatio = 0;
                Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, deviceConf.restHpRecover * restRatio, false);
                for (let r of deviceConf.resources) {
                    this.addResource(r.type, r.count);
                }
                let extraRestHp = this.dungeonFunctions(P.EBreedDungeonFunction.HpRecover, room);
                extraRestHp.forEach((v) => {
                    Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, v.hpRecover.value * restRatio, v.hpRecover.isRatio);
                });
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                break;
            case P.EBreedDungeonDeviceType.Gamble:
                ret = this.randomGambleEffect(deviceConf.gambleId, room);
                let gambleHpRecover = this.dungeonFunctions(P.EBreedDungeonFunction.GambleHpRecover, room);
                gambleHpRecover.forEach((v) => {
                    Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, v.gambleHpRecover.value, v.gambleHpRecover.isRatio);
                });
                Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.RandomP0GambleMtimes, 1, deviceId);
                Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.GambleP0DeviceMtimes, 1, deviceId);
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                this.deviceInfo.gambleTimes++;
                break;
            case P.EBreedDungeonDeviceType.Resource:
                for (let r of deviceConf.resources) {
                    this.addResource(r.type, r.count);
                }
                this.rewardInfo.rewards.push(...deviceConf.playerResource);
                break;
            case P.EBreedDungeonDeviceType.Attr:
                Actor_1.FesActorUtils.AddAttr(this.FesActor, ...deviceConf.attrs);
                deviceConf.staticAttrs.forEach((r) => {
                    let active = Actor_1.FesActorUtils.ACTIVE_ATTR_TYPE.includes(r.type);
                    Actor_1.FesActorUtils.SetFesActorAttrByType(this.FesActor, r.type, r.value, active);
                });
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                break;
            case P.EBreedDungeonDeviceType.AttrToRes:
                let currentLock = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.HpRateLock);
                let addLock = Util_1.U.Sum(deviceConf.attrs.filter((r) => r.type == P.EAttrType.HpRateLock).map((v) => v.value));
                let maxLock = Actor_1.FesActorUtils.GetActorMaxAttrValue(this.FesActor, P.EAttrType.HpRateLock);
                if (addLock > 0) {
                    if (currentLock + addLock >= maxLock) {
                        return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.BreedHpMaxLow, `hp ${currentLock} low`);
                    }
                    else {
                        Actor_1.FesActorUtils.SetFesActorAttrByType(this.FesActor, P.EAttrType.HpRateLock, currentLock + addLock);
                        let hpMax = Actor_1.FesActorUtils.GetFesActorAttrRealValue(this.FesActor, P.EAttrType.MaxHp);
                        let hpRateNow = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, P.EAttrType.Hp, true);
                        let hpValueNow = hpMax * hpRateNow;
                        let newHpr = 0;
                        let newHpMax = hpMax * (currentLock + addLock) / 10000;
                        if (hpValueNow >= newHpMax) {
                            newHpr = 1;
                        }
                        else {
                            newHpr = hpValueNow / newHpMax;
                        }
                        Actor_1.FesActorUtils.SetFesActorAttrByType(this.FesActor, P.EAttrType.Hp, newHpr, true);
                    }
                }
                let others = deviceConf.attrs.filter((r) => r.type != P.EAttrType.HpRateLock);
                Actor_1.FesActorUtils.AddAttr(this.FesActor, ...others);
                for (let r of deviceConf.resources) {
                    this.addResource(r.type, r.count);
                }
                this.rewardInfo.rewards.push(...deviceConf.playerResource);
                deviceConf.staticAttrs.forEach((r) => {
                    let active = Actor_1.FesActorUtils.ACTIVE_ATTR_TYPE.includes(r.type);
                    Actor_1.FesActorUtils.SetFesActorAttrByType(this.FesActor, r.type, r.value, active);
                });
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                this.randomInfo.usedAttrToResDevices.push(deviceConf.deviceId);
                break;
            case P.EBreedDungeonDeviceType.GambleInfinite:
                let poolId = deviceInfo.infiniteGamblePool;
                let poolRewards = XlsxUtils_1.XlsxUtils.GetBreedInfiniteGamblePoolRewards(poolId);
                let weightPool = [];
                poolRewards.forEach((r) => {
                    if (!deviceInfo.infiniteGambleRandomed.includes(r.gambleId)) {
                        weightPool.push({ weight: r.weight, value: r.gambleId });
                    }
                });
                let resultGamble = ServerUtils_1.ServerUtils.RandomWeighted(weightPool, true);
                if (!resultGamble) {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResTableError, `cannot find index from pool ${poolId}`);
                }
                deviceInfo.infiniteGambleRandomed.push(resultGamble);
                ret = this.randomGambleEffect(resultGamble, room);
                if (!ret.success) {
                    return ret;
                }
                Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.RandomP0GambleMtimes, 1, resultGamble);
                Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.GambleP0DeviceMtimes, 1, resultGamble);
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                res.gambleResult = resultGamble;
                this.deviceInfo.gambleTimes++;
                break;
            case P.EBreedDungeonDeviceType.AddBuff:
                deviceConf.rewardBuff.forEach((buff) => {
                    this.buffInfo.sanBuffsRound.push(Util_1.U.DeepCopy(buff));
                });
                break;
            default:
                break;
        }
        this.randomInfo.deviceShowupCount[deviceId] = this.randomInfo.deviceShowupCount[deviceId] ?? 0 + 1;
        this.deviceInfo.deviceUseCount[deviceId] = useCount + 1;
        if (this.rewardInfo.stageSelectRewards)
            this.rewardInfo.stageSelectRewards.fromDeviceId = deviceId;
        if (ret && !ret.success) {
            return ret;
        }
        if (this.isShopDevices(deviceId)) {
            let hpRecovers = this.dungeonFunctions(P.EBreedDungeonFunction.BuyHpRecover, room);
            hpRecovers.forEach((v) => {
                Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, P.EAttrType.Hp, v.buyHpRecover.value, v.buyHpRecover.isRatio);
            });
            if (hpRecovers.length > 0) {
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
            }
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.UseMmoneyInShopInBreed, useCost);
            this.deviceInfo.shopCostTotal += useCost;
        }
        if (!room.finished) {
            if (room.roomType == P.EBreedDungeonRoomType.HpShop) {
                Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.HpShopBuyMtimes, 1);
            }
            else if (room.roomType == P.EBreedDungeonRoomType.Shop) {
                Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.ShopBuyMtimes, 1);
            }
        }
        deviceMap.info[deviceId] = deviceInfo;
        if (deviceFromRoom) {
            if (deviceId in phaseInfo.phaseDevices?.info) {
                phaseInfo.phaseDevices.info[deviceId] = deviceInfo;
            }
        }
        this._shopDevices = null;
        if (deviceConf.type == P.EBreedDungeonDeviceType.EventSpPreferedBless) {
            deviceInfo = this.getDeviceInfo(deviceId);
            if (this.getResource(deviceConf.costType) == 0) {
                deviceInfo = new P.STBreedDungeonDevice({ id: deviceId });
            }
        }
        res.buffInfo = Util_1.U.DeepCopy(this.buffInfo);
        res.devicesChg.push(P.STBreedDungeonDevice.create(deviceInfo));
        res.resourceCount = Util_1.U.DeepCopy(this.resourceInfo.count);
        res.stageSelectRewards = Util_1.U.DeepCopy(this.rewardInfo.stageSelectRewards);
        res.playerResource = Util_1.U.DeepCopy(this.rewardInfo.rewards);
        res.deviceShowupCount = Util_1.U.DeepCopy(this.randomInfo.deviceShowupCount);
        res.usedAttrToResDevices = Util_1.U.DeepCopy(this.randomInfo.usedAttrToResDevices);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
}
exports.ModelBreedDungeon = ModelBreedDungeon;
//# sourceMappingURL=BreedDungeon.js.map