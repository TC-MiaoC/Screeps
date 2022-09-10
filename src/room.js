import { configs } from "./configs";

// 根据房间内矿的开采位权重来随机选择矿
Room.prototype.chooseSourceByFreeSpaceWeight = function () {
    let randomList = [];
    this.source.forEach((i) => {
        let j = i.getFreeSpaceNumber();
        while (j--) {
            randomList.push(i.id);
        }
    })
    return Game.getObjectById(_.sample(randomList));
};

// 更新需要塔修复的建筑
Room.prototype.updateStructuresNeedTowerFix = function () {
    let structuresNeedTowerFix = [];
    this.find(FIND_STRUCTURES).forEach((structure) => {
        if (global.judgeIfStructureNeedTowerFix(structure)) {
            structuresNeedTowerFix.push(structure.id);
        }
    })
    this.memory.structuresNeedTowerFix = structuresNeedTowerFix;
}

// 扫描房间是否有建筑工地或者墙、门是否要修
Room.prototype.updateIfNeedBuilderWork = function () {
    let target;
    // 自卫战争时期紧急修墙，停止工地建设，找血量最低的墙、门
    if (this.memory.code.warOfSelfDefence) {
        target = this.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART;
            }
        }).sort((i, j) => {
            return i.hits - j.hits;
        })[0];
    }
    // 非自卫战争时期先找建筑工地，再找血量最低的墙、门
    else {
        target = this.find(FIND_CONSTRUCTION_SITES)[0] ||
            this.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART;
                }
            }).sort((i, j) => {
                return i.hits - j.hits;
            })[0];
    }

    if (target instanceof ConstructionSite || target.hits < (configs.maxHitsRepairingWallOrRampart[this.name] - 10000)) {
        this.memory.code.ifNeedBuilderWork = true;
    }
    else {
        this.memory.code.ifNeedBuilderWork = false;
    }
}

// 判断creepRole是否达到生产条件
Room.prototype.judgeIfCreepNeedSpawn = function (creepRole) {
    switch (creepRole) {
        // harvester一直都需要生产
        case "harvester": { return true; }
        // filler只有在有storage或者sourceContainer时才需要生产
        case "filler": { return (this.storage || this.sourceContainer.length) ? true : false; }
        // collecter只有在有storage和sourceContainer、mineralContainer任意一种
        // 同时storage有空余、mineralContainer满了时才需要生产
        case "collecter": {
            return (this.storage && this.storage.store.getFreeCapacity() > 1000 &&
                (this.sourceContainer.length ||
                    (this.mineralContainer.length && this.mineralContainer[0].store.getFreeCapacity() < 100))) ? true : false;
        }
        // centercarrier只有在有storage和centerLink时才需要生产
        case "centercarrier": { return (this.storage && this.centerLink.length) ? true : false; }
        // upgrader一直都需要生产
        case "upgrader": { return true; }
        // builder只有在需要builder工作时才需要生产
        case "builder": { return this.memory.code.ifNeedBuilderWork; }
        // miner只有在有extractor和mineralContainer且storage有空余且矿余量不为0时才会生产
        case "miner": {
            return (this.extractor && this.mineralContainer.length &&
                this.storage && this.storage.store.getFreeCapacity() > 1000 &&
                this.mineral.mineralAmount > 0) ? true : false;
        }
        // outsideharvester只有有storage且有外矿房间设定时才会生产
        case "outsideharvester": { return (this.storage && configs.outsideSoucreRoomSetting[this.name].length) ? true : false; }
        case 'warcarrier':
        case 'controllerattacker':
        case 'dismantler': { return this.memory.code.warOfRevolution; }
        // default: { return true; }
    }
}

// 根据优先级添加room的生产队列
Room.prototype.addSpawnTasks = function (creepRoleList) {
    this.memory.spawnQueue = this.memory.spawnQueue.concat(creepRoleList);
    this.memory.spawnQueue.sort((i, j) => {
        return configs.creepRolePrioritySetting[i] - configs.creepRolePrioritySetting[j];
    })
    creepRoleList.forEach((i) => {
        ++this.memory.spawnQueueCreepNumber[i];
    });
};

// 分发生产任务到空闲Spawn
Room.prototype.distributeSpawnTasks = function () {
    let availableSpawn = _.sample(this.find(FIND_MY_SPAWNS, {
        filter: (structure) => {
            return !structure.spawning;
        }
    }));
    if (availableSpawn) {
        let RCLAssessmentResult = global.assessRCL(this);
        let creepRole = this.memory.spawnQueue[0];
        let creepBodyMetadata = configs.creepBodyConfigs[RCLAssessmentResult][creepRole];
        let creepBody = [];
        Object.keys(creepBodyMetadata).forEach((i) => {
            let j = creepBodyMetadata[i];
            while (j--) {
                creepBody.push(i);
            }
        })
        let creepName = ('[' + creepRole + '][' + this.name + '][' + RCLAssessmentResult + '][' + Game.time + ']').toLowerCase();
        // testIfCanSpawn在canSpawn时返回0（表示ok）
        let testIfCanSpawn = availableSpawn.spawnCreep(creepBody, creepName, { dryRun: true });

        if (!testIfCanSpawn) {
            let creepMemory = { role: creepRole, autoControl: true };
            // 如果后续添加不属于任何一个房间的creep就把creep.memory.originalRoomName设为FREE
            if (creepRole == 'outsideharvester' || creepRole == 'warcarrier' ||
                creepRole == 'controllerattacker' || creepRole == 'dismantler') {
                creepMemory['originalRoomName'] = this.name;
            }

            availableSpawn.spawnCreep(creepBody, creepName,
                { memory: creepMemory });
            --this.memory.spawnQueueCreepNumber[creepRole];
            ++this.memory.creepNumber[creepRole];
            this.memory.spawnQueue.shift();
        }
    }
};

// 更新creep内存
Room.prototype.updateCreepMemory = function () {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            let deadCreepRole = Memory.creeps[name].role;
            // 如果死亡creep为harvester则需要删除与source的绑定关系
            if (deadCreepRole == 'harvester') {
                this.memory.sourceCreepBindingRelationship.forEach((i) => {
                    if (i.creepNames.includes(name)) {
                        _.remove(i.creepNames, (j) => {
                            return j == name;
                        })
                    }
                })
            };

            // 只记录设定里的creep种类的数量
            if (configs.creepRoleSetting.includes(deadCreepRole)) {
                --this.memory.creepNumber[deadCreepRole];
            }
            delete Memory.creeps[name];
        }
    }
};

// 更新生产队列
Room.prototype.updateSpawnQueue = function () {
    configs.creepRoleSetting.forEach((creepRole) => {
        // 设定数量不为0时
        if (configs.creepNumberSetting[this.name][creepRole]) {
            // 先判断是否达到生产条件
            if (!this.judgeIfCreepNeedSpawn(creepRole)) {
                if (this.memory.spawnQueueCreepNumber[creepRole]) {
                    _.remove(this.memory.spawnQueue, (i) => {
                        return i == creepRole;
                    });
                    this.memory.spawnQueueCreepNumber[creepRole] = 0;
                }
            }
            // 达到生产条件再判断数量是否不足或过多
            // creep数量不足时添加相应角色到房间spawn队列
            // creep数量过多时删除房间spawn队列里的相应角色（如果有的话，如果是已经生产出来的就算了）
            else {
                let j = configs.creepNumberSetting[this.name][creepRole] -
                    (this.memory.creepNumber[creepRole] + this.memory.spawnQueueCreepNumber[creepRole]);
                if (j > 0) {
                    let creepRoleList = [];
                    for (let i = 0; i < j; i++) {
                        creepRoleList.push(creepRole);
                    }
                    this.addSpawnTasks(creepRoleList);
                }
                if (j < 0) {
                    if (this.memory.spawnQueueCreepNumber[creepRole]) {
                        if (-j >= this.memory.spawnQueueCreepNumber[creepRole]) {
                            _.remove(this.memory.spawnQueue, (k) => { return k == creepRole })
                            this.memory.spawnQueueCreepNumber[creepRole] = 0;
                        }
                        else {
                            for (let k = 0; k < -j; k++) {
                                this.memory.spawnQueue.splice(this.memory.spawnQueue.indexOf(creepRole), 1);
                                --this.memory.spawnQueueCreepNumber[creepRole];
                            }
                        }
                    }
                }
            }
        }
    });
};
