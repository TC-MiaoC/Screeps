export const roleBuilder = {
    run: function (creep) {
        // 生产中的creep不执行代码
        if (creep.spawning) { return undefined; }

        // 快死的时候趁着身上没资源赶紧死，否则浪费资源
        if (creep.ticksToLive < 30 && creep.store.getUsedCapacity() == 0) {
            creep.suicide();
            return undefined;
        }

        // 手动控制
        if (!creep.memory.autoControl) {
            // WRITE YOUR CODE WHEN CREEP IS NOT AUTOCONTROL
            return undefined;
        }

        // 工作状态切换
        if (creep.memory.ready && creep.store.getUsedCapacity() == 0) {
            creep.memory.ready = false;
            creep.memory.targetId = null;
        }
        if (!creep.memory.ready && creep.store.getUsedCapacity() > 0) {
            creep.memory.ready = true;
            creep.memory.sourceId = null;
        }

        // 获取target缓存
        let target = Game.getObjectById(creep.memory.targetId);

        // 验证target缓存
        if (!target ||
            ([STRUCTURE_WALL, STRUCTURE_RAMPART].includes(target.structureType)
                && judgeIfStructureNeedBuilderRepair(target, 2))) {
            target = null;
            creep.memory.targetId = null;
        }

        // 获取target
        // 自卫战争时期紧急修墙，停止工地建设，找血量最低的需要维修的Wall、Rampart，多余能量拿去升级
        if (creep.room.memory.period.warOfSelfDefence) {
            target = target
                || _.filter(creep.room.constructedWall.concat(creep.room.rampart), (structure) => {
                    return judgeIfStructureNeedBuilderRepair(structure, 1);
                }).sort((i, j) => {
                    return i.hits - j.hits;
                })[0]
                || (creep.store[RESOURCE_ENERGY] > 0 ? creep.room.controller : null);
        }
        // 非自卫战争时期先找建筑工地，再找最近的需要维修的Wall、Rampart，多余能量拿去升级
        else {
            target = target
                || creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
                || creep.pos.findClosestByRange(_.filter(creep.room.constructedWall.concat(creep.room.rampart), (structure) => {
                    return judgeIfStructureNeedBuilderRepair(structure, 1);
                }))
                || (creep.store[RESOURCE_ENERGY] > 0 ? creep.room.controller : null);
        }

        // 验证target
        if (!target) { return undefined; }

        // 缓存target
        if (!creep.memory.targetId) {
            creep.memory.targetId = target.id;
        }

        // 工作逻辑代码
        if (!creep.memory.ready) {
            // 获取source缓存
            let source = Game.getObjectById(creep.memory.sourceId);

            // 验证source缓存
            if (!source || source.store[RESOURCE_ENERGY] == 0) {
                source = null;
                creep.memory.sourceId = null;
            }

            // 获取source
            source = source
                || ((creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >
                    2000) ? creep.room.storage : null)
                || ((creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] >
                    2000) ? creep.room.terminal : null)
                || creep.chooseSourceContainer(500);

            // 验证source
            if (!source) { return undefined; }

            // 缓存source
            if (!creep.memory.sourceId) {
                creep.memory.sourceId = source.id;
            }

            // source交互
            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
        else {
            // target交互
            if (target instanceof ConstructionSite) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            else if ([STRUCTURE_WALL, STRUCTURE_RAMPART].includes(target.structureType)) {
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            else {
                if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
    }
};
