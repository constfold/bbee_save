"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.U = void 0;
// const csharp_1 = require("csharp");
const pbdef_1 = require("../Gen/pbdef");
// // const puerts_1 = require("puerts");
// const DataBinding_1 = require("../DataBinding");
// const TsGameGlobal_1 = require("../Manager/TsGameGlobal");
// const TsManager_1 = require("../Manager/TsManager");
// const CSharpDefine_1 = require("../CSharpDefine");
// const BattleJs_1 = require("../GamePlay/Battle/BattleJs");
// const PvpPlayerInfo_1 = require("../Window/Pvp/PvpPlayerInfo");
// const MathEx_1 = require("./MathEx");
// const TsCommunicationManager_1 = require("../Manager/TsCommunicationManager");
// const UIUtility = csharp_1.NOAH.UI.UIUtility;
var U;
(function (U) {
    U.PLAYER_DATA_AVATAR_UNLOCK = "RemoteServerAvatarUnlock";
    U.PLAYER_DATA_SKIN_UNLOCK = "RemoteServerSkinrUnlock";
    U.PLAYER_DATA_HEAT_LEVEL = "HeatLevel";
    function CameraTeleportToTarget() {
        if ((0, CSharpDefine_1.IsNull)(csharp_1.GamePlay.CameraDirector.Cur))
            return;
        csharp_1.GamePlay.CameraDirector.Cur.TeleportToTarget();
        console.warn("CameraDirector.TeleportToTarget");
    }
    U.CameraTeleportToTarget = CameraTeleportToTarget;
    function SetActorActionLock(lock, flag = csharp_1.NOAH.Input.LockFlag.ScriptRequire) {
        console.warn("TsActionLock", `ActorActionLock lock: ${lock}, flag: ${flag}`);
        let mng = U.GetSingleton(csharp_1.GamePlay.GameInputManager);
        mng?.SetActorActionLock(flag, lock);
    }
    U.SetActorActionLock = SetActorActionLock;
    function SetUIActionLock(lock, flag = csharp_1.NOAH.Input.LockFlag.ScriptRequire) {
        console.warn("TsActionLock", `UIActionLock lock: ${lock}, flag: ${flag}`);
        let mng = U.GetSingleton(csharp_1.GamePlay.GameInputManager);
        mng?.SetUIActionLock(flag, lock);
    }
    U.SetUIActionLock = SetUIActionLock;
    function CleanLock(actorInput, uiInput, baseInput) {
        let mng = U.GetSingleton(csharp_1.GamePlay.GameInputManager);
        mng.CleanLock(actorInput, uiInput, baseInput);
    }
    U.CleanLock = CleanLock;
    function SetAllActionLock(lock, flag = csharp_1.NOAH.Input.LockFlag.ScriptRequire) {
        console.warn("TsActionLock", `AllActionLock lock: ${lock}, flag: ${flag}`);
        let mng = U.GetSingleton(csharp_1.GamePlay.GameInputManager);
        mng?.SetAllActionLock(flag, lock);
    }
    U.SetAllActionLock = SetAllActionLock;
    function HasValue(object) {
        for (let k in object) {
            if (object[k] != null)
                return true;
        }
        return false;
    }
    U.HasValue = HasValue;
    function ExitPromiseByTag(tag) {
        let mngTs = U.GetSingleton(TsManager_1.default);
        mngTs.ExitPromiseByTag(tag);
    }
    U.ExitPromiseByTag = ExitPromiseByTag;
    ;
    function Delay(ms, tag = "") {
        let mngTs = U.GetSingleton(TsManager_1.default);
        return mngTs.Delay(ms, tag);
    }
    U.Delay = Delay;
    function DelayAsync(ms, tag = "", callback) {
        let mngTs = U.GetSingleton(TsManager_1.default);
        return mngTs.DelayAsync(ms, tag, callback);
    }
    U.DelayAsync = DelayAsync;
    function Until(condition, checkIntervalMs = 100, tag = "") {
        let mngTs = U.GetSingleton(TsManager_1.default);
        return mngTs.Until(condition, checkIntervalMs, tag);
    }
    U.Until = Until;
    function CombinedCompare(...funcs) {
        return function (a, b) {
            for (let f of funcs) {
                let val = f(a, b);
                if (val)
                    return val;
            }
            return 0;
        };
    }
    U.CombinedCompare = CombinedCompare;
    function GetSingleton(o) {
        return o.Instance;
    }
    U.GetSingleton = GetSingleton;
    // const LocaleManager = csharp_1.Localization.LocalizationManager;
    function GetLocale(key, ...args) {
        let mgr = LocaleManager.Instance;
        let str = mgr.GetString(key);
        return str.Format(...args);
    }
    U.GetLocale = GetLocale;
    async function LoadSceneAsync(sceneName) {
        await U.GetSingleton(TsGameGlobal_1.default)?.LoadSceneAsync(sceneName);
    }
    U.LoadSceneAsync = LoadSceneAsync;
    function Color(htmlColor) {
        return UIUtility.GetColor(htmlColor);
    }
    U.Color = Color;
    function ColorRGB(r, g, b, a) {
        return UIUtility.GetColor(r, g, b, a);
    }
    U.ColorRGB = ColorRGB;
    function ColorHtml(color) {
        return UIUtility.GetColor(color);
    }
    U.ColorHtml = ColorHtml;
    function UIntColor(hexColor) {
        let i = 0;
        if (hexColor == null || hexColor == "" || hexColor == "0")
            return 0;
        if (hexColor.startsWith("#")) {
            i = 1;
        }
        let len = hexColor.length - i;
        if (len == 6 || len == 8) {
            let color32 = 0;
            for (; i < hexColor.length; i++) {
                let part = parseInt(hexColor[i], 16);
                if (Number.isNaN(part)) {
                    console.error("Color", `Color convert failed! "${hexColor}" at ${i}`);
                    return 0;
                }
                color32 = color32 << 4;
                color32 += part;
            }
            if (len == 6) {
                color32 = (color32 << 8) + 0xFF;
            }
            color32 >>>= 0;
            return color32;
        }
        else {
            console.error("Color", `Color convert failed! bad input "${hexColor}". Only support #RRGGBB #RRGGBBAA RRGGBB RRGGBBAA.`);
        }
        return 0;
    }
    U.UIntColor = UIntColor;
    // const JsInjectorType = (0, puerts_1.$typeof)(csharp_1.JsInjector);
    function GetBindObj(comp, compType) {
        if ((0, CSharpDefine_1.IsNull)(comp))
            return null;
        let jsInjector = (comp?.GetComponent(JsInjectorType));
        if (jsInjector != null) {
            return jsInjector.BindingObject;
        }
        return null;
    }
    U.GetBindObj = GetBindObj;
    function GetBindObjSafe(comp, compType) {
        if ((0, CSharpDefine_1.IsNull)(comp))
            return null;
        let activeStatus = comp.gameObject.activeSelf;
        if (!activeStatus) {
            comp.gameObject.SetActive(true);
        }
        let jsInjector = (comp?.GetComponent(JsInjectorType));
        let result = null;
        if (jsInjector != null) {
            result = jsInjector.BindingObject;
        }
        if (!activeStatus) {
            comp.gameObject.SetActive(false);
        }
        return result;
    }
    U.GetBindObjSafe = GetBindObjSafe;
    function GetComponents(root, type) {
        return root.GetComponents((0, puerts_1.$typeof)(type));
    }
    U.GetComponents = GetComponents;
    function GetComponent(comp, type) {
        return csharp_1.Js.JsUtil.GetComponent(comp, (0, puerts_1.$typeof)(type));
    }
    U.GetComponent = GetComponent;
    function AddComponent(goOrComp, type) {
        let gameObject = goOrComp instanceof csharp_1.UnityEngine.Component ? goOrComp.gameObject : goOrComp;
        return gameObject.AddComponent((0, puerts_1.$typeof)(type));
    }
    U.AddComponent = AddComponent;
    function GetComponentInChildren(comp, type, includeInactive = false) {
        return comp.GetComponentInChildren((0, puerts_1.$typeof)(type), includeInactive);
    }
    U.GetComponentInChildren = GetComponentInChildren;
    function GetComponentsInChildren(comp, type, includeInactive = false) {
        return comp.GetComponentsInChildren((0, puerts_1.$typeof)(type), includeInactive);
    }
    U.GetComponentsInChildren = GetComponentsInChildren;
    function GetComponentInParent(comp, type) {
        return comp.GetComponentInParent((0, puerts_1.$typeof)(type));
    }
    U.GetComponentInParent = GetComponentInParent;
    function Vector2ToVector3(v2) {
        return new csharp_1.UnityEngine.Vector3(v2.x, v2.y, 0);
    }
    U.Vector2ToVector3 = Vector2ToVector3;
    function Vector3ToVector2(v3) {
        return new csharp_1.UnityEngine.Vector2(v3.x, v3.y);
    }
    U.Vector3ToVector2 = Vector3ToVector2;
    function FpToFloat(val) {
        return csharp_1.GamePlay.BattleUtils.GetFloatForTS(val);
    }
    U.FpToFloat = FpToFloat;
    function Fp2ToVector2(val) {
        return csharp_1.GamePlay.BattleUtils.GetVector2ForTS(val);
    }
    U.Fp2ToVector2 = Fp2ToVector2;
    function FloatToFp(val) {
        return csharp_1.GamePlay.BattleUtils.GetFpForTS(val);
    }
    U.FloatToFp = FloatToFp;
    function Vector2ToFp2(val) {
        return csharp_1.GamePlay.BattleUtils.GetFp2ForTS(val);
    }
    U.Vector2ToFp2 = Vector2ToFp2;
    function SetClientData(funcSetData) {
        let cache = DataBinding_1.DB.ClientCustomData.Value ?? pbdef_1.STClientCustomData.create();
        funcSetData(cache);
        let reqData = new pbdef_1.ApiClientCustomData.post.req();
        reqData.data = cache;
        let gameGlobal = U.GetSingleton(TsGameGlobal_1.default);
        gameGlobal.Request(pbdef_1.ApiClientCustomData).Post(reqData, null);
    }
    U.SetClientData = SetClientData;
    function SetPlayerData(key, data) {
        DataBinding_1.DB.PlayerData.Value[key] = data;
        DataBinding_1.DB.PlayerData.Notify();
    }
    U.SetPlayerData = SetPlayerData;
    function GetPlayerData(key, defaultValue = null) {
        return DataBinding_1.DB.PlayerData.Value[key] ?? defaultValue;
    }
    U.GetPlayerData = GetPlayerData;
    function SetGameData(key, data) {
        DataBinding_1.DB.GameData.Value[key] = data;
        DataBinding_1.DB.GameData.Notify();
    }
    U.SetGameData = SetGameData;
    function GetGameData(key, defaultValue = null) {
        return DataBinding_1.DB.GameData.Value[key] ?? defaultValue;
    }
    U.GetGameData = GetGameData;
    function ToInt(data) {
        return csharp_1.System.Convert.ToInt32(data);
    }
    U.ToInt = ToInt;
    function IsNullOrEmpty(str) {
        return !str;
    }
    U.IsNullOrEmpty = IsNullOrEmpty;
    function FormatTime(utc, format) {
        let timeUtc;
        if (typeof utc === "number") {
            timeUtc = BigInt(utc);
        }
        else {
            timeUtc = utc;
        }
        let dt = csharp_1.NOAH.TimeUtility.GetLocalDateTime(timeUtc);
        return csharp_1.NOAH.TimeUtility.Format(dt, format);
    }
    U.FormatTime = FormatTime;
    function FormatRemainTime(seconds, showDay = false, format = "hh\\:mm\\:ss") {
        let timeSpan = csharp_1.System.TimeSpan.FromSeconds(seconds);
        if (seconds >= 86400) {
            let days = U.GetLocale("TimeRemain_Day", timeSpan.Days);
            if (showDay) {
                return days;
            }
            else {
                let tmpTimeSpan = csharp_1.System.TimeSpan.FromSeconds(seconds - timeSpan.Days * csharp_1.NOAH.TimeUtility.DAY);
                return `${days} ${tmpTimeSpan.ToString(format)}`;
            }
        }
        else {
            return timeSpan.ToString(format);
        }
    }
    U.FormatRemainTime = FormatRemainTime;
    function FormatTimeSpan(seconds, format) {
        return csharp_1.NOAH.TimeUtility.Format(seconds, format);
    }
    U.FormatTimeSpan = FormatTimeSpan;
    function ResetGame() {
        let gameGloabl = U.GetSingleton(csharp_1.GameGlobal);
        gameGloabl.ResetGame();
    }
    U.ResetGame = ResetGame;
    function CheckReg(text, reg) {
        let valid = false;
        if (!U.IsNullOrEmpty(text)) {
            valid = reg.test(text);
        }
        return valid;
    }
    U.CheckReg = CheckReg;
    function Utf8ByteLength(text) {
        var len = text.length;
        var u8len = 0;
        for (var i = 0; i < len; i++) {
            var c = text.charCodeAt(i);
            if (c <= 0x007f) {
                u8len++;
            }
            else if (c <= 0x07ff) {
                u8len += 2;
            }
            else if (c <= 0xd7ff || 0xe000 <= c) {
                u8len += 3;
            }
            else if (c <= 0xdbff) {
                c = text.charCodeAt(++i);
                if (c < 0xdc00 || 0xdfff < c)
                    throw "Error: Invalid UTF-16 sequence. Missing low-surrogate code.";
                u8len += 4;
            }
            else {
                throw "Error: Invalid UTF-16 sequence. Missing high-surrogate code.";
            }
        }
        return u8len;
    }
    U.Utf8ByteLength = Utf8ByteLength;
    function GetProgressVal(cur, start, end) {
        if (start == end)
            return -1;
        if (cur <= start)
            return 0;
        if (cur >= end)
            return 1;
        return 1.0 * (cur - start) / (end - start);
    }
    U.GetProgressVal = GetProgressVal;
    function GetPercentStr(num, base, afterPointCount = 0) {
        let val1 = MathEx_1.MathEx.Clamp(0, 1, num / base) * 100.0;
        let val2 = val1.toFixed(afterPointCount);
        return val2 + "%";
    }
    U.GetPercentStr = GetPercentStr;
    function GetErrorCodeName(code) {
        let enumname = pbdef_1.EErrorCode[code];
        return `${"EErrorCode"}_${enumname}`;
    }
    U.GetErrorCodeName = GetErrorCodeName;
    function IsSubArray(A, B) {
        let result = true;
        for (let i = 0; i < B.length; i++) {
            if (A.indexOf(B[i]) == -1) {
                result = false;
                break;
            }
        }
        return result;
    }
    U.IsSubArray = IsSubArray;
    function ShuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    U.ShuffleArray = ShuffleArray;
    function RemoveElement(arr, ...toRemove) {
        for (let i = 0; i < toRemove.length; i++) {
            let index = arr.indexOf(toRemove[i]);
            if (index != -1) {
                let temp = arr[0];
                arr[0] = arr[index];
                arr[index] = temp;
                arr.shift();
            }
        }
    }
    U.RemoveElement = RemoveElement;
    function RandomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    U.RandomChoice = RandomChoice;
    function RandomShuffle(arr) {
        const shuffled = arr.slice(0);
        let i = arr.length;
        let temp;
        let index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled;
    }
    U.RandomShuffle = RandomShuffle;
    function RandomSample(arr, size) {
        let shuffled = RandomShuffle(arr);
        return shuffled.slice(0, size);
    }
    U.RandomSample = RandomSample;
    function Sum(array) {
        return array.reduce((a, b) => a + b, 0);
    }
    U.Sum = Sum;
    function FilterObjMap(filterfunc, m) {
        return Object.keys(m).filter((k) => {
            return filterfunc(m[k]);
        });
    }
    U.FilterObjMap = FilterObjMap;
    function Counter(...arrays) {
        let result = new Map();
        for (let array of arrays) {
            for (let i = 0; i < array.length; i++) {
                result.set(array[i], (result.get(array[i]) || 0) + 1);
            }
        }
        return result;
    }
    U.Counter = Counter;
    function Bernouli(p) {
        return (Math.random() * 10000) < p;
    }
    U.Bernouli = Bernouli;
    function FloatFloor(num, precision = 0.01) {
        return Math.floor(num + precision);
    }
    U.FloatFloor = FloatFloor;
    function CreatePbCopy(src) {
        if (src.constructor.name == "Object") {
            return {};
        }
        else {
            return src.constructor.create();
        }
    }
    U.CreatePbCopy = CreatePbCopy;
    function CopyU8Array(src) {
        let dst = new Uint8Array(src.byteLength);
        dst.set(new Uint8Array(src));
        return dst;
    }
    U.CopyU8Array = CopyU8Array;
    function DeepCopy(o) {
        if (typeof o !== 'object') {
            return o;
        }
        if (!o) {
            return o;
        }
        if (o instanceof Uint8Array) {
            return CopyU8Array(o);
        }
        if (Array.isArray(o)) {
            const newO = [];
            for (let i = 0; i < o.length; i += 1) {
                const val = (!o[i] || typeof o[i] !== 'object') ? o[i] : DeepCopy(o[i]);
                newO[i] = val === undefined ? null : val;
            }
            return newO;
        }
        const newO = CreatePbCopy(o);
        for (const i of Object.keys(o)) {
            const val = (!o[i] || typeof o[i] !== 'object') ? o[i] : DeepCopy(o[i]);
            if (val === undefined) {
                continue;
            }
            newO[i] = val;
        }
        return newO;
    }
    U.DeepCopy = DeepCopy;
    function DeepCopyObj(o) {
        if (o == undefined || typeof o !== 'object' || JSON.stringify(o) == '{}') {
            return o;
        }
        let newO = new o.constructor();
        for (let key in o) {
            if (o.hasOwnProperty(key)) {
                newO[key] = DeepCopyObj(o[key]);
            }
        }
        return newO;
    }
    U.DeepCopyObj = DeepCopyObj;
    function MergeResources(...resources) {
        let result = [];
        let tempMap = new DefaultNumberMap();
        for (let resource of resources) {
            tempMap.add(`${resource.id}_${resource.type}`, resource.count);
        }
        for (let [key, value] of tempMap) {
            let [id, type] = key.split("_");
            result.push(pbdef_1.STResource.create({ id: parseInt(id), type: parseInt(type), count: value }));
        }
        return result;
    }
    U.MergeResources = MergeResources;
    function MultiResources(count, ...resources) {
        return resources.map((resource) => {
            return pbdef_1.STResource.create({ id: resource.id, type: resource.type, count: resource.count * count });
        });
    }
    U.MultiResources = MultiResources;
    function SubSetSum(numbers, target, maxDep) {
        let results = [];
        function subSetSum(subnumbers, target, partial = [], depth = 0) {
            let s = Sum(partial);
            if (depth == maxDep) {
                if (s == target) {
                    results.push(partial);
                }
                return;
            }
            for (let i = 0; i < subnumbers.length; i++) {
                let n = subnumbers[i];
                let remain = numbers.filter((v) => v != n);
                subSetSum(remain, target, [].concat(partial, [n]), depth + 1);
            }
        }
        subSetSum(numbers, target, [], 0);
        return results;
    }
    U.SubSetSum = SubSetSum;
    function GetLoopRealIndex(index, total) {
        while (index >= total) {
            index -= total;
        }
        while (index < 0) {
            index += total;
        }
        return index;
    }
    U.GetLoopRealIndex = GetLoopRealIndex;
    class DefaultMap extends Map {
        _defaultValue;
        constructor(defaultValue) {
            super();
            this._defaultValue = defaultValue;
        }
        get(key, defaut) {
            if (!super.has(key)) {
                if (defaut) {
                    super.set(key, defaut);
                    return defaut;
                }
                else {
                    if (this._defaultValue) {
                        super.set(key, this._defaultValue);
                        return this._defaultValue;
                    }
                    else {
                        return undefined;
                    }
                }
            }
            return super.get(key);
        }
    }
    U.DefaultMap = DefaultMap;
    class DefaultNumberMap extends Map {
        _defaultValue;
        constructor(objMap, defaultValue) {
            super();
            if (objMap) {
                for (let key in objMap) {
                    this.set(Number(key), objMap[key]);
                }
            }
            this._defaultValue = defaultValue;
        }
        get(key, defaut = 0) {
            if (!super.has(key)) {
                if (defaut != 0) {
                    super.set(key, defaut);
                    return defaut;
                }
                else {
                    if (this._defaultValue) {
                        super.set(key, this._defaultValue);
                        return this._defaultValue;
                    }
                    else {
                        return 0;
                    }
                }
            }
            return super.get(key);
        }
        add(key, value = 1) {
            this.set(key, this.get(key) + value);
        }
        toObjectMap() {
            let result = {};
            for (let [key, value] of this) {
                result[key] = value;
            }
            return result;
        }
    }
    U.DefaultNumberMap = DefaultNumberMap;
    function MapFlat(map) {
        let result = [];
        for (let key in map) {
            result.push(key);
            result.push(map[key]);
        }
        return result;
    }
    U.MapFlat = MapFlat;
    function MapUnFlat(arr) {
        let result = {};
        for (let i = 0; i < arr.length; i += 2) {
            result[arr[i]] = arr[i + 1];
        }
        return result;
    }
    U.MapUnFlat = MapUnFlat;
    function GetOptionValue(option) {
        if (option.split("_").length > 1) {
            return parseInt(option.split("_")[option.split("_").length - 1]);
        }
        else {
            return parseInt(option);
        }
    }
    U.GetOptionValue = GetOptionValue;
    function ParseIntStrings(strs) {
        let result = [];
        for (let str of strs) {
            if (str) {
                result.push(parseInt(str));
            }
        }
        return result;
    }
    U.ParseIntStrings = ParseIntStrings;
    function Random(start, finish) {
        return start + Math.random() * (finish - start);
    }
    U.Random = Random;
    function GetMapValue(ObjectMap, key, defaultValue) {
        if (!(key in ObjectMap)) {
            ObjectMap[key] = defaultValue;
        }
        return ObjectMap[key];
    }
    U.GetMapValue = GetMapValue;
    function ToggleActiveZ(trans, show) {
        trans?.SetLocalZ(show ? 0 : -10000);
    }
    U.ToggleActiveZ = ToggleActiveZ;
    function IsActiveZ(trans) {
        return trans?.localPosition.z > -10000;
    }
    U.IsActiveZ = IsActiveZ;
    function InstanciateGo(go, parent) {
        return csharp_1.UnityEngine.Object.Instantiate(go, parent);
    }
    U.InstanciateGo = InstanciateGo;
    function Throttle(fn, interval) {
        let last = 0;
        return function () {
            const ctx = this;
            const now = Date.now();
            if (now - last > interval) {
                last = now;
                fn.apply(ctx, arguments);
            }
        };
    }
    U.Throttle = Throttle;
    function ExecuteBLL(Bll) {
        let bllContainer = BattleJs_1.default.Instance.Battle.BllContainer;
        bllContainer?.FindInstructionCompByName(Bll)?.ForceExecuteImmediately(bllContainer);
    }
    U.ExecuteBLL = ExecuteBLL;
    function SafeWrite(filePath, bytes) {
        if (!bytes) {
            return;
        }
        let fptemp = filePath + ".temp";
        let fpbak = filePath + ".bak";
        csharp_1.System.IO.File.WriteAllBytes(fptemp, bytes);
        if (csharp_1.System.IO.File.Exists(filePath)) {
            csharp_1.System.IO.File.Move(filePath, fpbak);
        }
        csharp_1.System.IO.File.Move(fptemp, filePath);
        csharp_1.System.IO.File.Delete(fpbak);
        csharp_1.System.IO.File.Delete(fptemp);
    }
    U.SafeWrite = SafeWrite;
    function SafeRead(filePath) {
        let fpbak = filePath + ".bak";
        if (csharp_1.System.IO.File.Exists(filePath)) {
            if (csharp_1.System.IO.File.Exists(fpbak)) {
                console.error("IO", "SafeRead error: both file and backup file exist");
                csharp_1.System.IO.File.Delete(fpbak);
            }
            return csharp_1.System.IO.File.ReadAllBytes(filePath);
        }
        else {
            if (csharp_1.System.IO.File.Exists(fpbak)) {
                csharp_1.System.IO.File.Move(fpbak, filePath);
                return csharp_1.System.IO.File.ReadAllBytes(filePath);
            }
        }
        return null;
    }
    U.SafeRead = SafeRead;
    function SafeCopy(sourcePath, targetPath) {
        let targetDir = csharp_1.System.IO.Path.GetDirectoryName(targetPath);
        if (!csharp_1.System.IO.Directory.Exists(targetDir)) {
            csharp_1.System.IO.Directory.CreateDirectory(targetDir);
        }
        if (csharp_1.System.IO.File.Exists(sourcePath)) {
            csharp_1.System.IO.File.Copy(sourcePath, targetPath, true);
        }
    }
    U.SafeCopy = SafeCopy;
    function SafeDelete(filePath) {
        if (csharp_1.System.IO.File.Exists(filePath)) {
            csharp_1.System.IO.File.Delete(filePath);
        }
    }
    U.SafeDelete = SafeDelete;
    function EnumToArray(enumObject) {
        return Object.keys(enumObject)
            .filter(key => isNaN(Number(key)))
            .map(key => enumObject[key]);
    }
    U.EnumToArray = EnumToArray;
    function LogToFile(msg) {
        let gameGlobal = GetSingleton(csharp_1.GameGlobal);
        gameGlobal.LogToFile(msg);
    }
    U.LogToFile = LogToFile;
    function RangeArray(start, end) {
        return Array.from({ length: (end - start) }, (v, k) => k + start);
    }
    U.RangeArray = RangeArray;
    function CompareCondition(compareType, source, target) {
        switch (compareType) {
            case pbdef_1.EDungeonRoomEventConditionCompare.BiggerEqual:
                return source >= target;
            case pbdef_1.EDungeonRoomEventConditionCompare.LessEqual:
                return source <= target;
            case pbdef_1.EDungeonRoomEventConditionCompare.LessThan:
                return source < target;
            case pbdef_1.EDungeonRoomEventConditionCompare.BiggerThan:
                return source > target;
            default:
                return true;
        }
    }
    U.CompareCondition = CompareCondition;
    function InstanceValEqual(InstanceA, InstanceB) {
        return JSON.stringify(InstanceA) == JSON.stringify(InstanceB);
    }
    U.InstanceValEqual = InstanceValEqual;
    function GetCurController() {
        return csharp_1.Rewired.ReInput.players.GetPlayer(0).controllers.GetLastActiveController();
    }
    U.GetCurController = GetCurController;
    function GetCurScene() {
        return csharp_1.UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
    }
    U.GetCurScene = GetCurScene;
    function FindKey(target, func) {
        for (let key of Object.keys(target)) {
            let val = target[key];
            if (func(val))
                return key;
        }
        return null;
    }
    U.FindKey = FindKey;
    function GetAceAccountId() {
        return U.GetSingleton(csharp_1.NOAH.Network.Rest.RestManager).GetService("world").Identity?.AccountId ?? "";
    }
    U.GetAceAccountId = GetAceAccountId;
    function GetPlatformPlayerID() {
        return UlongSolver(csharp_1.SDKHelper.GetPlatformPlayerId());
    }
    U.GetPlatformPlayerID = GetPlatformPlayerID;
    function GetAccountName() {
        let finalName = csharp_1.SDKHelper.GetPlatformPlayerName();
        let cachedNameFromServer = U.GetSingleton(TsCommunicationManager_1.default).playerNameFromServer;
        if (cachedNameFromServer) {
            finalName = cachedNameFromServer;
        }
        if (finalName)
            DataBinding_1.DB.AccountName.Value = finalName;
        return DataBinding_1.DB.AccountName.Value;
    }
    U.GetAccountName = GetAccountName;
    function GetCachedAccountInfoByAceId(id) {
        return PvpPlayerInfo_1.PvpPlayerInfoManager.cachedPlayerInfoMap.get(id);
    }
    U.GetCachedAccountInfoByAceId = GetCachedAccountInfoByAceId;
    async function GetAccountInfoByAceId(id, requestWrapper) {
        let info = PvpPlayerInfo_1.PvpPlayerInfoManager.cachedPlayerInfoMap.get(id);
        if (!info) {
            await PvpPlayerInfo_1.PvpPlayerInfoManager.TryFetchPlayerInfo([id], requestWrapper, PvpPlayerInfo_1.FetchPlayerInfoFlag.IUserSummaries);
            info = PvpPlayerInfo_1.PvpPlayerInfoManager.cachedPlayerInfoMap.get(id);
        }
        return info ? info : null;
    }
    U.GetAccountInfoByAceId = GetAccountInfoByAceId;
    async function GetFriendNameByAceId(id, requestWrapper) {
        return (await GetAccountInfoByAceId(id, requestWrapper))?.name;
    }
    U.GetFriendNameByAceId = GetFriendNameByAceId;
    function GetEnumKeyByEnumValue(myEnum, enumValue) {
        let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
        return keys.length > 0 ? keys[0] : null;
    }
    U.GetEnumKeyByEnumValue = GetEnumKeyByEnumValue;
    function ParseHttpError(restErr) {
        let error = null;
        try {
            error = JSON.parse(restErr.Response)?.error;
        }
        catch (e) {
        }
        return error;
    }
    U.ParseHttpError = ParseHttpError;
    async function PlayBll(bllName, bevRoot = null) {
        let btt = BattleJs_1.default.Instance.Battle;
        let elem = btt.MapMgr.FindMapElementByName(bllName);
        if (elem == null)
            return;
        let cmpt = U.GetComponent(elem, csharp_1.GamePlay.BLLInstructionComp);
        if (cmpt == null)
            return;
        cmpt.DoStart();
        if (bevRoot == null) {
            await U.Until(() => cmpt.IsEnded, 10, "Bll" + bllName);
        }
        else {
            await bevRoot.Until(() => cmpt.IsEnded, 10, "Bll" + bllName);
        }
    }
    U.PlayBll = PlayBll;
    async function WaitBll(bllName, bevRoot = null) {
        let btt = BattleJs_1.default.Instance.Battle;
        let elem = btt.MapMgr.FindMapElementByName(bllName);
        if (elem == null)
            return;
        let cmpt = U.GetComponent(elem, csharp_1.GamePlay.BLLInstructionComp);
        if (cmpt == null || cmpt.IsEnded)
            return;
        if (bevRoot == null) {
            await U.Until(() => cmpt.IsEnded, 10, "Bll" + bllName);
        }
        else {
            await bevRoot.Until(() => cmpt.IsEnded, 10, "Bll" + bllName);
        }
    }
    U.WaitBll = WaitBll;
    function SafeNumber(str, invalidReturn = -999) {
        if (!Number.isNaN(str))
            return Number(str);
        else
            return invalidReturn;
    }
    U.SafeNumber = SafeNumber;
    function UlongSolver(num) {
        if (num >= 0)
            return num;
        else
            return num + BigInt(0x10000000000000000);
    }
    U.UlongSolver = UlongSolver;
})(U = exports.U || (exports.U = {}));
//# sourceMappingURL=Util.js.map