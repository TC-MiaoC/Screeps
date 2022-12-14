import { configs } from "./configs";

/**
 * 获取Source的开采位数量，理论上这个不属于global，不过因为Source原型的修改只有这一处，就暂时放这了
 *
 * @returns {number} 返回Source的开采位数量
 */
Source.prototype.getFreeSpaceNumber = function () {
    const terrain = new Room.Terrain(this.room.name);
    const xs = [this.pos.x - 1, this.pos.x, this.pos.x + 1];
    const ys = [this.pos.y - 1, this.pos.y, this.pos.y + 1];
    let freeSpaceNumber = 0;
    xs.forEach((x) => {
        ys.forEach((y) => {
            if (terrain.get(x, y) != TERRAIN_MASK_WALL) {
                freeSpaceNumber++;
            }
        })
    });
    return freeSpaceNumber;
};

/**
 * 从能量角度评估当前RCL所处等级，目前用于指导creepBody的选择
 *
 * rcl五级及以下时，缺少filler或harvester均使用当前可用能量来评估RCL等级
 * rcl五级以上时，缺失filler才使用当前可用能量来评估RCL等级
 * 其余时候使用当前能量上限来评估
 *
 * @param {Room} room 房间对象
 * @returns {string} 返回"RCL_*"
 */
global.assessRCL = function (room) {
    let energyForRCLAssessment = 0;

    let state = room.controller.level <= 5 ?
        (room.memory.creepNumber['filler'] == 0 || room.memory.creepNumber['harvester'] == 0) : room.memory.creepNumber['filler'] == 0;
    if (state) {
        energyForRCLAssessment = room.energyAvailable;
    }
    else {
        energyForRCLAssessment = room.energyCapacityAvailable;
    }

    switch (true) {
        case energyForRCLAssessment >= configs.creepBodyConfigs['RCL_8']['maxcost']:
            return "RCL_8";
        case energyForRCLAssessment >= configs.creepBodyConfigs['RCL_7']['maxcost']:
            return "RCL_7";
        case energyForRCLAssessment >= configs.creepBodyConfigs['RCL_6']['maxcost']:
            return "RCL_6";
        case energyForRCLAssessment >= configs.creepBodyConfigs['RCL_5']['maxcost']:
            return "RCL_5";
        case energyForRCLAssessment >= configs.creepBodyConfigs['RCL_4']['maxcost']:
            return "RCL_4";
        case energyForRCLAssessment >= configs.creepBodyConfigs['RCL_3']['maxcost']:
            return "RCL_3";
        case energyForRCLAssessment >= configs.creepBodyConfigs['RCL_2']['maxcost']:
            return "RCL_2";
        default:
            return "RCL_1";
    }
};

/**
 * 判断建筑是否需要Tower维修
 *
 * @param {Structure} structure 需要判断的建筑对象
 * @returns {boolean} 返回true或者false
 */
global.judgeIfStructureNeedTowerRepair = function (structure) {
    // Tower维修几乎所有建筑
    switch (structure.structureType) {
        // 不需要修墙，修墙是builder的活
        case STRUCTURE_WALL:
            return false;
        // Road血量低于80%再修
        case STRUCTURE_ROAD:
            return structure.hits / structure.hitsMax < 0.8 ? true : false;
        // Container血量高于50%低于70%再修
        case STRUCTURE_CONTAINER:
            return (structure.hits / structure.hitsMax >= 0.5 &&
                structure.hits / structure.hitsMax < 0.7) ? true : false;
        // centerRampart血量低于1.5k或者低于设定血量且高于设定血量-5k则修
        // surroundingRampart血量低于1.5k则修
        case STRUCTURE_RAMPART: {
            let rampartType = undefined;
            if (structure.room.centerRampart.includes(structure)) {
                rampartType = 'centerRampart';
            }
            else if (structure.room.surroundingRampart.includes(structure)) {
                rampartType = 'surroundingRampart';
            }

            if (rampartType == 'centerRampart') {
                let hitsSetting = configs.maxHitsRepairingWallOrRampart[structure.room.name][rampartType] || 0;
                return (structure.hits < 1500 || (structure.hits >= hitsSetting - 5000 &&
                    structure.hits < hitsSetting)) ? true : false;
            }
            else if (rampartType == 'surroundingRampart') {
                return structure.hits < 1500 ? true : false;
            }
        }
        // 其他建筑掉血了就修
        default:
            return structure.hits < structure.hitsMax ? true : false;
    }
};

/**
 * 判断建筑是否需要builder维修
 *
 * @param {Structure} structure 需要判断的建筑对象
 * @param {number} flag 0：生产条件 | 1：获取条件 | 2：停止条件
 * @returns {boolean} 返回true或者false
 */
global.judgeIfStructureNeedBuilderRepair = function (structure, flag) {
    // builder只维修Wall和Rampart
    switch (structure.structureType) {
        // WALL血量低于设定血量-5k或者*0.9开始生产builder维修
        // WALL血量低于设定血量开始维修
        // WALL血量高于设定血量结束维修
        case STRUCTURE_WALL: {
            let hitsSetting = configs.maxHitsRepairingWallOrRampart[structure.room.name][STRUCTURE_WALL] || 0;
            switch (flag) {
                case 0: return structure.hits <
                    (hitsSetting > 50000 ? hitsSetting - 5000 : hitsSetting * 0.9) ? true : false;
                case 1: return structure.hits < hitsSetting ? true : false;
                case 2: return structure.hits >= hitsSetting ? true : false;
            }
        }
        // RAMPART血量低于设定血量-50k或者*0.8开始生产builder维修
        // RAMPART血量高于设定血量-5k或者*0.9开始维修
        // RAMPART血量高于设定血量结束维修
        case STRUCTURE_RAMPART: {
            let rampartType = undefined;
            if (structure.room.centerRampart.includes(structure)) {
                rampartType = 'centerRampart';
            }
            else if (structure.room.surroundingRampart.includes(structure)) {
                rampartType = 'surroundingRampart';
            }
            let hitsSetting = configs.maxHitsRepairingWallOrRampart[structure.room.name][rampartType] || 0;
            switch (flag) {
                case 0: return structure.hits <
                    (hitsSetting > 250000 ? hitsSetting - 50000 : hitsSetting * 0.8) ? true : false;
                case 1: return structure.hits <
                    (hitsSetting > 50000 ? hitsSetting - 5000 : hitsSetting * 0.9) ? true : false;
                case 2: return structure.hits >= hitsSetting ? true : false;
            }
        }
        // 其他建筑不需要生产builder维修，不需要开始维修，如果开始了直接停止维修
        default: {
            switch (flag) {
                case 0: return false;
                case 1: return false;
                case 2: return true;
            }
        }
    }
};

/**
 * 在内存中更新 RCL、GCL、GPL 使用情况和当前 CPU、bucket 使用情况
 */
global.stateScanner = function () {
    // 每 50 tick 运行一次
    if (!(Game.time % 50)) {
        // 记录扫描时间
        Memory.stats.scanTick = Game.time;

        // 统计每个房间的 RCL 的等级、升级百分比、剩余进度
        Object.values(Game.rooms).forEach((room) => {
            if (room.controller && room.controller.my) {
                let RCLLevel = room.controller.level;
                let RCLPercentage = room.controller.progressTotal ?
                    ((room.controller.progress / room.controller.progressTotal) * 100).toFixed(2) + '%' : '100.00%';
                let progressrLeft = room.controller.progressTotal ? room.controller.progressTotal - room.controller.progress : 0;
                Memory.stats[room.name] =
                    `RCLLevel：${RCLLevel} | RCLPercentage：${RCLPercentage} | progressrLeft：${progressrLeft}`;
            }
        })

        // 统计 GCL、GPL 的等级和升级百分比
        Memory.stats.GCLLevel = Game.gcl.level;
        Memory.stats.GCLPercentage = ((Game.gcl.progress / Game.gcl.progressTotal) * 100).toFixed(2) + '%';
        Memory.stats.GPLLevel = Game.gpl.level;
        Memory.stats.GPLPercentage = ((Game.gpl.progress / Game.gpl.progressTotal) * 100).toFixed(2) + '%';

        // 统计 CPU 的当前使用量
        Memory.stats.CPUUsage = Game.cpu.getUsed();
        // 统计 bucket 的当前剩余量
        Memory.stats.Bucket = Game.cpu.bucket;

        // 输出至控制台
        // Object.keys(Memory.stats).forEach((key) => {
        //     console.log(JSON.stringify(key + '：' + Memory.stats[key]));
        // });
    }
};

/**
 * 只会被玩家在控制台调用的函数，用来显示内存中 RCL、GCL、GPL 使用情况和当前 CPU、bucket 使用情况
 */
global.showStateScannerInfo = function () {
    if (Memory.stats && Object.keys(Memory.stats).length) {
        Object.keys(Memory.stats).forEach((key) => {
            console.log(JSON.stringify(key + '：' + Memory.stats[key]));
        });
    }
    else {
        console.log('暂时还没收集到 RCL、GCL、GPL 使用情况和当前 CPU、bucket 使用情况，请等待一段时间后重试！');
    }
};

/**
 * 杀死所有creep！该命令风险极高！需要手动更改false为true！
 *
 * @param {boolean} confirmation 需要手动更改该参数为true以确认操作！
*/
global.killAllMyCreeps = function (confirmation = false) {
    if (confirmation === true) {
        console.log('开始杀死所有creep...');
        Object.values(Game.creeps).forEach((creep) => {
            creep.suicide();
        })
        console.log('杀死所有creep完成！');
    }
    else {
        console.log('杀死所有creep失败！请手动将参数修改为true以确认操作！');
    }
};

/**
 * creep内存初始化
 */
global.creepMemoryInitialization = function () {
    // 对已存在的creep进行内存初始化，依赖已存在creep的名称
    Object.keys(Game.creeps).forEach((creepName) => {
        let creepInfo = creepName.replace(/\s*/g, "").split('|');
        let creepMemory =
        {
            'role': creepInfo[0].toLowerCase(),
            'autoControl': true,
            'originalRoomName': creepInfo[1],
            'ready': Game.creeps[creepName].store.getUsedCapacity() > 0 ? true : false,
        };
        Game.creeps[creepName].memory = creepMemory;
    });
};

/**
 * room内存初始化
 */
global.roomMemoryInitialization = function (room) {
    // 初始化战争时期标志，分为自卫战争和革命战争，自卫战争被动、革命战争主动
    room.memory.period = {};
    room.memory.period.warOfSelfDefence = false;
    room.memory.period.warOfRevolution = false;

    // 初始化建筑内存
    room.memory.structures = {
        'tower': { 'attack': null, 'repair': [] },
        'factory': { 'produce': null, 'failTick': false },
        'powerSpawn': { 'processPower': false, 'failTick': false },
    };

    // 初始化source信息
    room.memory.sourceInfo = {};
    room.source.forEach((i) => {
        room.memory.sourceInfo[i.id] = [];
    });

    // 初始化creep数量
    // 优化：所有房间统一处理creep数量更节约cpu，但考虑代码结构和谐性暂时不予优化
    room.memory.creepNumber = {};
    configs.creepRoleSetting.forEach((creepRole) => {
        room.memory.creepNumber[creepRole] = 0;
    });
    for (let creep of Object.values(Game.creeps)) {
        // 不是本房间的creep不记录
        let originalRoomName = creep.memory.originalRoomName || creep.room.name;
        if (originalRoomName != room.name) { continue; }

        // 没有creep.memory.role不记录，这种情况发生在creep内存初始化失败的时候
        if (!creep.memory.role) { continue; }
        // role不是设定中的role不记录，这种情况发生在手动生产非设定role的creep的时候
        if (!configs.creepRoleSetting.includes(creep.memory.role)) { continue; }

        ++room.memory.creepNumber[creep.memory.role];
    }
};
