"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPlayer = void 0;
const DataSave_1 = require("../../Core/DataSave");
const P = require("../../Gen/pbdef");
// const Xlsx_1 = require("../../Gen/Xlsx");
// const Misc_1 = require("../../Misc");
// const Resource_1 = require("../../Server/Resource/Resource");
// const Actor_1 = require("../../Server/Module/Actor");
const Util_1 = require("../../Core/Util");
// const ServerUtils_1 = require("../../Server/ServerUtils");
// const PlotDialogue_1 = require("./PlotDialogue");
// const ResConverter_1 = require("../../Server/Module/ResConverter");
// const XlsxUtils_1 = require("../../Server/Module/XlsxUtils");
// const Task_1 = require("../../Server/Module/Task");
// const Common_1 = require("../../Server/Module/Common");
// const Dungeon_1 = require("../../Server/Module/Dungeon");
// const Notepad_1 = require("../../Server/Module/Notepad");
// const MessageBoard_1 = require("../../Server/Module/MessageBoard");
// const Quest_1 = require("../../Server/Module/Quest");
// const csharp_1 = require("csharp");
const BreedDungeon_1 = require("./BreedDungeon");
const ExploreDungeon_1 = require("./ExploreDungeon");
const Tutorial_1 = require("./Tutorial");
// const ClientCustomData_1 = require("./ClientCustomData");
// const macros_1 = require("../../macros");
class ModelPlayer extends DataSave_1.DataSaveCore.DataSaveWrapper {
    static PrototypeAnalyzerId = 4001;
    // changeStack = [new Resource_1.ResourceChange()];
    changeStackMax = 5;
    stackFull() {
        return this.changeStack.length >= this.changeStackMax;
    }
    stackEmpty() {
        return this.changeStack.length == 0;
    }
    stackTop() {
        return this.changeStack[this.changeStack.length - 1];
    }
    PushResourceChange(resourceChange) {
        if (this.stackFull()) {
            throw new Error("server: ResourceChange stack full");
        }
        this.changeStack.push(resourceChange);
    }
    PopResourceChange() {
        if (this.stackEmpty()) {
            throw new Error("server: ResourceChange stack empty");
        }
        return this.changeStack.pop();
    }
    AppendToResourceChangeList(changeIn) {
        let resourceChange = this.stackTop();
        resourceChange.ChangeInChange.push(changeIn);
    }
    ResetResourceChangeList() {
        let resourceChange = this.stackTop();
        resourceChange.ChangeInChange = [];
    }
    GetResourceChangeList() {
        let resourceChange = this.stackTop();
        return resourceChange.ChangeInChange;
    }
    DumpResourceChangeList() {
        return "debug";
    }
    GetResourceHistoryCount(resource) {
        let dict = Util_1.U.GetMapValue(this.resourcePack.historyCount, resource.type, P.SMResourcePack.ResourceHistoryCount.create({ dict: {} }));
        return Util_1.U.GetMapValue(dict.dict, resource.id, 0);
    }
    RecordResourceHistory(resourceChange) {
        if (resourceChange.ChangeDelta > 0) {
            let dict = Util_1.U.GetMapValue(this.resourcePack.historyCount, resourceChange.Resource.type, P.SMResourcePack.ResourceHistoryCount.create({ dict: {} }));
            let currentCount = Util_1.U.GetMapValue(dict.dict, resourceChange.Resource.id, 0);
            dict.dict[resourceChange.Resource.id] = currentCount + resourceChange.ChangeDelta;
        }
    }
    constructor() {
        let t = P.STPlayerInfo.create();
        super();
        super.init(t);
    }
    static get Instance() {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }
    get baseInfo() {
        if (!this.data.baseInfo) {
            this.data.baseInfo = new P.STPlayerBase({
                loginInfo: new P.STPlayerBase.LoginInformation(),
            });
        }
        if (!this.data.baseInfo.assistLevelMap || Object.keys(this.data.baseInfo.assistLevelMap).length == 0) {
            this.data.baseInfo.assistLevelMap = {};
            Xlsx_1.Xlsx.AssistLevelBaseConf.All.forEach((conf) => this.data.baseInfo.assistLevelMap[conf.id] = 0);
        }
        return this.data.baseInfo;
    }
    get profile() {
        if (!this.data.profile) {
            this.data.profile = new P.STPlayerProfile();
        }
        return this.data.profile;
    }
    get itemPack() {
        if (!this.data.itemPack) {
            this.data.itemPack = new P.STItemPack();
        }
        return this.data.itemPack;
    }
    get baseActorPack() {
        if (!this.data.baseActorPack) {
            this.data.baseActorPack = new P.STBaseActorPack();
        }
        return this.data.baseActorPack;
    }
    get fesActorPack() {
        if (!this.data.fesActorPack) {
            this.data.fesActorPack = new P.STFesActorPack();
        }
        return this.data.fesActorPack;
    }
    get currencyPack() {
        if (!this.data.currencyPack) {
            this.data.currencyPack = new P.STCurrencyPack();
        }
        return this.data.currencyPack;
    }
    get dungeonInfo() {
        if (!this.data.dungeonInfo) {
            this.data.dungeonInfo = P.STPlayerDungeon.create({
                record: P.STBreedDungeonRecord.create()
            });
        }
        return this.data.dungeonInfo;
    }
    get summary() {
        if (!this.data.summary) {
            this.data.summary = new P.SMPlayerSummary();
        }
        return this.data.summary;
    }
    get extraState() {
        if (!this.data.extraState) {
            this.data.extraState = new P.SMPlayerExtraState();
        }
        if (!this.data.extraState.shopStatus) {
            this.data.extraState.shopStatus = new P.SMPlayerExtraState.ShopStatus({
                goodEffectMap: {},
                status: {}
            });
        }
        return this.data.extraState;
    }
    get plotFragmentPack() {
        if (!this.data.plotFragmentPack) {
            this.data.plotFragmentPack = new P.STPlotFragmentPack();
        }
        return this.data.plotFragmentPack;
    }
    get avatarPack() {
        if (!this.data.avatarPack) {
            this.data.avatarPack = new P.STAvatarPack({ avatars: [] });
        }
        return this.data.avatarPack;
    }
    get skinPack() {
        if (!this.data.skinPack) {
            this.data.skinPack = new P.STSkinPack({ skins: [] });
        }
        return this.data.skinPack;
    }
    get plotPack() {
        if (!this.data.plotPack) {
            this.data.plotPack = new P.STPlotPack();
        }
        return this.data.plotPack;
    }
    get resourcePack() {
        if (!this.data.resourcePack) {
            this.data.resourcePack = new P.SMResourcePack();
        }
        return this.data.resourcePack;
    }
    get exploreDungeonRecord() {
        if (!this.data.exploreDungeonRecord) {
            this.data.exploreDungeonRecord = new P.SMExploreDungeonRecord();
        }
        return this.data.exploreDungeonRecord;
    }
    get heatRecord() {
        if (!this.data.heatRecord) {
            this.data.heatRecord = new P.SMHeatRecord({
                selectMap: new P.SMHeatRecord.SelectRecordMap({ punishLevelMap: {} }),
                effectMap: new P.SMHeatRecord.EffectSwitchMap({ heatEffectSwitchMap: {} }),
                actorRewardMap: {},
                actorMaxHeat: {},
                conditionReachCount: {}
            });
        }
        return this.data.heatRecord;
    }
    get consciousCrystalPack() {
        if (!this.data.consciousCrystalPack) {
            this.data.consciousCrystalPack = new P.STConsciousCrystalPack({ dict: {} });
        }
        return this.data.consciousCrystalPack;
    }
    get consciousCrystalFragPack() {
        if (!this.data.consciousCrystalFragPack) {
            this.data.consciousCrystalFragPack = new P.STConsciousCrystalFragPack({ dict: {} });
        }
        return this.data.consciousCrystalFragPack;
    }
    get consciousInfo() {
        if (!this.data.consciousInfo) {
            this.data.consciousInfo = new P.SMConsciousInfo();
        }
        return this.data.consciousInfo;
    }
    BreedDungeonVersionUpdated() {
        return this.dungeonInfo.forceClearVersion != Misc_1.Misc.breedDungeonMisc.forceClearVersion;
    }
    SetBreedDungeonVersionUpdate() {
        this.dungeonInfo.forceClearVersion = Misc_1.Misc.breedDungeonMisc.forceClearVersion;
    }
    Initialize(saveId) {
        super.Initialize(saveId);
    }
    createPlayer() {
        for (let r of Xlsx_1.Xlsx.PlayerInitRes.All) {
            this.AddResource(P.EResourceChangeReason.PlayerInitialize, 0, r.res);
        }
        this.data.playerId = this.saveId;
        this.profile.name = `id.${this.data.playerId}`;
        this.dungeonInfo.forceClearVersion = Misc_1.Misc.breedDungeonMisc.forceClearVersion;
    }
    Reload(saveId) {
        this.saveId = saveId;
        this.changeStack = [];
        this.changeStackMax = 5;
    }
    Login() {
        if ((this.baseInfo.loginInfo?.totalLoginCount ?? 1) == 0) {
            console.log("Server", "player register");
            this.createPlayer();
            if (!this.baseInfo.loginInfo) {
                this.baseInfo.loginInfo = new P.STPlayerBase.LoginInformation();
            }
            this.baseInfo.loginInfo.totalLoginCount++;
            this.baseInfo.isAssistModeOn = true;
        }
        console.log("info", "login time: " + this.baseInfo?.loginInfo?.loginTimestamp || 0);
        let blesses = Object.keys(this.dungeonInfo?.record?.blessSelect ?? []).map((v) => parseInt(v));
        Dungeon_1.DungeonUtils.CheckBlessSeriesAch(blesses);
        this.CheckHeatRecord();
        this.CheckAssistRecord();
        if (this.consciousInfo.level == 0)
            this.consciousInfo.level = 1;
        this.CheckAvatarSkinRecord();
        this.ResetResourceChangeList();
        return Util_1.U.DeepCopy(this.data);
    }
    AddResource(changeReason, subReason, ...resources) {
        return Resource_1.ResourceAPI.Instance.AddResource(this, Util_1.U.DeepCopy(resources), changeReason, subReason);
    }
    CostResource(changeReason, subReason, ...resources) {
        return Resource_1.ResourceAPI.Instance.CostResource(this, Util_1.U.DeepCopy(resources), changeReason, subReason);
    }
    CountResource(resource) {
        return Resource_1.ResourceAPI.Instance.CountResource(this, resource);
    }
    MakeChange(change, delta, payload) {
        return Resource_1.ResourceAPI.Instance.MakeChange(this, change, delta, payload);
    }
    EnoughResource(...resources) {
        for (let r of resources) {
            if (this.CountResource(r) < r.count) {
                return false;
            }
        }
        return true;
    }
    fillChangePack() {
        function __convert(chg) {
            if (!chg.ChangeObject) {
                console.warn(`${chg} has no change object`);
            }
            let stChg = Util_1.U.DeepCopy(chg.ChangeObject);
            if (chg.ChangeInChange.length > 0) {
                stChg.chgPack = P.STResourceChgPack.create();
                for (let chgInChg of chg.ChangeInChange) {
                    stChg.chgPack.list.push(__convert(chgInChg));
                }
            }
            return stChg;
        }
        let res_chg_pack = P.STResourceChgPack.create();
        let chg_list = this.GetResourceChangeList();
        for (let chg of chg_list) {
            res_chg_pack.list.push(__convert(chg));
        }
        this.ResetResourceChangeList();
        return res_chg_pack;
    }
    GetChangePack() {
        return this.fillChangePack();
    }
    GetSkinCount(skinId) {
        let index = this.skinPack?.skins?.findIndex((v) => v == skinId);
        return index >= 0 ? 1 : 0;
    }
    ChangeSkin(skinId, count, param) {
        let index = this.skinPack?.skins?.findIndex((v) => v == skinId);
        let skinConf = Xlsx_1.Xlsx.SkinUnlockConf.Get(skinId);
        if (!skinConf) {
            return { delta: 0, skin: skinId };
        }
        let changeDelta = 0;
        if (index < 0) {
            this.skinPack.skins.push(skinId);
            count -= 1;
            changeDelta++;
        }
        return { delta: changeDelta, skin: skinId };
    }
    SetSkins(actorId, skins) {
        this.profile.actorSkinMap[actorId] = new P.STPlayerProfile.SkinList({ skins: skins });
        return this.profile.actorSkinMap[actorId];
    }
    GetAvatarCount(avatarId) {
        let index = this.avatarPack?.avatars?.findIndex((v) => v == avatarId);
        return index >= 0 ? 1 : 0;
    }
    GetOwnAvatarCount() {
        let count = this.avatarPack?.avatars?.length;
        if (count == undefined)
            return 0;
        return count;
    }
    ChangeAvatar(avatarId, count, param) {
        let index = this.avatarPack?.avatars?.findIndex((v) => v == avatarId);
        let avatarConf = Xlsx_1.Xlsx.SkinUnlockConf.Get(avatarId);
        if (!avatarConf) {
            return { delta: 0, avatar: avatarId };
        }
        let changeDelta = 0;
        if (index < 0) {
            this.avatarPack.avatars.push(avatarId);
            count -= 1;
            changeDelta++;
            Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.OwnMavatar, 1);
        }
        return { delta: changeDelta, avatar: avatarId };
    }
    SetAvatar(avatarId) {
        if (this.GetAvatarCount(avatarId) <= 0) {
            return;
        }
        this.profile.currentAvatar = avatarId;
    }
    GetCurrentAvatar() {
        return this.profile.currentAvatar;
    }
    setDefaultAvatar() {
        let defaultAvatar = Misc_1.Misc.avatarMisc?.defaultAvatarId;
        return this.SetAvatar(defaultAvatar);
    }
    SetAvatarSpot(spot) {
        this.profile.avatarSpot = Util_1.U.DeepCopy(spot);
    }
    GetAvatarSpot() {
        return this.profile.avatarSpot;
    }
    GetBaseActor(baseActorId) {
        return this.baseActorPack.dict[baseActorId];
    }
    GetBaseActorCount(baseActorId) {
        let baseActorIdStr = baseActorId.toString();
        if (baseActorIdStr in this.baseActorPack.dict) {
            return 1;
        }
        return 0;
    }
    GetOwnBaseActorCount() {
        if (!this.baseActorPack?.dict)
            return 0;
        return Object.keys(this.baseActorPack.dict).length;
    }
    ChangeBaseActor(baseActorId, count, param) {
        let actorConf = Xlsx_1.Xlsx.BaseActorConf.Get(baseActorId);
        if (!actorConf) {
            console.error("XLSX", `ChangeBaseActor failed, baseActorId:${baseActorId} not exist`);
            return { delta: 0 };
        }
        let baseActor;
        let chgDelta = 0;
        if (!(baseActorId in this.baseActorPack.dict)) {
            baseActor = new P.STBaseActor({ id: baseActorId, timestamp: Number(csharp_1.NOAH.GameTime.utc) });
            this.baseActorPack.dict[baseActorId] = baseActor;
            count--;
            chgDelta = 1;
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.GetMbaseActor, 1);
            Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.UnlockMbaseActor, 1);
        }
        else {
            baseActor = this.baseActorPack.dict[baseActorId];
        }
        if (count > 0) {
            let transferRes = actorConf.transfer;
            if (transferRes && transferRes.length > 0) {
                let resAfter = new Array();
                for (let res of transferRes) {
                    res.count *= count;
                    resAfter.push(new P.STResource(res));
                }
                Resource_1.ResourceAPI.Instance.AddResource(this, resAfter, P.EResourceChangeReason.BaseActorTransfer, baseActor.id);
            }
        }
        return { delta: chgDelta, baseActor: baseActor };
    }
    GetFesActor(fesActorUid) {
        return this.fesActorPack.dict[fesActorUid];
    }
    GetFesActorUid() {
        return Object.keys(this.fesActorPack.dict).map((v) => parseInt(v));
    }
    GetFesActorCount(fesActorUid) {
        if (fesActorUid in this.fesActorPack.dict) {
            return 1;
        }
        return 0;
    }
    GetGeScoreFesActorCount(score) {
        let count = 0;
        for (let fesActorUid in this.fesActorPack.dict) {
            if (this.fesActorPack.dict[fesActorUid].score >= score)
                count++;
        }
        return count;
    }
    fesActorNextUid() {
        return ++this.fesActorPack.uidNext;
    }
    generateAddFesActor(templateId, fesActorUid) {
        let newFesActor = Actor_1.FesActorUtils.GenerateByTemplate(templateId, fesActorUid);
        this.AddFesActor(newFesActor);
        return newFesActor;
    }
    NextFesUid() {
        return ++this.fesActorPack.uidNext;
    }
    AddFesActor(fesActor) {
        this.fesActorPack.dict[fesActor.uid.toString()] = fesActor;
        let maxScore = this.fesActorPack.fesMaxScore[fesActor.id] ?? 0;
        if (fesActor.score > maxScore) {
            this.fesActorPack.fesMaxScore[fesActor.id] = fesActor.score;
        }
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.GetMscoreGtP0FesActor, 1, fesActor.score);
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Task, P.ETaskType.OwnMdiffrentFesActor, 1, fesActor.id);
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.OwnMfesActorWithScoreGeP0, 1, fesActor.score);
    }
    DelFesActor(fesActorUid) {
        if (fesActorUid in this.fesActorPack.dict) {
            let ret = Util_1.U.DeepCopy(this.fesActorPack.dict[fesActorUid]);
            delete this.fesActorPack.dict[fesActorUid];
            let returnResourceConf = Xlsx_1.Xlsx.FesActorDeleteReturn.All.find((v) => v.scoreMin <= ret.score && ret.score < v.scoreMax);
            if (returnResourceConf) {
                this.AddResource(P.EResourceChangeReason.DeleteFesActor, ret.uid, ...returnResourceConf.returnResources);
            }
            return ret;
        }
    }
    ChangeFesActor(fesActorUid, count, param) {
        if (count > 0) {
            let uid = this.fesActorNextUid();
            let newFesActor = this.generateAddFesActor(fesActorUid, uid);
            return { delta: 1, fesActor: newFesActor };
        }
        else if (count < 0) {
            let fesActor = this.DelFesActor(fesActorUid);
            if (fesActor) {
                return { delta: -1, fesActor: fesActor };
            }
        }
        else {
            let fesActor = this.GetFesActor(fesActorUid);
            if (fesActor) {
                return { delta: 0, fesActor: fesActor };
            }
        }
        return { delta: 0 };
    }
    LockFesActor(...fesActorUids) {
        for (let uid of fesActorUids) {
            if (!this.fesActorPack.lockedUids.includes(uid)) {
                this.fesActorPack.lockedUids.push(uid);
            }
        }
    }
    UnLockFesActor(...fesActorUids) {
        for (let uid of fesActorUids) {
            this.fesActorPack.lockedUids = this.fesActorPack.lockedUids.filter(obj => !fesActorUids.includes(obj));
        }
    }
    FesActorLocked(...fesActorUids) {
        return this.fesActorPack.lockedUids.some(obj => fesActorUids.includes(obj));
    }
    GetAllPlotFragemnt() {
        return Object.keys(this.plotFragmentPack.dict).map((v) => this.plotFragmentPack.dict[v]);
    }
    GetPlotFragmentCount(plotFragmentId) {
        let plotFragmentIdStr = plotFragmentId.toString();
        if (plotFragmentIdStr in this.plotFragmentPack.dict) {
            return 1;
        }
        return 0;
    }
    HasPlotFragment(plotFragmentId) {
        if (plotFragmentId in this.plotFragmentPack.dict) {
            return true;
        }
        return false;
    }
    ChangePlotFragment(plotFragmentId, count, param) {
        let plotFragmentIdStr = plotFragmentId.toString();
        let plot;
        if (plotFragmentIdStr in this.plotFragmentPack.dict) {
            plot = new P.STPlotFragment(this.plotFragmentPack.dict[plotFragmentIdStr]);
            return { delta: 0, plotFragment: plot };
        }
        else {
            plot = new P.STPlotFragment({
                plotId: plotFragmentId,
                timestamp: Number(csharp_1.NOAH.GameTime.utc),
            });
            this.plotFragmentPack.dict[plotFragmentIdStr] = plot;
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.GetMplotFragment, 1);
            return { delta: 1, plotFragment: plot };
        }
    }
    PlotFragmentRead(plotFragmentId) {
        if (plotFragmentId in this.plotFragmentPack.dict) {
            let plotFragment = this.plotFragmentPack.dict[plotFragmentId];
            plotFragment.read = true;
            this.MakeChange(P.STResource.create({ count: 1, id: plotFragmentId, type: P.EResourceType.PlotFragment }), 0, P.STResourcePayload.create({ plotFragment: Util_1.U.DeepCopy(plotFragment) }));
        }
    }
    GetItemCount(itemId) {
        let itemIdStr = itemId.toString();
        if (itemIdStr in this.itemPack.dict) {
            return this.itemPack.dict[itemIdStr].count;
        }
        return 0;
    }
    GetFunctypeItems(functype) {
        let ret = [];
        for (let itemId in this.itemPack.dict) {
            let item = this.itemPack.dict[itemId];
            let itemconf = Xlsx_1.Xlsx.ItemConf.Get(item.id);
            if (itemconf?.funcType == functype && item.count > 0) {
                ret.push(item.id);
            }
        }
        return ret;
    }
    HandleDynamicBox(dynamicConfId, count = 1, currentRelatedResources) {
        let resGroups = [];
        for (let confId of dynamicConfId) {
            let conf = Xlsx_1.Xlsx.DynamicItemBoxConf.Get(confId);
            if (!conf) {
                continue;
            }
            if (Common_1.CommonUtils.CheckUnlocked(conf.conditions) || ClientCustomData_1.ModelClientCustomData.Instance.IsPlotDropAfterFinal()) {
                resGroups.push(conf.resGroup);
            }
        }
        if (resGroups.length == 0) {
            return [];
        }
        return ResConverter_1.ResConverter.ResGroupChoice(currentRelatedResources, ...resGroups);
    }
    ChangeItem(itemId, count, param) {
        let item;
        let itemConf = Xlsx_1.Xlsx.ItemConf.Get(itemId);
        if (!itemConf) {
            return { delta: 0 };
        }
        switch (itemConf.funcType) {
            case P.EItemFuncType.DynamicBox:
                let ret = this.HandleDynamicBox(itemConf.funcParams, count);
                this.AddResource(P.EResourceChangeReason.ResourceConvert, itemId, ...ret);
                return { delta: 0, item: P.STItem.create({ count: count, id: itemId }) };
            default:
                break;
        }
        if (itemId in this.itemPack.dict) {
            item = this.itemPack.dict[itemId];
            item.count += count;
        }
        else {
            item = new P.STItem({
                id: itemId,
                count: count,
                lastExpireTimestamp: new Date().getTime()
            });
            this.itemPack.dict[itemId] = item;
        }
        return { delta: count, item: item };
    }
    CheckItemExpire() {
        let now = new Date().getTime();
        for (let key in this.itemPack.dict) {
            let itemObj = this.itemPack.dict[key];
            if (itemObj.lastExpireTimestamp) {
                if (itemObj.lastExpireTimestamp > 0 && now >= itemObj.lastExpireTimestamp) {
                    itemObj.count = 0;
                    itemObj.lastExpireTimestamp = 0;
                }
            }
        }
    }
    GetCurrencyCount(currencyId) {
        let currencyStr = currencyId.toString();
        if (currencyStr in this.currencyPack.dict) {
            return this.currencyPack.dict[currencyStr].count;
        }
        return 0;
    }
    ChangeCurrency(currencyId, count, param) {
        let currency;
        if (currencyId in this.currencyPack.dict) {
            currency = this.currencyPack.dict[currencyId];
            currency.count += count;
        }
        else {
            currency = new P.STCurrency({
                id: currencyId,
                count: count,
            });
            this.currencyPack.dict[currencyId] = currency;
        }
        if (currencyId == P.EResourceTypeCurrencyId.Coin && count < 0) {
            Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.CostMacePoint, -count);
        }
        return { delta: count, currency: currency };
    }
    GetPlots() {
        return Object.keys(this.plotPack.dict).map(obj => Number(obj));
    }
    HasPlot(plotId) {
        return Object.keys(this.plotPack.dict).includes(String(plotId));
    }
    ChangePlot(plotId, count, param) {
        let plot;
        if (plotId in this.plotPack.dict) {
            plot = this.plotPack.dict[plotId];
            return { delta: 0, plot: plot };
        }
        else {
            plot = new P.STPlot({
                plotId: plotId,
                timestamp: Number(csharp_1.NOAH.GameTime.utc),
                read: false
            });
            this.plotPack.dict[plotId] = plot;
            Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.ComposePnPlot, 1, plotId);
        }
        return { delta: 1, plot: plot };
    }
    ReadPlot(plotId) {
        if (plotId in this.plotPack.dict) {
            let plot = this.plotPack.dict[plotId];
            if (!plot.read) {
                PlotDialogue_1.ModelPlotDialogue.Instance.ResetCounterpartChatCount();
            }
            plot.read = true;
            this.MakeChange(P.STResource.create({ count: 1, id: plotId, type: P.EResourceType.Plot }), 0, P.STResourcePayload.create({ plot: Util_1.U.DeepCopy(plot) }));
            Notepad_1.NotepadUtil.CheckEvent();
            MessageBoard_1.MessageBoardUtil.CheckMessage();
        }
    }
    PlotRead(...plotId) {
        return plotId.every(id => {
            if (id in this.plotPack.dict) {
                return this.plotPack.dict[id].read;
            }
            return false;
        });
    }
    ComposePlot(plotId) {
        if (this.HasPlot(plotId)) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.PlotHasOwned, "PlotHasOwned");
        }
        let plotConf = Xlsx_1.Xlsx.PlotConf.Get(plotId);
        if (!plotConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, `PlotConfNotExist:${plotId}`);
        }
        for (let fragment of plotConf?.plotFragments) {
            if (!this.HasPlotFragment(fragment)) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.PlotFragmentNotEnough, `PlotFragmentNotEnough:${fragment}`);
            }
        }
        this.CostResource(P.EResourceChangeReason.PlotCompose, plotId, ...plotConf.cost);
        this.AddResource(P.EResourceChangeReason.PlotCompose, plotId, P.STResource.create({
            count: 1,
            id: plotId,
            type: P.EResourceType.Plot
        }));
        this.ReadPlot(plotId);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    GetRandomedBoss() {
        return this.dungeonInfo.randomedBoss;
    }
    GetKilledBosses() {
        return this.dungeonInfo.killedBosses;
    }
    RecordKilledBosses(...bosses) {
        for (let b of bosses) {
            if (!this.dungeonInfo.killedBosses.includes(b)) {
                this.dungeonInfo.killedBosses.push(b);
            }
        }
    }
    GetBreedDungeonFinishedMode() {
        return this.dungeonInfo.finishedModeList;
    }
    GetBreedDungeonTryTimes(dungeonId = 0) {
        if (dungeonId == 0) {
            let ret = 0;
            for (let dunId in this.dungeonInfo.record?.tryTimes) {
                ret += this.dungeonInfo.record?.tryTimes[dunId];
            }
            return ret;
        }
        else {
            return this.dungeonInfo.record?.tryTimes[dungeonId] ?? 0;
        }
    }
    GetBreedDungeonRecord() {
        let ret = {
            normal_try_times: 0,
            normal_finish_times: 0,
            master_try_times: 0,
            master_finish_times: 0,
        };
        for (let dunId in this.dungeonInfo.record?.tryTimes) {
            let mode = Xlsx_1.Xlsx.BreedDungeonConf.Get(Number(dunId))?.mode ?? 0;
            if (mode == P.EBreedDungeonMode.Normal) {
                ret.normal_try_times += this.dungeonInfo.record.tryTimes[dunId];
            }
            else if (mode == P.EBreedDungeonMode.Master) {
                ret.master_try_times += this.dungeonInfo.record.tryTimes[dunId];
            }
        }
        for (let dunId in this.dungeonInfo.record?.finishTimes) {
            let mode = Xlsx_1.Xlsx.BreedDungeonConf.Get(Number(dunId))?.mode ?? 0;
            if (mode == P.EBreedDungeonMode.Normal) {
                ret.normal_finish_times += this.dungeonInfo.record.finishTimes[dunId];
            }
            else if (mode == P.EBreedDungeonMode.Master) {
                ret.master_finish_times += this.dungeonInfo.record.finishTimes[dunId];
            }
        }
        return ret;
    }
    AddBreedDungeonReward(breedDungeonId, finished, mode, randomedBoss) {
        if (finished) {
            if (!this.dungeonInfo.finishedModeList.includes(mode)) {
                this.dungeonInfo.finishedModeList.push(mode);
            }
            this.dungeonInfo.record.finishTimes[breedDungeonId] = (this.dungeonInfo.record?.finishTimes[breedDungeonId] ?? 0) + 1;
        }
        for (let b of randomedBoss) {
            if (!this.dungeonInfo.randomedBoss.includes(b)) {
                this.dungeonInfo.randomedBoss.push(b);
            }
        }
        this.dungeonInfo.record.tryTimes[breedDungeonId] = (this.dungeonInfo.record?.tryTimes[breedDungeonId] ?? 0) + 1;
    }
    UpdatePotentialBlessRecord(blesses, potentials, actor) {
        for (let b of blesses) {
            let oldQuality = this.dungeonInfo.record.blessSelect[b.id] ?? 0;
            if (oldQuality < b.quality) {
                this.dungeonInfo.record.blessSelect[b.id] = b.quality;
            }
        }
        let potentialList = this.dungeonInfo.record.potentialSelectList[actor] ?? P.STBreedDungeonRecord.PotentialList.create({ list: [] });
        for (let p of potentials) {
            if (!potentialList.list.includes(p)) {
                potentialList.list.push(p);
            }
        }
        for (let r of Xlsx_1.Xlsx.PotentialComboConf.All.filter((r) => r.actorId == actor)) {
            if (this.dungeonInfo.record.potentialCombo.includes(r.id)) {
                continue;
            }
            if (r.potentials.every((p) => potentialList.list.includes(p))) {
                this.dungeonInfo.record.potentialCombo.push(r.id);
            }
        }
        this.dungeonInfo.record.potentialSelectList[actor] = potentialList;
    }
    UnlockBless() {
        for (let r of Xlsx_1.Xlsx.BlessConf.All) {
            if (r.id in this.dungeonInfo.record.blessSelect) {
                continue;
            }
            this.dungeonInfo.record.blessSelect[r.id] = Util_1.U.RandomChoice([3, 4]);
        }
        let items = [];
        Xlsx_1.Xlsx.ItemConf.All.filter((r) => r.funcType == P.EItemFuncType.BlessUnlock).forEach((r) => {
            items.push(P.STResource.create({
                count: 1,
                id: r.id,
                type: P.EResourceType.Item
            }));
        });
        ModelPlayer.Instance.AddResource(P.EResourceChangeReason.Gm, 0, ...items);
        return ModelPlayer.Instance.GetChangePack();
    }
    GetBreedDungeonInfo() {
        return this.dungeonInfo;
    }
    GetPotentialBlessRecord(actor) {
        return {
            blesses: Object.keys(this.dungeonInfo.record.blessSelect).map((r) => Number(r)),
            potentials: this.dungeonInfo.record.potentialSelectList[actor]?.list ?? []
        };
    }
    GetPotentialRecordCount() {
        let potentials = this.dungeonInfo?.record?.potentialSelectList;
        if (!potentials)
            return 0;
        let potentialIds = [];
        for (let actor in potentials) {
            let potentialList = potentials[actor];
            if (!potentialList.list)
                continue;
            for (let id of potentialList.list) {
                if (!potentialIds.includes(id))
                    potentialIds.push(id);
            }
        }
        return potentialIds.length;
    }
    GetSelectedBless() {
        return Object.keys(this.dungeonInfo.record.blessSelect).map((r) => Number(r));
    }
    PreferedBlessGuarnatee() {
        return this.dungeonInfo.preferedBlessGuaranteed;
    }
    SetPreferedBlessGuarnatee() {
        return this.dungeonInfo.preferedBlessGuaranteed = true;
    }
    GetLimitResourceConvertCount(confId) {
        return this.extraState.resConvertState[confId]?.callNum || 0;
    }
    AddLimitResourceConvertCount(confId, count) {
        if (!(confId in this.extraState.resConvertState)) {
            this.extraState.resConvertState[confId] = P.SMPlayerExtraState.LimitResourceConvertState.create({
                callNum: count
            });
        }
        else {
            this.extraState.resConvertState[confId].callNum += count;
        }
    }
    UpdateExploreDungeonInfo(finished, bosskilled) {
        if (finished) {
            this.exploreDungeonRecord.finishedTimes++;
        }
        this.exploreDungeonRecord.bossKilledCount += bosskilled;
    }
    GetExploreDungeonFinishTimes() {
        return this.exploreDungeonRecord.finishedTimes;
    }
    GetExploreDungeonBossKilled() {
        return this.exploreDungeonRecord.bossKilledCount;
    }
    GetFesMaxScore() {
        return this.fesActorPack.fesMaxScore;
    }
    GetGameTotalDuration() {
        return this.summary.duration ?? 0;
    }
    UpdateGameTotalDuration(duration) {
        this.summary.duration = duration;
    }
    GetGameSavedTimes() {
        return this.summary.saveTimes;
    }
    UpdateGameSavedTimes() {
        this.summary.saveTimes++;
    }
    UpdateBreedThemeRecord(mode, phase, themeLabel) {
        if (!this.dungeonInfo.record.modePhaseThemeRecord) {
            this.dungeonInfo.record.modePhaseThemeRecord = {};
        }
        let key = `${mode}_${phase}`;
        if (!this.dungeonInfo.record.modePhaseThemeRecord[key]) {
            this.dungeonInfo.record.modePhaseThemeRecord[key] = P.STBreedDungeonRecord.ThemeList.create({ themes: [] });
        }
        let themeList = this.dungeonInfo.record.modePhaseThemeRecord[key];
        themeList.themes.push(themeLabel);
        for (let i = Misc_1.Misc.breedDungeonMisc.modePhaseThemeRecordLimit; i < themeList.themes.length; i++) {
            themeList.themes.shift();
        }
    }
    GetBreedThemeRecord(mode, phase) {
        if (!this.dungeonInfo.record.modePhaseThemeRecord) {
            return [];
        }
        let key = `${mode}_${phase}`;
        if (!this.dungeonInfo.record.modePhaseThemeRecord[key]) {
            return [];
        }
        return this.dungeonInfo.record.modePhaseThemeRecord[key].themes;
    }
    CheckAvatarSkinRecord() {
        let avatarLimitArr = [];
        let skinLimitArr = [];
        for (let r of Xlsx_1.Xlsx.SkinUnlockConf.All) {
            if (r.unlockType.length == 0) {
                this.AddResource(P.EResourceChangeReason.PlayerInitialize, 0, new P.STResource({ type: r.type, id: r.id, count: 1 }));
                continue;
            }
            if (Common_1.CommonUtils.IsLockType(r.unlockType)) {
                if (r.unlockType.includes(P.EAvatarUnlockType.Dlc)) {
                    let dlcId = macros_1.USING_WEGAME ? r.wegameDlcId : r.steamDlcId;
                    if (csharp_1.SDKHelper.IsDlcInstalled(dlcId)) {
                        this.AddResource(P.EResourceChangeReason.PlayerInitialize, 0, new P.STResource({ type: r.type, id: r.id, count: 1 }));
                    }
                    else {
                        if (r.type == P.EResourceType.Avatar)
                            avatarLimitArr.push(r.id);
                        if (r.type == P.EResourceType.Skin)
                            skinLimitArr.push(r.id);
                    }
                }
                else {
                    if (r.type == P.EResourceType.Avatar)
                        avatarLimitArr.push(r.id);
                    if (r.type == P.EResourceType.Skin)
                        skinLimitArr.push(r.id);
                }
            }
        }
        let avatar_unlock = Util_1.U.GetPlayerData(Util_1.U.PLAYER_DATA_AVATAR_UNLOCK, []);
        let skin_unlock = Util_1.U.GetPlayerData(Util_1.U.PLAYER_DATA_SKIN_UNLOCK, []);
        avatar_unlock.forEach((id) => {
            ModelPlayer.Instance.AddResource(P.EResourceChangeReason.PlayerInitialize, 0, new P.STResource({
                type: P.EResourceType.Avatar,
                id: id,
                count: 1
            }));
        });
        skin_unlock.forEach((id) => {
            ModelPlayer.Instance.AddResource(P.EResourceChangeReason.PlayerInitialize, 0, new P.STResource({
                type: P.EResourceType.Skin,
                id: id,
                count: 1
            }));
        });
        avatarLimitArr = avatarLimitArr.filter((val) => !avatar_unlock.includes(val));
        skinLimitArr = skinLimitArr.filter((val) => !skin_unlock.includes(val));
        if (this.profile.currentAvatar == 0 || avatarLimitArr.includes(this.profile.currentAvatar))
            this.setDefaultAvatar();
        let skinKeysWaitToDelete = new Array();
        for (let key in this.profile.actorSkinMap) {
            let skins = this.profile.actorSkinMap[key].skins;
            if (skins.some((val) => skinLimitArr.includes(val))) {
                skinKeysWaitToDelete.push(key);
            }
            this.profile.actorSkinMap[key].skins = skins;
        }
        skinKeysWaitToDelete.forEach((val) => delete this.profile.actorSkinMap[val]);
        this.avatarPack.avatars = this.avatarPack.avatars.filter((val) => !avatarLimitArr.includes(val));
        this.skinPack.skins = this.skinPack.skins.filter((val) => !skinLimitArr.includes(val));
    }
    CheckAssistRecord() {
        let needRefresh = false;
        for (let [key, value] of Object.entries(this.baseInfo.assistLevelMap)) {
            let assistBaseConf = Xlsx_1.Xlsx.AssistLevelBaseConf.Get(parseInt(key), 3);
            if (!assistBaseConf) {
                needRefresh = true;
                break;
            }
            if (value > assistBaseConf.maxLevel) {
                needRefresh = true;
                break;
            }
        }
        if (needRefresh) {
            this.baseInfo.assistLevelMap = {};
            Xlsx_1.Xlsx.AssistLevelBaseConf.All.forEach((conf) => this.baseInfo.assistLevelMap[conf.id] = 0);
        }
    }
    CheckHeatRecord() {
        let externHeatLevel = Util_1.U.GetPlayerData(Util_1.U.PLAYER_DATA_HEAT_LEVEL, 0);
        if (this.heatRecord.currentLevel <= externHeatLevel) {
            this.heatRecord.currentLevel = externHeatLevel;
        }
        else {
            Util_1.U.SetPlayerData(Util_1.U.PLAYER_DATA_HEAT_LEVEL, this.heatRecord.currentLevel);
        }
        if (this.heatRecord.currentLevel < Misc_1.Misc.heatMisc.initHeatLevel) {
            this.heatRecord.currentLevel = Misc_1.Misc.heatMisc.initHeatLevel;
        }
        let selectRecordMap = this.GetHeatSelectRecord();
        let needRefresh = false;
        let heat = 0;
        for (let [key, value] of Object.entries(selectRecordMap.punishLevelMap)) {
            let heatConf = Xlsx_1.Xlsx.HeatConf.Get(parseInt(key), 1);
            if (!heatConf) {
                needRefresh = true;
                break;
            }
            if (value == 0)
                continue;
            if (heatConf.unlockLevel > this.heatRecord.currentLevel) {
                needRefresh = true;
                break;
            }
            if (value > heatConf.maxLevel || value < 0) {
                needRefresh = true;
                break;
            }
            let heatPunishConf = Xlsx_1.Xlsx.HeatPunishConf.Get(parseInt(key), value, 1);
            if (!heatPunishConf) {
                needRefresh = true;
                break;
            }
            heat += heatPunishConf.san;
            if (heat > Misc_1.Misc.heatMisc.levelMaxSanMap[this.heatRecord.currentLevel] ?? Infinity) {
                needRefresh = true;
                break;
            }
        }
        if (!needRefresh) {
            for (let [key, value] of Object.entries(this.heatRecord.effectMap.heatEffectSwitchMap)) {
                let heatEffectConf = Xlsx_1.Xlsx.HeatEffectConf.Get(parseInt(key), 1);
                if (!heatEffectConf) {
                    needRefresh = true;
                    break;
                }
                if (value && heatEffectConf.sanMin > heat) {
                    needRefresh = true;
                    break;
                }
            }
        }
        if (needRefresh) {
            console.warn("Reset", "heat system change");
            this.heatRecord.selectMap.punishLevelMap = {};
            this.heatRecord.effectMap.heatEffectSwitchMap = {};
            if (BreedDungeon_1.ModelBreedDungeon.Instance.initialized) {
                BreedDungeon_1.ModelBreedDungeon.Instance.Clear();
            }
            if (ExploreDungeon_1.ModelExploreDungeon.Instance.Initialized) {
                ExploreDungeon_1.ModelExploreDungeon.Instance.Reset();
            }
        }
    }
    GetActorMaxHeat() {
        return this.heatRecord.actorMaxHeat;
    }
    SetActorMaxHeat(obj) {
        this.heatRecord.actorMaxHeat = obj;
    }
    GetHeatSelectRecord() {
        return this.heatRecord.selectMap;
    }
    GetHeatEffectRecord() {
        return this.heatRecord.effectMap;
    }
    GetActorHeatRewardRecord(actorId) {
        if (!(actorId in this.heatRecord.actorRewardMap)) {
            this.heatRecord.actorRewardMap[actorId] = new P.RewardLevelConditionMap({
                levelMap: {},
            });
        }
        return this.heatRecord.actorRewardMap[actorId];
    }
    GetHeatPunishTypeCount() {
        let heatPunishType = new Set();
        for (let [punishType, level] of Object.entries(this.heatRecord.selectMap.punishLevelMap)) {
            if (level == 0)
                continue;
            let heatPunishConf = Xlsx_1.Xlsx.HeatPunishConf.Get(parseInt(punishType), level);
            if (!heatPunishConf)
                continue;
            heatPunishType.add(punishType);
        }
        return heatPunishType.size;
    }
    SetActorHeatRewardRecord(actorId, record) {
        this.heatRecord.actorRewardMap[actorId] = record;
    }
    SetHeatLevelAndEffectRecord(req) {
        let san = 0;
        for (let [key, value] of Object.entries(req.heatLevelMap)) {
            let heatConf = Xlsx_1.Xlsx.HeatConf.Get(parseInt(key));
            if (!heatConf)
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResTableError, `pk: ${key} error`);
            if (heatConf.unlockLevel > this.heatRecord.currentLevel && value != 0) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `current:${this.heatRecord.currentLevel} conf:${heatConf.unlockLevel}`);
            }
            if (value == 0)
                continue;
            if (value > heatConf.maxLevel || value < 0) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `key: ${key}, value: ${value} invalid`);
            }
            let heatPunishConf = Xlsx_1.Xlsx.HeatPunishConf.Get(parseInt(key), value);
            if (!heatPunishConf)
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResTableError, `pk: ${key} error`);
            san += heatPunishConf.san;
            if (san > (Misc_1.Misc.heatMisc.levelMaxSanMap[this.heatRecord.currentLevel] ?? Infinity)) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `max san limit`);
            }
        }
        for (let i = 0; i < Xlsx_1.Xlsx.HeatEffectConf.All.length; i++) {
            let conf = Xlsx_1.Xlsx.HeatEffectConf.All[i];
            if (san < conf.sanMin) {
                if (conf.id in req.heatEffectSwitchMap) {
                    if (req.heatEffectSwitchMap[conf.id]) {
                        return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `key: ${conf.id}, value: ${true} current_san: ${san} san_min: ${conf.sanMin} invalid`);
                    }
                }
            }
        }
        this.heatRecord.selectMap.punishLevelMap = req.heatLevelMap;
        this.heatRecord.effectMap.heatEffectSwitchMap = req.heatEffectSwitchMap;
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    GetHeatLevel() {
        return this.heatRecord.currentLevel;
    }
    UpdateHeatLevel(maxFinishStage, heat) {
        let conf = Xlsx_1.Xlsx.HeatLevelConf.Get(this.heatRecord.currentLevel);
        if (conf.condition == P.EHeatLevelUnlockCondition.None)
            return this.heatRecord.currentLevel;
        let success = false;
        switch (conf.condition) {
            case P.EHeatLevelUnlockCondition.FinishDungeonP0StageP1Heat:
                success = conf.params[0] <= maxFinishStage && conf.params[1] <= heat;
                break;
        }
        if (success) {
            if (!(conf.condition in this.heatRecord.conditionReachCount)) {
                this.heatRecord.conditionReachCount[conf.condition] = 0;
            }
            this.heatRecord.conditionReachCount[conf.condition]++;
            if (this.heatRecord.conditionReachCount[conf.condition] == conf.times) {
                this.heatRecord.currentLevel++;
                let externHeatLevel = Util_1.U.GetPlayerData(Util_1.U.PLAYER_DATA_HEAT_LEVEL, 0);
                if (this.heatRecord.currentLevel > externHeatLevel) {
                    Util_1.U.SetPlayerData(Util_1.U.PLAYER_DATA_HEAT_LEVEL, this.heatRecord.currentLevel);
                }
                this.heatRecord.conditionReachCount = {};
            }
        }
        return this.heatRecord.currentLevel;
    }
    HasConsciousCrystal(crystalId) {
        return crystalId in this.consciousCrystalPack.dict;
    }
    ChangeConsciousCrystal(crystalId, count, param) {
        let consciousCrystal;
        if (this.HasConsciousCrystal(crystalId)) {
            consciousCrystal = this.consciousCrystalPack.dict[crystalId];
            return { delta: 0, consciousCrystal: consciousCrystal };
        }
        else {
            consciousCrystal = new P.STConsciousCrystal({
                id: crystalId,
                level: 1,
                timestamp: Number(csharp_1.NOAH.GameTime.utc),
                new: true
            });
            this.consciousCrystalPack.dict[crystalId] = consciousCrystal;
            Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.OwnMconsciousCrystal, 1);
        }
        return { delta: 1, consciousCrystal: consciousCrystal };
    }
    GetConsciousCrystalFragCount(consciousCrystalFragId) {
        return this.consciousCrystalFragPack.dict[consciousCrystalFragId]?.count ?? 0;
    }
    ChangeConsciousCrystalFrag(consciousCrystalFragId, count, param) {
        let consciousCrystalFrag;
        if (consciousCrystalFragId in this.consciousCrystalFragPack.dict) {
            consciousCrystalFrag = this.consciousCrystalFragPack.dict[consciousCrystalFragId];
            consciousCrystalFrag.count += count;
        }
        else {
            consciousCrystalFrag = new P.STConsciousCrystalFrag({
                id: consciousCrystalFragId,
                count: count,
            });
            this.consciousCrystalFragPack.dict[consciousCrystalFragId] = consciousCrystalFrag;
        }
        return { delta: count, consciousCrystalFrag: consciousCrystalFrag };
    }
    ConsciousLevelUp(level) {
        if (level != this.consciousInfo.level + 1) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `current level:${this.consciousInfo.level}, param:${level}`) };
        }
        let conf = Xlsx_1.Xlsx.ConsciousLevelConf.Get(level);
        if (!conf) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, "res not found") };
        }
        let currentConf = Xlsx_1.Xlsx.ConsciousLevelConf.Get(this.consciousInfo.level);
        if (!this.EnoughResource(...currentConf.cost)) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.PlayerResourceNotEnough, "res not enough") };
        }
        this.CostResource(P.EResourceChangeReason.ConsciousLevelUp, 0, ...currentConf.cost);
        this.consciousInfo.level = level;
        Quest_1.QuestUtil.CheckTarget(P.EQuestTargetType.ConsciousUpToMlevel, level);
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.ConsciousUpToP0Level, 1, level);
        return { ret: ServerUtils_1.ServerUtils.MakeRet(true), resChg: Util_1.U.DeepCopy(ModelPlayer.Instance.GetChangePack()) };
    }
    GetTargetConsciousCrystal(target) {
        let costResource = new P.STResource({
            type: P.EResourceType.ConsciousCrystalFrag,
            id: Misc_1.Misc.consciousMisc.fragInfo.fragId,
            count: Misc_1.Misc.consciousMisc.fragInfo.cystalCostNum
        });
        if (!this.EnoughResource(costResource)) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.PlayerResourceNotEnough, "res not enough") };
        }
        let arr = XlsxUtils_1.XlsxUtils.ConsciousCrystalPoolById.get(Misc_1.Misc.consciousMisc.fragInfo.poolId) ?? [];
        if (target in this.consciousCrystalPack.dict) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.NoMoreConsciousCrystal, "already own") };
        }
        if (!arr.includes(target)) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResTableError, "id not in pool") };
        }
        if (!Xlsx_1.Xlsx.ConsciousCrystalConf.Get(target, 1, 3))
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResTableError, "no this crystal") };
        this.CostResource(P.EResourceChangeReason.ConsciousGetNewCrystal, 0, costResource);
        this.AddResource(P.EResourceChangeReason.ConsciousGetNewCrystal, 0, new P.STResource({
            type: P.EResourceType.ConsciousCrystal,
            id: target,
            count: 1
        }));
        return { ret: ServerUtils_1.ServerUtils.MakeRet(true), resChg: Util_1.U.DeepCopy(ModelPlayer.Instance.GetChangePack()) };
    }
    GetNewConsciousCrystal() {
        let costResource = new P.STResource({
            type: P.EResourceType.ConsciousCrystalFrag,
            id: Misc_1.Misc.consciousMisc.fragInfo.fragId,
            count: Misc_1.Misc.consciousMisc.fragInfo.cystalCostNum
        });
        if (!this.EnoughResource(costResource)) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.PlayerResourceNotEnough, "res not enough") };
        }
        let idSet = new Set();
        XlsxUtils_1.XlsxUtils.ConsciousCrystalPoolById.get(Misc_1.Misc.consciousMisc.fragInfo.poolId).forEach((val) => {
            if (!(val in this.consciousCrystalPack.dict))
                idSet.add(val);
        });
        let randomList = Array.from(idSet.keys());
        if (randomList.length == 0) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.NoMoreConsciousCrystal, "no more crystal") };
        }
        this.CostResource(P.EResourceChangeReason.ConsciousGetNewCrystal, 0, costResource);
        let result = Util_1.U.RandomChoice(randomList);
        this.AddResource(P.EResourceChangeReason.ConsciousGetNewCrystal, 0, new P.STResource({
            type: P.EResourceType.ConsciousCrystal,
            id: result,
            count: 1
        }));
        return { ret: ServerUtils_1.ServerUtils.MakeRet(true), resChg: Util_1.U.DeepCopy(ModelPlayer.Instance.GetChangePack()) };
    }
    ConsciousCrystalLevelUp(consciousCrystalId, level) {
        let crystal = this.consciousCrystalPack.dict[consciousCrystalId];
        if (!crystal) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `no consciousCrystal ${consciousCrystalId}`) };
        }
        if (level != crystal.level + 1) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `current level:${crystal.level}, param:${level}`) };
        }
        let conf = Xlsx_1.Xlsx.ConsciousCrystalConf.Get(consciousCrystalId, level);
        if (!conf) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, "res not found") };
        }
        let currentConf = Xlsx_1.Xlsx.ConsciousCrystalConf.Get(consciousCrystalId, crystal.level);
        if (!this.EnoughResource(...currentConf.cost)) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.PlayerResourceNotEnough, "res not enough") };
        }
        this.CostResource(P.EResourceChangeReason.ConsciousCrystalLevelUp, 0, ...currentConf.cost);
        crystal.level += 1;
        this.MakeChange(new P.STResource({ type: P.EResourceType.ConsciousCrystal, id: crystal.id, count: 1 }), 0, new P.STResourcePayload({ consciousCrystal: crystal }));
        return { ret: ServerUtils_1.ServerUtils.MakeRet(true), resChg: Util_1.U.DeepCopy(ModelPlayer.Instance.GetChangePack()) };
    }
    ConsciousCrystalVisit(consciousCrystalId) {
        let crystal = this.consciousCrystalPack.dict[consciousCrystalId];
        if (!crystal) {
            return { ret: ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `no consciousCrystal ${consciousCrystalId}`) };
        }
        crystal.new = false;
        this.MakeChange(new P.STResource({ type: P.EResourceType.ConsciousCrystal, id: crystal.id, count: 1 }), 0, new P.STResourcePayload({ consciousCrystal: crystal }));
        return { ret: ServerUtils_1.ServerUtils.MakeRet(true), resChg: Util_1.U.DeepCopy(ModelPlayer.Instance.GetChangePack()) };
    }
    ModifyCrystalSlot(slotMap) {
        let equipSlotCount = 0;
        for (let key in slotMap) {
            let conf = Xlsx_1.Xlsx.ConsciousCrystalSlotConf.Get(parseInt(key));
            if (!conf) {
                return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ResNotFound, "res not found");
            }
            if (slotMap[key] != 0) {
                if (conf.unlockLevel > this.consciousInfo.level) {
                    return ServerUtils_1.ServerUtils.MakeRet(false, P.EErrorCode.ClientParamInvalid, `${key} slot not unlock`);
                }
                equipSlotCount++;
            }
        }
        this.consciousInfo.slotCrystalMap = slotMap;
        Task_1.TaskUtil.CheckTask(P.ETaskScope.Achievement, P.ETaskType.EquipP0ConsciousCrystal, 1, equipSlotCount);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    GetConsciousLevelAttr() {
        if (!Tutorial_1.ModelTutorial.Instance.IsConsciousOpen())
            return [];
        let ret = new Array();
        let conf = Xlsx_1.Xlsx.ConsciousLevelConf.Get(this.consciousInfo.level);
        ret.push(...Util_1.U.DeepCopy(conf.attr));
        return ret;
    }
    GetConsciousCrystalEffects() {
        let effects = new Array();
        for (let slotId in this.consciousInfo.slotCrystalMap) {
            let crystalId = this.consciousInfo.slotCrystalMap[slotId];
            if (crystalId != 0) {
                if (crystalId in this.consciousCrystalPack.dict) {
                    let crystal = this.consciousCrystalPack.dict[crystalId];
                    let conf = Xlsx_1.Xlsx.ConsciousCrystalConf.Get(crystal.id, crystal.level);
                    if (conf)
                        effects.push(...conf.effects);
                }
            }
        }
        return effects;
    }
    GetConsciousCrystalScore() {
        let score = 0;
        for (let slotId in this.consciousInfo.slotCrystalMap) {
            let crystalId = this.consciousInfo.slotCrystalMap[slotId];
            if (crystalId != 0) {
                if (crystalId in this.consciousCrystalPack.dict) {
                    let crystal = this.consciousCrystalPack.dict[crystalId];
                    let conf = Xlsx_1.Xlsx.ConsciousCrystalConf.Get(crystal.id, crystal.level);
                    if (conf)
                        score += conf.score;
                }
            }
        }
        return score;
    }
    GetConsciousLevel() {
        return this.consciousInfo.level;
    }
    GetConsciousCrystalCount() {
        let count = 0;
        for (let crystalId in this.consciousCrystalPack.dict) {
            let crystal = this.consciousCrystalPack.dict[crystalId];
            let conf = Xlsx_1.Xlsx.ConsciousCrystalConf.Get(crystal.id, crystal.level);
            if (conf)
                count++;
        }
        return count;
    }
    SetAssistModeStatus(on) {
        this.baseInfo.isAssistModeOn = on;
    }
    SetAssistModeLevel(levelMap) {
        this.baseInfo.assistLevelMap = levelMap;
    }
    GetAssistModeStatus() {
        return this.baseInfo.isAssistModeOn;
    }
    GetAssistModeLevel() {
        return this.baseInfo.assistLevelMap;
    }
    GetDynamicScaleStatus() {
        return this.baseInfo.dynamicScaleOff;
    }
    TurnOffDynamicScale() {
        this.baseInfo.dynamicScaleOff = true;
        this.baseInfo.loseRound = 0;
    }
    ScaleAssistMode() {
        this.baseInfo.loseRound++;
        if (this.baseInfo.loseRound >= Misc_1.Misc.breedDungeonMisc.babyScaleLoseCount) {
            let successModify = false;
            Xlsx_1.Xlsx.AssistLevelBaseConf.All.forEach((conf) => {
                if (conf.maxLevel > 3) {
                    if (this.baseInfo.assistLevelMap[conf.id] < conf.maxLevel) {
                        this.baseInfo.assistLevelMap[conf.id]++;
                        successModify = true;
                    }
                }
            });
            if (!successModify) {
                Xlsx_1.Xlsx.AssistLevelBaseConf.All.forEach((conf) => {
                    if (conf.maxLevel == 3) {
                        this.baseInfo.assistLevelMap[conf.id] = 3;
                    }
                });
            }
            this.baseInfo.loseRound = 0;
            if (Xlsx_1.Xlsx.AssistLevelBaseConf.All.every((conf) => this.baseInfo.assistLevelMap[conf.id] == conf.maxLevel)) {
                ModelPlayer.Instance.TurnOffDynamicScale();
            }
            return this.baseInfo.assistLevelMap;
        }
        return null;
    }
    UpdateDungeonActorRecord(actorId, finish, useTime, maxCombo, maxContinousKill, score) {
        if (!(actorId in this.dungeonInfo.record.actorRecordMap)) {
            let actorRecord = new P.STBreedDungeonRecord.PlayRecord();
            this.dungeonInfo.record.actorRecordMap[actorId] = actorRecord;
        }
        let actorRecord = this.dungeonInfo.record.actorRecordMap[actorId];
        if (finish) {
            actorRecord.finishTimes++;
            if (useTime < (actorRecord.minUseTime == 0 ? Infinity : actorRecord.minUseTime))
                actorRecord.minUseTime = useTime;
        }
        actorRecord.tryTimes++;
        actorRecord.totalUseTime += useTime;
        if (maxCombo > actorRecord.maxCombo)
            actorRecord.maxCombo = maxCombo;
        if (maxContinousKill > actorRecord.maxContinousKill)
            actorRecord.maxContinousKill = maxContinousKill;
        if (score > actorRecord.maxScore)
            actorRecord.maxScore = score;
    }
    UpdateDungeonBossRecord(boss, perfect, useTime) {
        if (!(boss in this.dungeonInfo.record.bossRecordMap)) {
            let bossRecord = new P.STBreedDungeonRecord.BossRecord();
            this.dungeonInfo.record.bossRecordMap[boss] = bossRecord;
        }
        let bossRecord = this.dungeonInfo.record.bossRecordMap[boss];
        bossRecord.killTimes++;
        if (useTime < (bossRecord.minFinishTime == 0 ? Infinity : bossRecord.minFinishTime))
            bossRecord.minFinishTime = useTime;
        if (perfect) {
            bossRecord.perfectKillTimes++;
        }
    }
    GetPlayerRecord() {
        return {
            actorRecordMap: this.dungeonInfo.record.actorRecordMap,
            bossRecordMap: this.dungeonInfo.record.bossRecordMap,
            actorMaxHeatMap: this.heatRecord.actorMaxHeat
        };
    }
    CustomInherit(fromData, toData) {
        let allFesActor = toData?.fesActorPack?.dict;
        if (allFesActor) {
            for (let fesActorUid in allFesActor) {
                let fesActor = allFesActor[fesActorUid];
                if (fesActor.battleChallengeFinishCount > 0)
                    fesActor.battleChallengeFinishCount = 0;
            }
        }
        return true;
    }
    GetEaCostAcePoint() {
        let costAp = 0;
        let pack = this.data?.chipPack?.dict;
        if (!pack)
            return costAp;
        for (let chipId in pack) {
            let chip = pack[chipId];
            let conf = Xlsx_1.Xlsx.ChipUnlockConf.Get(chip.id);
            if (!conf)
                console.info("EaData", `chip ${chip.id} conf not exist`);
            for (let cost of conf.unlockCost) {
                if (cost.type == P.EResourceType.Currency && cost.id == P.EResourceTypeCurrencyId.Coin) {
                    costAp += cost.count;
                }
            }
        }
        return costAp;
    }
    GetEaAcePoint() {
        return this.GetEaCostAcePoint() + this.GetCurrencyCount(P.EResourceTypeCurrencyId.Coin);
    }
    GetEaPrototypeAnalyzer() {
        return this.GetOwnBaseActorCount() + this.GetItemCount(ModelPlayer.PrototypeAnalyzerId);
    }
    AddEaResource(acePoint, prototypeAnalyzer) {
        this.AddResource(P.EResourceChangeReason.InheritEaData, 0, P.STResource.create({
            type: P.EResourceType.Currency,
            id: P.EResourceTypeCurrencyId.Coin,
            count: acePoint,
        }), P.STResource.create({
            type: P.EResourceType.Item,
            id: ModelPlayer.PrototypeAnalyzerId,
            count: prototypeAnalyzer,
        }));
        this.ResetResourceChangeList();
    }
    refreshShopEffect(goodsType) {
        let shopStatus = this.extraState.shopStatus;
        let goodIds = Xlsx_1.Xlsx.Shop.All.filter((conf) => conf.goodsType == goodsType).map((val) => val.id);
        let effectPool;
        switch (goodsType) {
            case P.EPVEShopGoodsType.Buff:
                effectPool = XlsxUtils_1.XlsxUtils.BreedDungeonSanBuffRandomPool.get(2);
                break;
            case P.EPVEShopGoodsType.Debuff:
                effectPool = XlsxUtils_1.XlsxUtils.BreedDungeonSanBuffRandomPool.get(1);
                break;
        }
        effectPool = effectPool.filter((r) => {
            let bufflevel = 0;
            let maxlevel = XlsxUtils_1.XlsxUtils.BreedDungeonSanBuffMaxLevel.get(r.buffId);
            return (bufflevel < maxlevel);
        });
        let activeGoodIds = new Array();
        let activeEffects = new Array();
        let inactiveGoodIds = new Array();
        goodIds.forEach((val) => {
            if (shopStatus.status[val]) {
                activeGoodIds.push(val);
                activeEffects.push(shopStatus.goodEffectMap[val]);
            }
            else {
                inactiveGoodIds.push(val);
            }
        });
        let newEffectPool = effectPool.filter((conf) => !activeEffects.includes(conf.buffId));
        Util_1.U.RandomSample(newEffectPool, inactiveGoodIds.length).forEach((val, index) => shopStatus.goodEffectMap[inactiveGoodIds[index]] = val.buffId);
    }
    RefreshShopBuff() {
        this.refreshShopEffect(P.EPVEShopGoodsType.Buff);
        this.refreshShopEffect(P.EPVEShopGoodsType.Debuff);
    }
    ClearShopBuffStatus() {
        this.extraState.shopStatus.status = {};
        this.RefreshShopBuff();
    }
    GetShopStatus() {
        return this.extraState.shopStatus;
    }
    getShopActiveEffect(type) {
        let shopStatus = this.extraState.shopStatus;
        let goodIds = Xlsx_1.Xlsx.Shop.All.filter((conf) => conf.goodsType == type).map((val) => val.id);
        let activeEffects = new Array();
        goodIds.forEach((val) => {
            if (shopStatus.status[val])
                activeEffects.push(shopStatus.goodEffectMap[val]);
        });
        return activeEffects;
    }
    GetShopActiveBuff() {
        return this.getShopActiveEffect(P.EPVEShopGoodsType.Buff);
    }
    GetShopActiveDebuff() {
        return this.getShopActiveEffect(P.EPVEShopGoodsType.Debuff);
    }
}
exports.ModelPlayer = ModelPlayer;
//# sourceMappingURL=Player.js.map