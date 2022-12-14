import { configs } from "../configs";

/**
 * 判断某一角色类型是否达到生产条件
 *
 * @param {string} creepRole 角色类型
 * @returns {boolean} 返回true或者false
 */
Room.prototype.judgeIfCreepNeedSpawn = function (creepRole) {
    switch (creepRole) {
        // harvester一直都需要生产
        case "harvester": { return true; }
        // upgrader只有在有[storage或者terminal或者sourceContainer]时才需要生产
        case "upgrader": { return (this.storage || this.terminal || this.sourceContainer.length) ? true : false; }
        // filler只有在有[storage或者terminal或者sourceContainer]时才需要生产
        case "filler": { return (this.storage || this.terminal || this.sourceContainer.length) ? true : false; }
        // collecter只有在同时有[storage或者terminal]和[sourceContainer或者mineralContainer]
        // 同时[storage或者terminal或者factory]有空余，mineralContainer快满了时才需要生产
        case "collector": {
            let freeCapacity = (this.storage ? this.storage.store.getFreeCapacity() : 0) +
                (this.terminal ? this.terminal.store.getFreeCapacity() : 0);
            return (freeCapacity > 100000 && (this.sourceContainer.length ||
                (this.mineralContainer.length && this.mineralContainer[0].store.getFreeCapacity() < 500))) ?
                true : false;
        }
        // centercarrier只有在有[storage或者terminal]和[centerLink]和[集群中心]时才需要生产
        case "centercarrier": {
            return ((this.storage || this.terminal) && this.centerLink.length && configs.centerPoint[this.name]) ? true : false;
        }
        // miner只有在有[Extractor和mineralContainer]同时[storage或者terminal]有空余且[矿余量不为0]时才会生产
        case "miner": {
            let freeCapacity = (this.storage ? this.storage.store.getFreeCapacity() : 0) +
                (this.terminal ? this.terminal.store.getFreeCapacity() : 0);
            return (this.extractor && this.mineralContainer.length && freeCapacity > 200000 &&
                this.mineral.mineralAmount > 0) ? true : false;
        }
        // builder只有在需要builder工作时才需要生产，并且为了节约cpu25tick扫描一次
        case "builder": { return !(Game.time % 25) ? this.ifNeedBuilderWork() : false; }
        // 其他角色一律放行
        default: { return true; }
    }
};

/**
 * 扫描房间是否需要builder工作
 *
 * @returns {boolean} 返回true或者false
 */
Room.prototype.ifNeedBuilderWork = function () {
    // 不存在任何能量来源时不出builder
    if (!this.storage && !this.terminal && !this.container.length) {
        return false;
    }

    let targetFlag;
    // 自卫战争时期停止工地建设，找是否有符合的建筑
    if (this.memory.period && this.memory.period.warOfSelfDefence) {
        targetFlag = this.rampart.some((structure) => {
            return judgeIfStructureNeedBuilderRepair(structure, 0);
        }) || this.constructedWall.some((structure) => {
            return judgeIfStructureNeedBuilderRepair(structure, 0);
        });
    }
    // 非自卫战争时期先找建筑工地，再找是否有符合的建筑
    else {
        targetFlag = !!this.find(FIND_CONSTRUCTION_SITES).length
            || this.rampart.some((structure) => {
                return judgeIfStructureNeedBuilderRepair(structure, 0);
            })
            || this.constructedWall.some((structure) => {
                return judgeIfStructureNeedBuilderRepair(structure, 0);
            });
    }

    // 存在工地或者有符合的建筑（血量低于设定的Wall、Rampart）
    return targetFlag;
};
