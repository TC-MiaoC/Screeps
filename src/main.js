// 导入错误处理程序
import { errorMapper } from './modules/errorMapper';

// 导入功能模块
import { autoSF } from './autoSF';

// 导入全局依赖和原型拓展
import "./structures/index";
import "./roles/index";
import "./roles/task";
import "./global";
import "./room";

// 导入建筑
import { towerWork } from "./structures/tower";
import { linkWork } from "./structures/link";
import { labWork } from "./structures/lab";
import "./structures/powerSpawn";
import "./structures/nuker";

// 导入基础角色
import { roleHarvester } from "./roles/baseRoles/roleHarvester";
import { roleFiller } from "./roles/baseRoles/roleFiller";
import { roleCollecter } from "./roles/baseRoles/roleCollecter";
import { roleCentercarrier } from "./roles/baseRoles/roleCentercarrier";
import { roleUpgrader } from "./roles/baseRoles/roleUpgrader";
import { roleBuilder } from "./roles/baseRoles/roleBuilder";
import { roleMiner } from "./roles/baseRoles/roleMiner";

// 导入远程角色

// 导入战争角色

// 杀死所有creep！
// 注意：该命令风险极高！只有当已存在名称不同于本人命名风格的Creep时使用！
// 注意：该命令需要手动更改false为true以确认操作！
// killAllMyCreeps('false');

// 设置初始化的相关标志位
let doNotClearMyMemory = false;
let doNotInitializeMyStructureIndex = false;
let doNotInitializeMyMemory = false;

// 注意：全局重启时将清空内存
// 注意：测试房间sim会不停的全局重启，因此无法将代码部署到测试房间sim
RawMemory.set("{}");

// 主循环，游戏入口
module.exports.loop = errorMapper(() => {
    // 全局重启后将清空Memory，等当前tick结束，Creep和Room的初始的内存才能由游戏自动重新构建完成
    // 也就是说下一个tick才能复游戏初始的内存状态，然后才能在此基础构建自己的Memory
    // 也是因为这个原因无法在全局重启的时候初始化建筑索引和Memory
    if (!doNotClearMyMemory) {
        doNotClearMyMemory = true;
        console.log("tick：" + Game.time + "清空了内存，下一tick将开始建筑索引初始化和内存初始化");
        return undefined;
    }

    // 建筑索引初始化
    // 注意：内存初始化需要依赖建筑索引初始化，请保证先执行建筑索引初始化
    if (!doNotInitializeMyStructureIndex) {
        console.log("建筑索引初始化开始...");
        Object.values(Game.rooms).forEach((room) => {
            if (room.controller && room.controller.my) {
                room.updateStructureIndex();
            }
        });
        doNotInitializeMyStructureIndex = true;
        console.log("建筑索引初始化完成！");
    }

    // 内存初始化
    // 注意：内存初始化需要依赖建筑索引初始化，请保证先执行建筑索引初始化
    if (!doNotInitializeMyMemory) {
        console.log("内存初始化开始...");
        global.memoryInitialization();
        doNotInitializeMyMemory = true;
        console.log("内存初始化完成！");
    }

    // 利用空闲cpu获取pixel
    if (Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
        console.log("tick：" + Game.time + "获取了一点pixel！");
    }

    // 房间运营
    Object.values(Game.rooms).forEach((room) => {
        // 判断属于自己的房间，注意需要先判断room.controller，因为过道没有controller，不判断将导致过道有视野时报错
        if (room.controller && room.controller.my) {
            // 每隔100tick扫描一次房间是否有建筑工地或者Wall、Rampart需要builder去修建，用于指导builder的生成与工作
            // 该方法会更新room.memory.ifNeedBuilderWork的布尔值
            if ((Game.time % 100)) {
                room.updateIfNeedBuilderWork();
            }

            // 每50tick扫描一次是否存在需要tower修复的建筑，用于指导tower修理建筑
            // 该方法会更新room.memory.structuresNeedTowerFix的建筑列表
            if (!(Game.time % 50)) {
                room.updateStructuresNeedTowerFix()
            }

            // 每20tick扫描一次是否存在敌对creep（排除了白名单中的玩家的creep），发现则进入自卫战争状态，否则退出自卫战争状态
            // 该方法会更新room.memory.code.warOfSelfDefence的布尔值
            if (!(Game.time % 20)) {
                room.updateHostiles();
            }

            // 更新creep内存（清理死亡creep内存）
            room.updateCreepMemory();
            // 更新creep生产队列
            room.updateSpawnQueue();
            // 检查房间生产队列，如果有，则向随机Spawn分发生产任务
            if (room.memory.spawnQueue.length) {
                room.distributeSpawnTasks();
            }

            // 房间内建筑工作，由于Tower、Link、Lab在相同房间内相同个体之间是协同作用的，因此需要将它们看成一个整体同一处理
            // 这也是不使用建筑原型拓展的原因
            towerWork.work(room);
            linkWork.work(room);
            labWork.work(room);
            // PowerSpawn、Nuker是个体工作，因此使用原型拓展比较好
            if (room.powerSpawn) {
                room.powerSpawn.work();
            }
        }
    });

    // creep工作，非设定的creep不会工作但也不会报错
    Object.values(Game.creeps).forEach((creep) => {
        switch (creep.memory.role) {
            case 'harvester': roleHarvester.run(creep); break;
            case 'filler': roleFiller.run(creep); break;
            case 'collecter': roleCollecter.run(creep); break;
            case 'centercarrier': roleCentercarrier.run(creep); break;
            case 'upgrader': roleUpgrader.run(creep); break;
            case 'builder': roleBuilder.run(creep); break;
            case 'miner': roleMiner.run(creep); break;
            default: break;
        }
    })

    // 为每个creep概率设定要说的话
    global.getDialogue();
    // 让每个有话说的creep说话
    global.showDialogue();

    // 自动开启SF模块工作
    autoSF.work();

    // 在内存中更新 RCL、GCL、GPL 使用情况和当前 CPU、bucket 使用情况
    global.stateScanner();
});
