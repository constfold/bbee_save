"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelExploreDungeon = void 0;
const DataSave_1 = require("../../Core/DataSave");
const Util_1 = require("../../Core/Util");
const pbdef_1 = require("../../Gen/pbdef");
// const Xlsx_1 = require("../../Gen/Xlsx");
// const ServerUtils_1 = require("../../Server/ServerUtils");
const Player_1 = require("./Player");
const PlotDialogue_1 = require("./PlotDialogue");
const BreedDungeon_1 = require("./BreedDungeon");
// const Actor_1 = require("../../Server/Module/Actor");
// const Bless_1 = require("../../Server/Module/Bless");
// const csharp_1 = require("csharp");
// const Misc_1 = require("../../Misc");
// const Potential_1 = require("../../Server/Module/Potential");
// const Buff_1 = require("../../Server/Module/Buff");
// const Dungeon_1 = require("../../Server/Module/Dungeon");
// const Task_1 = require("../../Server/Module/Task");
// const XlsxUtils_1 = require("../../Server/Module/XlsxUtils");
const Task_2 = require("./Task");
// const Common_1 = require("../../Server/Module/Common");
// const Quest_1 = require("../../Server/Module/Quest");
class ModelExploreDungeon extends DataSave_1.DataSaveCore.DataSaveWrapper {
    _blessRandomGenerator;
    _potentialRandomGenerator;
    constructor() {
        let t = pbdef_1.STExploreDungeon.create();
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
    Reset() {
        this.data = pbdef_1.STExploreDungeon.create();
        this.data.playerId = this.saveId;
        this._blessRandomGenerator = null;
        this._potentialRandomGenerator = null;
    }
    get potentialRandomGenerator() {
        if (!this._potentialRandomGenerator) {
            this._potentialRandomGenerator = new Potential_1.PotentialUtils.OrderPotentialRandomGenerator(this.FesActor.id, this.FesActor.potentials);
        }
        return this._potentialRandomGenerator;
    }
    get blessRandomGenerator() {
        if (!this._blessRandomGenerator) {
            this._blessRandomGenerator = new Bless_1.BlessUtils.FactionBlessRandomGenerator(this.FesActor.blesses, this.breedInfo.factorActors.length > 0, true);
        }
        return this._blessRandomGenerator;
    }
    generateDungeonInfo(modeConf, mapId) {
        this.data.worldMapId = mapId;
        this.data.finalBossFinished = false;
        this.data.mode = modeConf.mode;
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    initializeShopGoods() {
        let modeConf = Xlsx_1.Xlsx.ExploreDungeonModeConf.Get(this.mode);
        if (!modeConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, "mode not found");
        }
        for (let shopGoodsInfo of modeConf.shopGoodsInfo) {
            let shopPoolConfs = Xlsx_1.Xlsx.ExploreDungeonShopGoodsConf.All.
                filter((v) => (v.mode == this.mode) && (v.shopId == shopGoodsInfo.shopId));
            if (!shopPoolConfs || shopPoolConfs.length <= 0) {
                return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `shop goods not found`);
            }
            for (let i = 0; i < shopPoolConfs.length; i++) {
                let shopPoolConf = shopPoolConfs[i];
                let rewardResList = [];
                for (let rew of shopPoolConf.reward) {
                    let rewardRes = this.randomResFromRewardGroup(rew);
                    if (rewardRes) {
                        if (rewardRes.reward.type == pbdef_1.EExploreDungeonResourceType.BlessPoint) {
                            if (this.blessRandomGenerator.GetBlessFactionCanRandom().length == 0) {
                                continue;
                            }
                        }
                        rewardResList.push(rewardRes.reward);
                    }
                    let heatShopPriceUp = this.functions(pbdef_1.EBreedDungeonFunction.ShopPriceModify);
                    let addPercent = 0;
                    heatShopPriceUp.forEach((conf) => addPercent += conf.shopPriceModify.rate);
                    let newShopGoodsInfo = pbdef_1.STExploreDungeon.ShopGoodsInfo.create({
                        reward: Util_1.U.DeepCopy(rewardResList),
                        rewardId: rewardRes.id,
                        cost: Util_1.U.DeepCopy(shopPoolConf.cost),
                        index: shopPoolConf.index,
                        buyCount: 0,
                        unlockType: shopPoolConf.unlockType,
                        unlockParams: Util_1.U.DeepCopy(shopPoolConf.unlockParams),
                        shopId: shopPoolConf.shopId,
                    });
                    for (let i = 0; i < newShopGoodsInfo.cost.length; i++) {
                        newShopGoodsInfo.cost[i].count = Math.round(newShopGoodsInfo.cost[i].count * (1 + addPercent / 10000));
                    }
                    this.data.shopGoods.push(newShopGoodsInfo);
                }
            }
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    initializeBonus() {
        let modeConf = Xlsx_1.Xlsx.ExploreDungeonModeConf.Get(this.mode);
        if (!modeConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, "mode not found");
        }
        for (let i = 1; i <= modeConf.bonusCount; i++) {
            let bonusConfPool = Xlsx_1.Xlsx.ExploreDungeonBonusConf.All.filter((v) => v.mode == this.mode && v.index == i);
            if (!bonusConfPool) {
                return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `bonusConf not found`);
            }
            let bonusConf = Util_1.U.RandomChoice(bonusConfPool);
            if (!bonusConf) {
                return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `bonus not found`);
            }
            let rewardResList = [];
            for (let rew of bonusConf.reward) {
                let rewardRes = this.randomResFromRewardGroup(rew);
                if (rewardRes)
                    rewardResList.push(rewardRes.reward);
            }
            this.data.bonuses.push(pbdef_1.STExploreDungeon.BonusInfo.create({
                rewardOrder: i,
                reward: Util_1.U.DeepCopy(rewardResList),
                bought: false,
            }));
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    unfinished() {
        return (!this.data.finalBossFinished && (this.mode != 0));
    }
    get buffInfo() {
        if (!this.data.buffInfo) {
            this.data.buffInfo = new pbdef_1.STExploreDungeon.BuffInfo;
        }
        return this.data.buffInfo;
    }
    get rewardInfo() {
        if (!this.data.rewardInfo) {
            this.data.rewardInfo = new pbdef_1.STExploreDungeon.RewardInfo({
                potentialRefreshRecord: []
            });
        }
        return this.data.rewardInfo;
    }
    get activeInfo() {
        if (!this.data.activeInfo) {
            this.data.activeInfo = new pbdef_1.DungeonActiveInfo;
        }
        return this.data.activeInfo;
    }
    gambleRecord(roomId) {
        let record = this.data.gambles.find((r) => r.gambleRoomId == roomId);
        if (!record) {
            record = pbdef_1.STExploreDungeon.GambleInfo.create({
                gambleRoomId: roomId,
                gambleTimes: 0
            });
            this.data.gambles.push(record);
        }
        return record;
    }
    get breedInfo() {
        if (!this.data.breedInfo) {
            this.data.breedInfo = new pbdef_1.STExploreDungeon.BreedInfo;
        }
        return this.data.breedInfo;
    }
    get FesActor() {
        return this.data.fesActor;
    }
    get mode() {
        return this.data.mode;
    }
    functions(funcType) {
        let ret = [];
        this.buffInfo.functions.forEach((r) => {
            let conf = Xlsx_1.Xlsx.BreedDungeonFunctionConf.Get(r, 1);
            if (!conf) {
                return;
            }
            if (conf.type == funcType) {
                ret.push(conf);
            }
        });
        return ret;
    }
    ResourceCount(type) {
        let res = this.data.resources.find((r) => r.type == type);
        if (!res) {
            return 0;
        }
        return res.count;
    }
    resEnough(...cost) {
        return cost.every((v) => {
            let res = this.data.resources.find((r) => r.type == v.type);
            if (!res) {
                return false;
            }
            return res.count >= v.count;
        });
    }
    costResource(...cost) {
        cost.forEach((v) => {
            let res = this.data.resources.find((r) => r.type == v.type);
            if (!res) {
                return;
            }
            res.count -= v.count;
            if (v.type == pbdef_1.EExploreDungeonResourceType.DataPoint && v.count > 0) {
                Quest_1.QuestUtil.CheckTarget(pbdef_1.EQuestTargetType.CostMexchangePoint, v.count);
            }
        });
    }
    addResource(...adds) {
        adds.forEach((v) => {
            let res = this.data.resources.find((r) => r.type == v.type);
            if (!res) {
                this.data.resources.push(pbdef_1.ExploreDungeonResource.create(v));
            }
            else {
                res.count += v.count;
            }
        });
    }
    selectBless(blessIndex, source) {
        let stageRewards = this.rewardInfo.selectRewards;
        let reward = stageRewards.rewards[blessIndex];
        let bless = Bless_1.BlessUtils.SkillToBless(reward.skill);
        if (source != pbdef_1.EBreedDungeonBlessSource.None) {
            bless.source = source;
        }
        this.costResource(new pbdef_1.ExploreDungeonResource({ type: pbdef_1.EExploreDungeonResourceType.QualityPoint, count: reward.skill.quality - reward.skill.oldQuality }));
        this.blessRandomGenerator.UpdateBless(bless);
        Actor_1.FesActorUtils.AddBless(this.FesActor, bless);
        if (reward.replaceSkill) {
            Actor_1.FesActorUtils.DelBless(this.FesActor, Bless_1.BlessUtils.SkillToBless(reward.replaceSkill));
        }
        if (reward.inheritBless.length > 0) {
            for (let b of reward.inheritBless) {
                Actor_1.FesActorUtils.AddBless(this.FesActor, b);
                this.blessRandomGenerator.UpdateBless(b);
            }
        }
        this.rewardInfo.selectRewards = pbdef_1.STBreedDungeonStageSelectRewards.create();
        if (!this.rewardInfo.selectedBlesses.includes(bless.id)) {
            this.rewardInfo.selectedBlesses.push(bless.id);
            Dungeon_1.DungeonUtils.CheckBlessSeriesAch(this.rewardInfo.selectedBlesses);
        }
        console.info("Random", `current bless count ${this.rewardInfo.selectedBlesses.length}`);
        Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.SelectMbless, 1);
        Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Task, pbdef_1.ETaskType.SelectMdiffrentBless, 1, bless.id);
        Quest_1.QuestUtil.CheckTarget(pbdef_1.EQuestTargetType.SelectMdiffrentBless, 1, bless.id);
    }
    selectPotential(potentialIndex) {
        let rewardInfo = this.rewardInfo.selectRewards;
        if (potentialIndex >= rewardInfo.rewards.length) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ClientParamInvalid, "select potential index invalid");
        }
        this.rewardInfo.potentialRefreshRecord = [];
        let potential = Potential_1.PotentialUtils.SkillToPotential(rewardInfo.rewards[potentialIndex].skill);
        Actor_1.FesActorUtils.AddPotential(this.FesActor, potential);
        this.potentialRandomGenerator.UpdatePotential(potential);
        this.rewardInfo.selectRewards = pbdef_1.STBreedDungeonStageSelectRewards.create();
        if (!this.rewardInfo.selectedPotential.includes(potential.id)) {
            this.rewardInfo.selectedPotential.push(potential.id);
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.GetMdiffrentPotentials, 1);
        }
        console.info("Random", `current potential count ${this.rewardInfo.selectedPotential.length}`);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    getInheritBless() {
        return this.rewardInfo.inheritBless.filter((bless) => {
            return !(this.FesActor.blesses.find((b) => (b.id == bless.id)));
        });
    }
    get Initialized() {
        return this.breedInfo.breedDungeonId != 0;
    }
    ExploreDungeonEnter(req, res) {
        if (this.unfinished()) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ExploreDungeonUnfinished, "discovery dungeon unfinished");
        }
        this.Reset();
        let inherit = BreedDungeon_1.ModelBreedDungeon.Instance.InheritBreedDungeon();
        if (!inherit) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ExploreDungeonBreedNotFinish, `breed dungeon not finish`);
        }
        let modeConf = Xlsx_1.Xlsx.ExploreDungeonModeConf.Get(inherit.mode);
        if (!modeConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, "mode not found");
        }
        let fesActor = inherit.fesActor;
        if (!fesActor) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.FesActorUidNotFound, `fes actor not found`);
        }
        this.breedInfo.breedDungeonId = BreedDungeon_1.ModelBreedDungeon.Instance.Id;
        this.data.fesActor = Util_1.U.DeepCopy(fesActor);
        this.breedInfo.heat = inherit.heat;
        this.buffInfo.sanBuffsRound.push(...inherit.sanbuff);
        this.buffInfo.sanDebuffsRound.push(...inherit.sanDebuff);
        this.buffInfo.eventBuffsRound.push(...inherit.eventBuff);
        this.breedInfo.chaosEventInfo.push(...inherit.chaosEventInfo);
        this.breedInfo.breedRealUseTime = inherit.breedRealUseTime;
        let inheritResources = Util_1.U.MergeResources(...inherit.resources);
        inheritResources.forEach((v) => {
            this.data.resources.push(pbdef_1.ExploreDungeonResource.create({
                type: pbdef_1.EExploreDungeonResourceType.PlayerResource,
                resource: v,
            }));
        });
        let coin = inherit.res[pbdef_1.EBreedDungeonResType.Coin] ?? 0;
        let hashrate = inherit.res[pbdef_1.EBreedDungeonResType.Hashrate] ?? 0;
        let qualityPoint = inherit.res[pbdef_1.EBreedDungeonResType.QualityPoint] ?? 0;
        let totalCoin = inherit.res[pbdef_1.EBreedDungeonResType.TotalCoin] ?? 0;
        this.data.resources.push(pbdef_1.ExploreDungeonResource.create({
            type: pbdef_1.EExploreDungeonResourceType.Hashrate,
            count: hashrate,
        }));
        this.data.resources.push(pbdef_1.ExploreDungeonResource.create({
            type: pbdef_1.EExploreDungeonResourceType.DataPoint,
            count: coin,
        }));
        this.data.resources.push(new pbdef_1.ExploreDungeonResource({
            type: pbdef_1.EExploreDungeonResourceType.QualityPoint,
            count: qualityPoint
        }));
        this.data.resources.push(new pbdef_1.ExploreDungeonResource({
            type: pbdef_1.EExploreDungeonResourceType.TotalDataPoint,
            count: totalCoin
        }));
        this.rewardInfo.inheritBless.push(...inherit.inheritBlesses);
        this.rewardInfo.potentialSkipCount = inherit.potentialSkipCount;
        this.rewardInfo.blessSelectRefreshCount = inherit.blessRefreshTime;
        this.rewardInfo.blessSelectRefreshCost = inherit.blessRefreshCost;
        this.rewardInfo.blessSelectCost = inherit.blessSelectCost;
        this.rewardInfo.blessSelectCount = inherit.blessSelectCount;
        this.rewardInfo.blessCanRefreshCount = inherit.blessRefreshLeftTime;
        this.rewardInfo.selectedBlesses = inherit.selectedBlesses;
        this.rewardInfo.selectedPotential = inherit.selectedPotentials;
        this.rewardInfo.unlockBlessItems = inherit.blessUnlockItems;
        this.rewardInfo.heatRewardMap = inherit.heatRewardMap;
        this.rewardInfo.potentialCanRefreshCount = inherit.potentialCanRefreshCount;
        this.buffInfo.functions = inherit.functions;
        let ret = this.generateDungeonInfo(modeConf, req.worldMapId);
        if (!ret.success) {
            return ret;
        }
        ret = this.initializeShopGoods();
        if (!ret.success) {
            return ret;
        }
        ret = this.initializeBonus();
        if (!ret.success) {
            return ret;
        }
        this.functions(pbdef_1.EBreedDungeonFunction.Trigger).forEach((v) => {
            this.buffInfo.envTriggers.push(...Util_1.U.DeepCopy(v.trigger.envTrigger));
            this.buffInfo.triggers.push(...Util_1.U.DeepCopy(v.trigger.triggers));
        });
        this.functions(pbdef_1.EBreedDungeonFunction.ModeTrigger).forEach((v) => {
            this.buffInfo.modeEnvTriggers.push(...Util_1.U.DeepCopy(v.trigger.envTrigger));
            this.buffInfo.modeTriggers.push(...Util_1.U.DeepCopy(v.trigger.triggers));
        });
        if (this.breedInfo.heat > 0 && Misc_1.Misc.heatMisc.bossEnhanceTrigger != 0) {
            this.buffInfo.modeEnvTriggers.push(new pbdef_1.STMonsterEnvTrigger({
                id: Misc_1.Misc.heatMisc.bossEnhanceTrigger,
                level: this.breedInfo.heat,
                whiteTags: "Boss"
            }));
        }
        let addNewSanDebuff = this.functions(pbdef_1.EBreedDungeonFunction.NewPhaseSanDebuff);
        addNewSanDebuff.forEach((r) => {
            Dungeon_1.DungeonUtils.AddNewSanBuffDirect(this, r.newPhaseSanDebuff.pool, !r.newPhaseSanDebuff.isBuff);
        });
        this.breedInfo.breedTime = inherit.totalTime;
        this.breedInfo.factorActors = inherit.factorActorUid;
        this.breedInfo.shopCostTotal = inherit.shopCostTotal;
        this.breedInfo.gambleTimes = inherit.gambleTimes;
        this.breedInfo.taskCheckProgress = inherit.taskProgress;
        this.breedInfo.bossKilled = inherit.bossKilled;
        this.breedInfo.usedAttrToResDevices = inherit.usedAttrToResDevices;
        this.breedInfo.perfectFinishRoomCount = inherit.perfectFinishRoomCount;
        this.buffInfo.blessUseCount = Util_1.U.DeepCopy(inherit.blessUseCount);
        this.activeInfo.continuousPerfectKillMax = inherit.continuousPerfectKillMax;
        this.activeInfo.continuousPerfectKillCur = inherit.continuousPerfectKillCur;
        this.activeInfo.bossPerfectKill = inherit.bossPerfectKill;
        this.data.beginTimestamp = Number(csharp_1.NOAH.GameTime.utc);
        Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
        res.exploreDungeonInfo = this.Copy();
        res.resChange = Player_1.ModelPlayer.Instance.GetChangePack();
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    GetInheritBless(req, res) {
        this.data.result = req.win ? pbdef_1.EExploreDungeonResult.Win : pbdef_1.EExploreDungeonResult.Lost;
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
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.BreedNoEnoughInheritBless, `index ${req.selectIndex} >= randomlist length ${this.FesActor.inheritBlessRandomList.length}`);
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
    ExploreDungeonBalance(req, res) {
        Player_1.ModelPlayer.Instance.UpdatePotentialBlessRecord(this.FesActor.blesses, this.rewardInfo.selectedPotential, this.FesActor.id);
        if (req.manualQuit) {
            Player_1.ModelPlayer.Instance.ClearShopBuffStatus();
            BreedDungeon_1.ModelBreedDungeon.Instance.Clear();
            this.Reset();
            Quest_1.QuestUtil.CheckResetProgress();
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        for (let resource of this.data.resources) {
            switch (resource.type) {
                case pbdef_1.EExploreDungeonResourceType.PlayerResource:
                    Player_1.ModelPlayer.Instance.AddResource(pbdef_1.EResourceChangeReason.ExploreDungeonBalance, this.mode, resource.resource);
                    break;
                default:
                    break;
            }
        }
        let phase = XlsxUtils_1.XlsxUtils.BreedDungeomMaxPhase.get(this.breedInfo.breedDungeonId);
        if (req.finish) {
            phase++;
            this.data.finalBossFinished = true;
            let modeConf = Xlsx_1.Xlsx.ExploreDungeonModeConf.Get(this.mode);
            if (modeConf) {
                Player_1.ModelPlayer.Instance.AddResource(pbdef_1.EResourceChangeReason.ExploreDungeonBalance, this.mode, ...modeConf.rewards);
            }
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.ClearP0ModeLtP1SecondMtimes, 1, this.mode, this.breedInfo.breedTime + this.data.battleTime);
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.ClearP0ModeMtimes, 1, this.mode);
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishBreedDungeonWithP0FesActorMtimes, 1, this.breedInfo.factorActors.length);
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishPhaseWithGtP0SanBuffMtimes, 1, this.buffInfo.sanDebuffsRound.length);
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishBreedMtimesCostLeP0Coin, 1, this.breedInfo.shopCostTotal + this.rewardInfo.shopCostCount);
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishBreedMtimesWithGeP0Potentials, 1, this.FesActor.potentials.length);
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishPhaseLeP1DamageMtimes, 1, this.data.activeInfo?.damageTaken ?? 0);
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishBreedP0PhaseGeP1Heat, 1, phase, this.breedInfo.heat);
            Quest_1.QuestUtil.CheckTarget(pbdef_1.EQuestTargetType.FinishExploreMtimes, 1);
        }
        Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishBreedLeftGeP0CoinsMtimes, 1, this.ResourceCount(pbdef_1.EExploreDungeonResourceType.DataPoint));
        Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.FinishBreedDungeonWithGeP0TimesGambleMtimes, 1, this.breedInfo.gambleTimes);
        Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.BreedWithP0HeatPunishType, 1, Player_1.ModelPlayer.Instance.GetHeatPunishTypeCount());
        this.breedInfo.usedAttrToResDevices.forEach((id) => {
            let deviceConf = Xlsx_1.Xlsx.BreedDungeonDeviceConf.Get(id, 3);
            if (deviceConf) {
                if (deviceConf.attrs[0].value < 0) {
                    let baseAttrConf = Xlsx_1.Xlsx.BaseActorAttrConf.Get(this.FesActor.id);
                    let attr = baseAttrConf.attr.find((attr) => attr.type == csharp_1.EAttrType.MaxHp);
                    let currentMaxHp = Actor_1.FesActorUtils.GetFesActorAttrByType(this.FesActor, csharp_1.EAttrType.MaxHp);
                    let newMaxHp = currentMaxHp + attr.value * (-deviceConf.attrs[0].value);
                    Actor_1.FesActorUtils.SetFesActorAttrByType(this.FesActor, csharp_1.EAttrType.MaxHp, newMaxHp);
                }
            }
        });
        Actor_1.FesActorUtils.FesActorAttrBalance(this.FesActor);
        Player_1.ModelPlayer.Instance.UnLockFesActor(...this.data.rewardInfo.factorActorUid);
        this.data.fesActor.activeAttrs = [];
        Player_1.ModelPlayer.Instance.AddFesActor(this.data.fesActor);
        Player_1.ModelPlayer.Instance.MakeChange(pbdef_1.STResource.create({ type: pbdef_1.EResourceType.FesActor, id: this.data.fesActor.uid }), 0, pbdef_1.STResourcePayload.create({ fesActor: this.data.fesActor }));
        let ret = BreedDungeon_1.ModelBreedDungeon.Instance.BreedDungeonExploreBalance(req.finish);
        if (!ret.success) {
            return ret;
        }
        res.resChange = Player_1.ModelPlayer.Instance.GetChangePack();
        res.heatRewardRecord = this.rewardInfo.heatRewardMap;
        Player_1.ModelPlayer.Instance.SetActorHeatRewardRecord(this.FesActor.id, this.rewardInfo.heatRewardMap);
        Player_1.ModelPlayer.Instance.UpdateExploreDungeonInfo(req.finish, this.data.rooms.length);
        Task_2.ModelTask.Instance.CheckTaskStagnation(this.breedInfo.taskCheckProgress);
        res.heatLevel = Player_1.ModelPlayer.Instance.UpdateHeatLevel(phase, this.breedInfo.heat);
        Player_1.ModelPlayer.Instance.TurnOffDynamicScale();
        let current = Number(csharp_1.NOAH.GameTime.utc);
        let delta = current - this.data.beginTimestamp;
        if (delta < 0)
            delta = 0;
        this.data.realUseTime += delta;
        Player_1.ModelPlayer.Instance.UpdateDungeonActorRecord(this.FesActor.id, req.finish, this.data.realUseTime + this.breedInfo.breedRealUseTime, this.activeInfo.maxCombo, this.activeInfo.continuousPerfectKillMax, this.FesActor.score);
        let actorMaxHeat = Player_1.ModelPlayer.Instance.GetActorMaxHeat();
        if (this.FesActor.id in actorMaxHeat) {
            let maxHeat = actorMaxHeat[this.FesActor.id];
            if (this.breedInfo.heat > maxHeat) {
                actorMaxHeat[this.FesActor.id] = this.breedInfo.heat;
            }
        }
        else {
            actorMaxHeat[this.FesActor.id] = this.breedInfo.heat;
        }
        Player_1.ModelPlayer.Instance.SetActorMaxHeat(actorMaxHeat);
        res.actorMaxHeat = Util_1.U.DeepCopy(actorMaxHeat);
        this.Reset();
        this.data.finalBossFinished = true;
        PlotDialogue_1.ModelPlotDialogue.Instance.ResetCounterpartChatCount();
        Player_1.ModelPlayer.Instance.ClearShopBuffStatus();
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    checkExploreResourceEffect(action) {
        let toDelResources = [];
        for (let r of this.data.resources) {
            switch (r.type) {
                case pbdef_1.EExploreDungeonResourceType.BattleCountDown:
                    this.data.battleTime -= r.count;
                    toDelResources.push(r);
                    break;
                case pbdef_1.EExploreDungeonResourceType.RemoveSanDebuff:
                    while (r.count > 0) {
                        r.count--;
                        if (this.data.buffInfo.sanDebuffsRound.length > 0) {
                            let randomBuff = Util_1.U.RandomShuffle(this.data.buffInfo.sanDebuffsRound);
                            randomBuff.pop();
                            this.data.buffInfo.sanDebuffsRound = randomBuff;
                        }
                    }
                    toDelResources.push(r);
                    break;
                case pbdef_1.EExploreDungeonResourceType.SkipSanDebuffRound:
                    while (r.count > 0) {
                        r.count--;
                        Dungeon_1.DungeonUtils.UpdateSanBuffRound(this.buffInfo.sanDebuffsRound);
                    }
                    toDelResources.push(r);
                    break;
                case pbdef_1.EExploreDungeonResourceType.SanBuff:
                case pbdef_1.EExploreDungeonResourceType.SanDebuff:
                    let debuff = r.type == pbdef_1.EExploreDungeonResourceType.SanDebuff;
                    let buffsRound = debuff ? this.buffInfo.sanDebuffsRound : this.buffInfo.sanBuffsRound;
                    let direct = action != pbdef_1.EExploreDungeonUpdateAction.SanBuffUpdate;
                    while (r.count > 0) {
                        r.count--;
                        let newBuffList = [];
                        if (r.buffId) {
                            newBuffList.push(r.buffId);
                        }
                        else {
                            newBuffList = Dungeon_1.DungeonUtils.RandomNewSanBuffList(this.FesActor, buffsRound, debuff);
                        }
                        Dungeon_1.DungeonUtils.FlushPossibleSanBuff(this.mode, newBuffList, buffsRound, direct);
                    }
                    toDelResources.push(r);
                    break;
                case pbdef_1.EExploreDungeonResourceType.PlotFragment:
                    while (r.count > 0) {
                        r.count--;
                        let plotsDroped = [];
                        this.data.resources.filter((r) => r.type == pbdef_1.EExploreDungeonResourceType.PlayerResource).forEach((r) => {
                            if (r.resource.type == pbdef_1.EResourceType.PlotFragment) {
                                plotsDroped.push(r.resource);
                            }
                        });
                        let plots = Common_1.CommonUtils.DropPlotFragment(r.plotDropRule, plotsDroped);
                        plots.forEach((plot) => {
                            this.data.resources.push(pbdef_1.ExploreDungeonResource.create({
                                type: pbdef_1.EExploreDungeonResourceType.PlayerResource,
                                resource: Util_1.U.DeepCopy(plot)
                            }));
                        });
                    }
                    break;
                default:
                    break;
            }
        }
        Util_1.U.RemoveElement(this.data.resources, ...toDelResources);
    }
    shopCostTotal(shopGoods) {
        let totalCost = 0;
        shopGoods.forEach((r) => {
            let dataPointCost = r.cost.find((v) => v.type == pbdef_1.EExploreDungeonResourceType.DataPoint);
            totalCost += (r.buyCount * (dataPointCost?.count ?? 0));
        });
        return totalCost;
    }
    checkHeatReward(condition) {
        for (let i = 0; i < Xlsx_1.Xlsx.HeatRewardConf.All.length; i++) {
            let conf = Xlsx_1.Xlsx.HeatRewardConf.All[i];
            if (conf.sanMin > 999)
                continue;
            if (!(conf.level in this.rewardInfo.heatRewardMap.levelMap)) {
                this.rewardInfo.heatRewardMap.levelMap[conf.level] = new pbdef_1.RewardLevelConditionMap.ConditionMap({ condMap: {} });
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
    ExploreDungeonUpdate(req, res) {
        this.data.shopGoods = Util_1.U.DeepCopy(req.shopGoods);
        this.data.bonuses = Util_1.U.DeepCopy(req.bonuses);
        this.data.resources = Util_1.U.DeepCopy(req.resources);
        let beforeNormalBoss = this.data.rooms.filter((r) => r.RoomDetailType == pbdef_1.EExploreDungeonRoomDetailType.LittleBossSpawn && r.RoomRewardGained);
        let afterNormalBoss = req.rooms.filter((r) => r.RoomDetailType == pbdef_1.EExploreDungeonRoomDetailType.LittleBossSpawn && r.RoomRewardGained);
        if (afterNormalBoss.length > beforeNormalBoss.length) {
            let roomInfo = afterNormalBoss.find((a) => beforeNormalBoss.findIndex((b) => b.RoomId == a.RoomId) < 0);
            Player_1.ModelPlayer.Instance.UpdateDungeonBossRecord(roomInfo.ModelRes, req.activeInfo.damageTaken == this.activeInfo.damageTaken, roomInfo.ClearUseTime);
            let res = this.checkHeatReward(pbdef_1.EHeatRewardCondition.KillExploreNormalBoss);
            if (res) {
                this.data.resources.push(new pbdef_1.ExploreDungeonResource({
                    type: pbdef_1.EExploreDungeonResourceType.PlayerResource,
                    resource: res
                }));
            }
        }
        let beforeFinalBoss = this.data.rooms.filter((r) => r.RoomDetailType == pbdef_1.EExploreDungeonRoomDetailType.BigBossSpawn && r.RoomRewardGained);
        let afterFinalBoss = req.rooms.filter((r) => r.RoomDetailType == pbdef_1.EExploreDungeonRoomDetailType.BigBossSpawn && r.RoomRewardGained);
        if (afterFinalBoss.length > beforeFinalBoss.length) {
            let roomInfo = afterFinalBoss.find((a) => beforeFinalBoss.findIndex((b) => b.RoomId == a.RoomId) < 0);
            Player_1.ModelPlayer.Instance.UpdateDungeonBossRecord(roomInfo.ModelRes, req.activeInfo.damageTaken == this.activeInfo.damageTaken, roomInfo.ClearUseTime);
            let res = this.checkHeatReward(pbdef_1.EHeatRewardCondition.KillExploreFinalBoss);
            if (res) {
                this.data.resources.push(new pbdef_1.ExploreDungeonResource({
                    type: pbdef_1.EExploreDungeonResourceType.PlayerResource,
                    resource: res
                }));
            }
        }
        this.data.rooms = Util_1.U.DeepCopy(req.rooms);
        this.data.playerStatus = Util_1.U.DeepCopy(req.playerStatus);
        this.data.mapFog = Util_1.U.DeepCopy(req.mapFog);
        this.data.monsters = Util_1.U.DeepCopy(req.monsters);
        this.data.battleTime = req.battleTime;
        this.data.result = req.win;
        this.buffInfo.blessUseCount = Util_1.U.DeepCopy(req.blessUseCount);
        Actor_1.FesActorUtils.FillActiveAttrsWithReq(this.FesActor, ...req?.activeAttrs);
        Actor_1.FesActorUtils.AddAttr(this.FesActor, ...(req.addAttrs ?? []));
        this.checkExploreResourceEffect(req.action);
        Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
        let shopCostTotal = this.shopCostTotal(this.data.shopGoods);
        let deltaShopCostTotal = shopCostTotal - (this.rewardInfo?.shopCostCount ?? 0);
        this.rewardInfo.shopCostCount = shopCostTotal;
        if (deltaShopCostTotal > 0) {
            Task_1.TaskUtil.CheckTask(pbdef_1.ETaskScope.Achievement, pbdef_1.ETaskType.UseMmoneyInShopInBreed, deltaShopCostTotal);
            Quest_1.QuestUtil.CheckTarget(pbdef_1.EQuestTargetType.CostMexchangePoint, deltaShopCostTotal);
        }
        if (req.activeInfo)
            this.data.activeInfo = Util_1.U.DeepCopy(req.activeInfo);
        switch (req.action) {
            case pbdef_1.EExploreDungeonUpdateAction.SanBuffUpdate:
                Dungeon_1.DungeonUtils.UpdateSanBuffRound(this.buffInfo.sanDebuffsRound);
                Dungeon_1.DungeonUtils.UpdateSanBuffRound(this.buffInfo.sanBuffsRound);
                break;
            default:
                break;
        }
        this.data.isRewardFailed = false;
        for (let i = 0; i < this.data.resources.length; i++) {
            let res = this.data.resources[i];
            if (res.count > 0) {
                switch (res.type) {
                    case pbdef_1.EExploreDungeonResourceType.BlessPoint:
                        if (this.refreshBlessReward()) {
                            this.costResource(new pbdef_1.ExploreDungeonResource({ type: res.type, count: 1 }));
                        }
                        else {
                            this.data.isRewardFailed = true;
                        }
                        break;
                    case pbdef_1.EExploreDungeonResourceType.PotentialPoint:
                        if (this.refreshPotentialReward()) {
                            this.costResource(new pbdef_1.ExploreDungeonResource({ type: res.type, count: 1 }));
                        }
                        break;
                    case pbdef_1.EExploreDungeonResourceType.QualityPoint:
                        this.refreshBlessUpReward(0);
                        break;
                }
            }
        }
        let current = Number(csharp_1.NOAH.GameTime.utc);
        let delta = current - this.data.beginTimestamp;
        if (delta < 0)
            delta = 0;
        this.data.realUseTime += delta;
        this.data.beginTimestamp = current;
        res.exploreDungeonInfo = this.Copy();
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    refreshBlessReward(specifySeries = 0) {
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
            fillBlesses = Util_1.U.RandomSample(blessConfArr, 3 - result.length).map((b) => new pbdef_1.STBless({ id: b.id, quality: 1 }));
        }
        let ret = result.map((b) => new pbdef_1.STBreedDungeonStageReward({
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
        let fillRet = fillBlesses.map((b) => new pbdef_1.STBreedDungeonStageReward({
            skill: Bless_1.BlessUtils.BlessToSkill(b),
            lockType: this.blessRandomGenerator.GetLockReason(b.id),
        }));
        ret.push(...fillRet);
        let pointCount = this.ResourceCount(pbdef_1.EExploreDungeonResourceType.QualityPoint);
        ret.forEach((result) => {
            if (this.blessRandomGenerator.IsBlessCanUp(Bless_1.BlessUtils.SkillToBless(result.skill))) {
                result.skill.quality = result.skill.quality + pointCount > 4 ? 4 : result.skill.quality + pointCount;
            }
        });
        let blessLockCount = 0;
        let blessLockFuncs = this.functions(pbdef_1.EBreedDungeonFunction.BlessChoiceLock);
        if (blessLockFuncs.length > 0)
            blessLockCount = blessLockFuncs[0].choiceLock.count;
        if (result.length <= blessLockCount)
            blessLockCount = result.length - 1;
        for (let i = 0; i < blessLockCount; i++) {
            let index = ret.findIndex((r) => r.replaceSkill && r.lockType == pbdef_1.ERewardLockType.None);
            if (index >= 0) {
                ret[index].lockType = pbdef_1.ERewardLockType.Heat;
            }
            else {
                index = ret.findIndex((r) => r.lockType == pbdef_1.ERewardLockType.None);
                if (index >= 0)
                    ret[index].lockType = pbdef_1.ERewardLockType.Heat;
            }
        }
        ret = ret.sort((a, b) => (a.replaceSkill ? 1 : 0) - (b.replaceSkill ? 1 : 0));
        ret = ret.sort((a, b) => a.lockType - b.lockType);
        let count = 0;
        ret.forEach((val) => { if (val.lockType == pbdef_1.ERewardLockType.None)
            count++; });
        if (count == 1 && ret.length > 1) {
            let temp = ret[1];
            ret[1] = ret[0];
            ret[0] = temp;
        }
        let notSelectPointCount = Misc_1.Misc.breedDungeonMisc.blessNotSelectReward.find((r) => r.type == pbdef_1.EBreedDungeonResType.Coin)?.count ?? 0;
        let skipAddResFuncs = this.functions(pbdef_1.EBreedDungeonFunction.AddBlessSkipRes);
        skipAddResFuncs.forEach((func) => notSelectPointCount += func.skipBlessAdd.value);
        this.rewardInfo.selectRewards = new pbdef_1.STBreedDungeonStageSelectRewards({
            rewards: ret,
            rewardType: pbdef_1.EBreedDungeonStageSelectRewardType.PreferedBless,
            notSelectPointCount: notSelectPointCount
        });
        return true;
    }
    refreshPotentialReward(refresh = false) {
        let potentialResult = new Array();
        if (refresh) {
            let arr = this.rewardInfo.selectRewards.rewards.filter((val) => val.lockType == pbdef_1.ERewardLockType.None).map((r) => r.skill.id);
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
        let potentialRet = potentialResult.map((p) => new pbdef_1.STBreedDungeonStageReward({ skill: Potential_1.PotentialUtils.PotentialToSkill(p) }));
        let potentialLockCount = 0;
        let potentialLockFuncs = this.functions(pbdef_1.EBreedDungeonFunction.PotentialChoiceLock);
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
            potentialRet[i].lockType = pbdef_1.ERewardLockType.Heat;
        }
        potentialRet = potentialRet.sort((a, b) => a.lockType - b.lockType);
        let notSelectPointCount = Misc_1.Misc.breedDungeonMisc.potentialNotSelectReward.find((r) => r.type == pbdef_1.EBreedDungeonResType.Coin)?.count ?? 0;
        this.rewardInfo.selectRewards = new pbdef_1.STBreedDungeonStageSelectRewards({
            rewards: potentialRet,
            rewardType: pbdef_1.EBreedDungeonStageSelectRewardType.Potential,
            notSelectPointCount: notSelectPointCount
        });
        if (refresh)
            this.rewardInfo.potentialCanRefreshCount--;
        return true;
    }
    refreshBlessUpReward(pointCount) {
        this.addResource({ type: pbdef_1.EExploreDungeonResourceType.QualityPoint, count: pointCount });
        let upResult = this.blessRandomGenerator.RandomBlessCanUpdate(Misc_1.Misc.blessRandomMisc.blessUpgradeRandomCount);
        if (upResult.length == 0) {
            return false;
        }
        let ret = upResult.map((b) => new pbdef_1.STBreedDungeonStageReward({ skill: Bless_1.BlessUtils.BlessToSkill(b) }));
        let addPointCount = this.ResourceCount(pbdef_1.EExploreDungeonResourceType.QualityPoint);
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
                ret.push(new pbdef_1.STBreedDungeonStageReward({
                    skill: Bless_1.BlessUtils.BlessToSkill(val),
                    lockType: pbdef_1.ERewardLockType.MaxQuality
                }));
            });
        }
        let count = 0;
        ret.forEach((val) => { if (val.lockType == pbdef_1.ERewardLockType.None)
            count++; });
        if (count == 1 && ret.length > 1) {
            let temp = ret[1];
            ret[1] = ret[0];
            ret[0] = temp;
        }
        let notSelectPointCount = Misc_1.Misc.breedDungeonMisc.qualityNotSelectReward.find((r) => r.type == pbdef_1.EBreedDungeonResType.Coin)?.count ?? 0;
        this.rewardInfo.selectRewards = new pbdef_1.STBreedDungeonStageSelectRewards({
            rewards: ret,
            rewardType: pbdef_1.EBreedDungeonStageSelectRewardType.UpgradeBless,
            notSelectPointCount: notSelectPointCount * addPointCount
        });
        return true;
    }
    ExploreDungeonRefreshReward(res) {
        switch (this.rewardInfo.selectRewards.rewardType) {
            case pbdef_1.EBreedDungeonStageSelectRewardType.Potential:
                if (this.rewardInfo.potentialCanRefreshCount == 0) {
                    return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.PotentialRefreshCountLimit, "potential refresh limit");
                }
                this.refreshPotentialReward(true);
                res.stageSelectRewards = Util_1.U.DeepCopy(this.rewardInfo.selectRewards);
                res.canRefreshCount = this.rewardInfo.potentialCanRefreshCount;
                break;
            default:
                return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.NotSupport, "not support");
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    ExploreDungeonSelectReward(req, res) {
        if (req.selectIndex >= this.rewardInfo.selectRewards.rewards.length) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.BreedDungeonRewardIndexInvalid, "explore dungeon reward index invalid");
        }
        let rewardInfo = this.rewardInfo;
        if (rewardInfo.selectRewards.rewardType != pbdef_1.EBreedDungeonStageSelectRewardType.UpgradeBless) {
            if (!req.skip && rewardInfo.selectRewards.rewards[req.selectIndex].lockType != pbdef_1.ERewardLockType.None) {
                return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.BreedDungeonRewardIndexInvalid, "reward been lock");
            }
        }
        else {
            if (rewardInfo.selectRewards.rewards.every((r) => r.lockType != pbdef_1.ERewardLockType.None)) {
                this.rewardInfo.selectRewards = pbdef_1.STBreedDungeonStageSelectRewards.create();
                Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
                res.fesActor = Util_1.U.DeepCopy(this.FesActor);
                res.resources = Util_1.U.DeepCopy(this.data.resources);
                return ServerUtils_1.ServerUtils.MakeRet(true);
            }
        }
        if (req.skip) {
            this.addResource(new pbdef_1.ExploreDungeonResource({ type: pbdef_1.EExploreDungeonResourceType.DataPoint, count: rewardInfo.selectRewards.notSelectPointCount }));
            this.rewardInfo.selectRewards = pbdef_1.STBreedDungeonStageSelectRewards.create();
            Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
            res.fesActor = Util_1.U.DeepCopy(this.FesActor);
            res.selectRewards = Util_1.U.DeepCopy(this.data.rewardInfo.selectRewards);
            res.resources = Util_1.U.DeepCopy(this.data.resources);
            return ServerUtils_1.ServerUtils.MakeRet(true);
        }
        switch (rewardInfo.selectRewards.rewardType) {
            case pbdef_1.EBreedDungeonStageSelectRewardType.PreferedBless:
                this.selectBless(req.selectIndex, pbdef_1.EBreedDungeonBlessSource.Preferred);
                break;
            case pbdef_1.EBreedDungeonStageSelectRewardType.Potential:
                this.selectPotential(req.selectIndex);
                break;
            case pbdef_1.EBreedDungeonStageSelectRewardType.UpgradeBless:
                this.selectBless(req.selectIndex, pbdef_1.EBreedDungeonBlessSource.Preferred);
                break;
            default:
                break;
        }
        Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        res.selectRewards = Util_1.U.DeepCopy(this.data.rewardInfo.selectRewards);
        res.resources = Util_1.U.DeepCopy(this.data.resources);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    randomGambleEffect(gambleId) {
        let gambleConf = Xlsx_1.Xlsx.BreedDungeonGambleRandomConf.Get(gambleId);
        if (!gambleConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `gamble ${gambleId} conf not found`);
        }
        if (gambleConf.sanBuffPool != 0) {
            Dungeon_1.DungeonUtils.AddNewSanBuffDirectExplore(this, gambleConf.sanBuffPool);
        }
        if (gambleConf.recoveryType != csharp_1.EAttrType.None) {
            Actor_1.FesActorUtils.RecoverySpecifyAttr(this.FesActor, gambleConf.recoveryType, gambleConf.recoverValue, gambleConf.isRecoverRatio);
        }
        if (gambleConf.resDropPool != 0) {
            let dropId = Buff_1.BuffUtils.BreedDropRandomDirect(gambleConf.resDropPool, new Util_1.U.DefaultNumberMap());
            let resDropConf = Xlsx_1.Xlsx.BreedDungeonResDrop.Get(dropId);
            if (!resDropConf) {
                return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `res drop ${dropId} conf not found`);
            }
            for (let r of resDropConf.resDrop) {
                let expType = Dungeon_1.DungeonUtils.GetExploreResType(r.type);
                if (expType) {
                    this.addResource({ type: expType, count: r.count });
                }
            }
            resDropConf.playerResource.forEach((r) => {
                this.addResource({ type: pbdef_1.EExploreDungeonResourceType.PlayerResource, resource: pbdef_1.STResource.create(r) });
            });
        }
        if (gambleConf.attrs.length > 0) {
            Actor_1.FesActorUtils.AddAttr(this.FesActor, ...gambleConf.attrs);
        }
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    ExploreDungeonGamble(req, res) {
        let gambleConf = Xlsx_1.Xlsx.ExploreDungeonGambleConf.Get(this.mode, req.gambleRoomId);
        if (!gambleConf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound);
        }
        let gambleRecord = this.gambleRecord(req.gambleRoomId);
        let currentSelectCount = gambleRecord.gambleTimes;
        if (currentSelectCount >= gambleConf.selectCount) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ExploreDungeonGambleMax);
        }
        let cost = pbdef_1.ExploreDungeonResource.create({
            type: gambleConf.costType,
            count: gambleConf.costs[currentSelectCount],
        });
        gambleRecord.gambleTimes++;
        if (!this.resEnough(cost)) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.PlayerResourceNotEnough, `resource not enough`);
        }
        this.costResource(cost);
        let poolRewards = XlsxUtils_1.XlsxUtils.GetBreedInfiniteGamblePoolRewards(gambleConf.infiniteGamblePool);
        let weightPool = [];
        poolRewards.map((r) => {
            if (!gambleRecord.gambleRewarded.includes(r.gambleId)) {
                weightPool.push({ weight: r.weight, value: r.gambleId });
            }
        });
        let resultGamble = ServerUtils_1.ServerUtils.RandomWeighted(weightPool, true);
        if (!resultGamble) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResTableError, `cannot find index fomr pool ${gambleConf.infiniteGamblePool}`);
        }
        gambleRecord.gambleRewarded.push(resultGamble);
        let ret = this.randomGambleEffect(resultGamble);
        if (!ret.success) {
            return ret;
        }
        res.gambleResult = resultGamble;
        res.gambleInfo = Util_1.U.DeepCopy(this.data.gambles);
        res.resources = Util_1.U.DeepCopy(this.data.resources);
        Actor_1.FesActorUtils.CalcFesActorScoreNoAttrModify(this.FesActor);
        res.fesActor = Util_1.U.DeepCopy(this.FesActor);
        return ServerUtils_1.ServerUtils.MakeRet(true);
    }
    randomResFromRewardGroup(groupId) {
        let randFrom = Xlsx_1.Xlsx.ExploreDungeonRewardGroup.All.filter(f => f.groupId == groupId);
        let rand = Math.random() * 10000;
        let probAccumulated = 0;
        for (let rew of randFrom) {
            let curProb = rew.prob > 0 ? rew.prob : 10000;
            probAccumulated += curProb;
            if (probAccumulated >= rand) {
                return rew;
            }
        }
        return null;
    }
}
exports.ModelExploreDungeon = ModelExploreDungeon;
//# sourceMappingURL=ExploreDungeon.js.map