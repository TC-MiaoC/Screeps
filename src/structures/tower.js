import { configs } from "../configs";

// 各房间tower内存初始化
let towerMemory = {}
Object.values(Game.rooms).forEach((room) => {
    towerMemory[room.name] = { 'Repair': [], 'Attack': null };
})

export const towerWork = {
    work: function (room) {
        // 所有tower统一处理
        let towers = _.filter(room.tower, (i) => {
            return i.store[RESOURCE_ENERGY] >= 10;
        });
        if (!towers.length) { return undefined; }

        // 每50tick扫描一次是否存在需要tower修复的建筑，用于指导tower修理建筑
        if (!(Game.time % 50)) {
            let structuresNeedTowerRepair = [];
            room.find(FIND_STRUCTURES).forEach((structure) => {
                if (global.judgeIfStructureNeedTowerRepair(structure)) {
                    structuresNeedTowerRepair.push(structure.id);
                }
            })
            towerMemory[room.name]['Repair'] = structuresNeedTowerRepair;
        }

        // 非自卫战争时期，则日常维护或战后维修建筑
        if (!room.memory.period.warOfSelfDefence || room.memory.period.forceNotToAttack) {
            // 需要修复的建筑列表不为空
            if (towerMemory[room.name]['Repair'].length) {
                let DamagedStructures = towerMemory[room.name]['Repair'].map((structureId) => {
                    return Game.getObjectById(structureId);
                });
                towers.forEach((tower) => {
                    // 日常维护及战后维修留一半能量以防万一，从距离最近的修起
                    if (tower.store[RESOURCE_ENERGY] > 500) {
                        let closestDamagedStructure = tower.pos.findClosestByRange(DamagedStructures);
                        tower.repair(closestDamagedStructure);
                    }
                });

                // 由于需要修复的建筑列表是50tick扫描一次，所以每tick需要对该列表进行清洗，除去建筑不在了的，除去修好不需要再修的
                _.remove(towerMemory[room.name]['Repair'], (structureId) => {
                    return (!Game.getObjectById(structureId) ||
                        !global.judgeIfStructureNeedTowerRepair(Game.getObjectById(structureId)));
                });
            }
        }
        // 自卫战争时期，所有塔按照敌方creep的bodypart的构成以及射杀优先级集火射杀敌方creep
        // 射杀优先级[CLAIM, WORK, RANGED_ATTACK, ATTACK, HEAL]排名越靠前数量越多越优先射杀
        else {
            // 获取hostile缓存
            let hostile = Game.getObjectById(towerMemory[room.name]['Attack']);

            // 验证target缓存
            if (!hostile) {
                hostile = null;
                towerMemory[room.name]['Attack'] = null;
            }

            // 获取hostile
            hostile = hostile || room.find(FIND_HOSTILE_CREEPS, {
                filter: (hostile) => {
                    return !configs.whiteList['global'].concat(configs.whiteList[room.name] || []).includes(hostile.owner.username);
                }
            }).sort((i, j) => {
                for (let Bodypart of [CLAIM, WORK, RANGED_ATTACK, ATTACK, HEAL]) {
                    if (i.getActiveBodyparts(Bodypart) > j.getActiveBodyparts(Bodypart)) {
                        return 1;
                    }
                    else if (i.getActiveBodyparts(Bodypart) < j.getActiveBodyparts(Bodypart)) {
                        return -1;
                    }
                    else {
                        continue;
                    }
                }
                return 0;
            })[0];

            // 验证hostile
            if (!hostile) { return undefined; }

            // 缓存hostile
            if (!towerMemory[room.name]['Attack']) {
                towerMemory[room.name]['Attack'] = hostile.id;
            }

            // 攻击hostile
            towers.forEach((tower) => {
                tower.attack(hostile);
            });
        }
    }
}
