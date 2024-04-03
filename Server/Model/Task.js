"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTask = void 0;
const DataSave_1 = require("../../Core/DataSave");
const Util_1 = require("../../Core/Util");
// const Xlsx_1 = require("../../Gen/Xlsx");
const pbdef_1 = require("../../Gen/pbdef");
// const Common_1 = require("../../Server/Module/Common");
// const Task_1 = require("../../Server/Module/Task");
// const TaskHistory_1 = require("../../Server/Module/TaskHistory");
class ModelTask extends DataSave_1.DataSaveCore.DataSaveWrapper {
    constructor() {
        let t = pbdef_1.SMPlayerTask.create();
        super();
        super.init(t);
        // Task_1.TaskUtil.RegisterTaskGetter(pbdef_1.ETaskScope.Task, this.GetTask.bind(this));
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
        this.data.tasks = {};
    }
    get Tasks() {
        return this.data.tasks;
    }
    get TaskStagnation() {
        return this.data.taskProgressStagnation;
    }
    GetTask(id) {
        let task = this.data.tasks[id];
        let isNew = false;
        if (!task) {
            let taskConf = Xlsx_1.Xlsx.TaskConf.Get(id);
            if (!taskConf) {
                return null;
            }
            if (Common_1.CommonUtils.CheckUnlocked(taskConf.conditions)) {
                task = pbdef_1.STTaskInfo.create({
                    taskId: id,
                    progress: 0,
                    state: pbdef_1.EAchievementState.Unfinished,
                });
                this.data.tasks[id] = task;
                isNew = true;
            }
        }
        return { task, isNew };
    }
    GetTaskProgress(id) {
        return this.data.tasks[id]?.progress ?? 0;
    }
    GetTaskCurrentProgress(...id) {
        let ret = new Util_1.U.DefaultNumberMap();
        for (let i of id) {
            ret.set(i, this.GetTaskProgress(i));
        }
        return ret;
    }
    CheckTaskStagnation(prevProgress) {
        for (let idstr of Object.keys(prevProgress)) {
            let id = parseInt(idstr);
            let preprogress = prevProgress[id];
            let { task } = this.GetTask(id);
            if (!task)
                continue;
            if (task.progress != preprogress) {
                this.data.taskProgressStagnation[id] = 0;
            }
            else {
                this.data.taskProgressStagnation[id] = (this.data.taskProgressStagnation[id] ?? 0) + 1;
            }
        }
    }
    GetTaskStagnation(id) {
        return this.data.taskProgressStagnation[id] ?? 0;
    }
    RefreshTasks() {
        for (let taskconf of Xlsx_1.Xlsx.TaskConf.All) {
            let { task, isNew } = this.GetTask(taskconf.id);
            if (isNew) {
                TaskHistory_1.TaskHistoryCheck.CheckHistoryProgress(task, taskconf);
            }
        }
    }
}
exports.ModelTask = ModelTask;
//# sourceMappingURL=Task.js.map