"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelNotepad = exports.NotepadEventLevel = void 0;
const DataSave_1 = require("../../Core/DataSave");
// const ServerUtils_1 = require("../../Server/ServerUtils");
// const Xlsx_1 = require("../../Gen/Xlsx");
const pbdef_1 = require("../../Gen/pbdef");
// const Common_1 = require("../../Server/Module/Common");
var NotepadEventLevel;
(function (NotepadEventLevel) {
    NotepadEventLevel[NotepadEventLevel["One"] = 1] = "One";
    NotepadEventLevel[NotepadEventLevel["Two"] = 2] = "Two";
    NotepadEventLevel[NotepadEventLevel["Three"] = 3] = "Three";
})(NotepadEventLevel = exports.NotepadEventLevel || (exports.NotepadEventLevel = {}));
class ModelNotepad extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.SMPlayerNotepad.create();
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
    get Events() {
        return this.data.events;
    }
    GetEventState(eventId) {
        let event = this.data.events[eventId];
        if (event === undefined) {
            return pbdef_1.ENotepadEventState.Inactive;
        }
        else {
            return event?.state;
        }
    }
    createEvent(eventId) {
        let event = pbdef_1.STNotepadEvent.create({
            eventId: eventId,
        });
        this.data.events[eventId] = event;
        return event;
    }
    GetCreateEvent(eventId) {
        let event = this.data.events[eventId];
        if (event === undefined) {
            event = this.createEvent(eventId);
        }
        return event;
    }
    SelectTitle(eventId) {
        let conf = Xlsx_1.Xlsx.NotepadConf.Get(eventId);
        if (!conf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `notepad conf ${eventId} not found`);
        }
        if (conf.titleLevel != NotepadEventLevel.Two) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ClientParamInvalid, `notepad title ${eventId} level ${conf.titleLevel} invalid`);
        }
        let event = this.data.events[eventId];
        if (event === undefined) {
            let unlock = Common_1.CommonUtils.CheckUnlocked(conf.beginConditions);
            if (unlock) {
                event = this.createEvent(eventId);
                event.state = pbdef_1.ENotepadEventState.InProgress;
            }
        }
        else {
            if (event.state == pbdef_1.ENotepadEventState.Update) {
                event.state = pbdef_1.ENotepadEventState.InProgress;
            }
        }
        return ServerUtils_1.ServerUtils.MakeRet(true, 0, "");
    }
}
exports.ModelNotepad = ModelNotepad;
//# sourceMappingURL=Notepad.js.map