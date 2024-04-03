"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMessageBoard = void 0;
const DataSave_1 = require("../../Core/DataSave");
// const ServerUtils_1 = require("../../Server/ServerUtils");
// const Xlsx_1 = require("../../Gen/Xlsx");
const pbdef_1 = require("../../Gen/pbdef");
// const Common_1 = require("../../Server/Module/Common");
// const csharp_1 = require("csharp");
class ModelMessageBoard extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.SMPlayerMessageBoard.create();
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
    get Messages() {
        return this.data.messages;
    }
    GetMessageState(messageId) {
        let message = this.data.messages[messageId];
        if (message === undefined) {
            return pbdef_1.EMessageState.Inactive;
        }
        else {
            return message?.state;
        }
    }
    GetCallbackState(messageId) {
        let message = this.data.messages[messageId];
        if (message === undefined) {
            return pbdef_1.EMessageCallbackState.None;
        }
        else {
            return message?.callbackState;
        }
    }
    CheckCallback(message) {
        let conf = Xlsx_1.Xlsx.MessageBoardConf.Get(message.messageId);
        if (conf && conf.isCallback) {
            if (message.state != pbdef_1.EMessageState.Unread && message.state != pbdef_1.EMessageState.Read) {
                return;
            }
            if (message.callbackState == pbdef_1.EMessageCallbackState.Complete || message.callbackState == pbdef_1.EMessageCallbackState.Expire) {
                return;
            }
            if (conf.expireConditions.length == 0) {
                message.callbackState = pbdef_1.EMessageCallbackState.Available;
            }
            else {
                let expire = Common_1.CommonUtils.CheckUnlocked(conf.expireConditions);
                if (expire) {
                    message.callbackState = pbdef_1.EMessageCallbackState.Expire;
                }
                else {
                    message.callbackState = pbdef_1.EMessageCallbackState.Available;
                }
            }
        }
    }
    CreateMessage(messageId, messageState) {
        let message = pbdef_1.STMessage.create({
            messageId: messageId,
            timestamp: Number(csharp_1.NOAH.GameTime.utc),
            state: messageState,
        });
        this.CheckCallback(message);
        this.data.messages[messageId] = message;
        return message;
    }
    tryActiveMessage(conf, messageState) {
        let canActive = Common_1.CommonUtils.CheckUnlocked(conf.activeConditions);
        if (canActive) {
            if (conf.mutexGroup) {
                if (this.MutexGroupExists(conf.mutexGroup)) {
                    canActive = false;
                }
                else {
                    let confs = Xlsx_1.Xlsx.MessageBoardConf.All;
                    for (let c of confs) {
                        if (c.id == conf.id)
                            continue;
                        if (c.mutexGroup && c.mutexGroup == conf.mutexGroup && c.priority > conf.priority) {
                            canActive = false;
                        }
                    }
                }
            }
        }
        if (canActive) {
            let message = this.CreateMessage(conf.id, messageState);
            if (conf.mutexGroup)
                this.AddMutexGroup(conf.mutexGroup);
            return message;
        }
        return;
    }
    ReadMessage(messageId) {
        let conf = Xlsx_1.Xlsx.MessageBoardConf.Get(messageId);
        if (!conf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `message board conf ${messageId} not found`);
        }
        let message = this.data.messages[messageId];
        if (message === undefined) {
            this.tryActiveMessage(conf, pbdef_1.EMessageState.Read);
        }
        else {
            if (message.state != pbdef_1.EMessageState.Invalid) {
                message.state = pbdef_1.EMessageState.Read;
            }
        }
        return ServerUtils_1.ServerUtils.MakeRet(true, 0, "");
    }
    CallbackMessage(messageId) {
        let conf = Xlsx_1.Xlsx.MessageBoardConf.Get(messageId);
        if (!conf) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ResNotFound, `message board conf ${messageId} not found`);
        }
        if (!conf.isCallback) {
            return ServerUtils_1.ServerUtils.MakeRet(false, pbdef_1.EErrorCode.ClientParamInvalid, `message board ${messageId} can not callback`);
        }
        let message = this.data.messages[messageId];
        if (message === undefined) {
            message = this.tryActiveMessage(conf, pbdef_1.EMessageState.Unread);
            if (message && message.callbackState != pbdef_1.EMessageCallbackState.Expire) {
                message.callbackState = pbdef_1.EMessageCallbackState.Complete;
            }
        }
        else {
            if (conf.expireConditions.length == 0) {
                message.callbackState = pbdef_1.EMessageCallbackState.Complete;
            }
            else {
                let expire = Common_1.CommonUtils.CheckUnlocked(conf.expireConditions);
                if (expire) {
                    message.callbackState = pbdef_1.EMessageCallbackState.Expire;
                }
                else {
                    message.callbackState = pbdef_1.EMessageCallbackState.Complete;
                }
            }
        }
        return ServerUtils_1.ServerUtils.MakeRet(true, 0, "");
    }
    IsCallbackComplete(messageId) {
        let message = this.data.messages[messageId];
        return message && message.callbackState == pbdef_1.EMessageCallbackState.Complete;
    }
    MutexGroupExists(group) {
        return this.data.mutexGroup.includes(group);
    }
    AddMutexGroup(group) {
        if (!this.MutexGroupExists(group)) {
            this.data.mutexGroup.push(group);
        }
    }
}
exports.ModelMessageBoard = ModelMessageBoard;
//# sourceMappingURL=MessageBoard.js.map