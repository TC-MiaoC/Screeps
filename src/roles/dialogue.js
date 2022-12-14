/**
 * 废案，为了节约cpu不再让creep说话
 */

import { configs } from "../configs";

/**
 * 对话包分为角色单人对话包（已删除）、通用单人对话包、通用双人对话包（双方在三格范围内）
 * 我设计的角色有creep.memory.state = 'moving'\'working'\'resting'三种，根据状态可触发更多特色对话（已删除）
 * 但是即使角色没有creep.memory.state属性也不会出错，而是只会从'any'（无状态）\'hurt'（受伤状态，无需访问内存）\'hostile'（3格内存在敌人，无需访问内存）的对话当中选择
 * 对话大部分我自己想的，也有部分对话由游戏小兵步枪修改而来
 * 大概会持续更新更多对话
 */
const dialogue = {
    // 角色单人对话包（已删除）
    'dialogue0': {
        'harvester': {
            'moving': [],
            'working': [],
            'resting': [],
            'any': [],
        },
        'filler': {
            'moving': [],
            'working': [],
            'resting': [],
            'any': [],
        },
        'centercarrier': {
            'moving': [],
            'working': [],
            'resting': [],
            'any': [],
        },
        'upgrader': {
            'moving': [],
            'working': [],
            'resting': [],
            'any': [],
        },
        'builder': {
            'moving': [],
            'working': [],
            'resting': [],
            'any': [],
        },
        'miner': {
            'moving': [],
            'working': [],
            'resting': [],
            'any': [],
        },
    },
    // 通用单人对话包
    'dialogue1': {
        'any': [
            '三点几嚟，饮茶先啦！',
            '偷个懒应该没人发现~',
            '为什么我不能起跳？',
            '每天工作都不带变的！',
            '*打哈欠*',
            '*吹口哨*',
            '*狗喘息*',
            '原来我是NPC！？',
            '我感觉今天战无不胜!',
            '你的妈妈呢？',
            '这里到处都是1和0',
            '我好像没说过11个字',
            '我感觉记忆有点乱',
            '我真想要无限视野',
            '作者永远是对的',
            '我知道你在那！',
            '我今天复活了上百次',
        ],
        'hurt': [
            '医疗兵！',
            '卫生员！',
            '啊，我需要医疗兵！',
            '救我狗命！',
            '我还能被抢救一下！',
            '我胳膊要没了！',
            '我头在否！？',
            '帮我打个120！',
            '这算是工伤吧！？'
        ],
        'hostile': [
            '警报！',
            '艾玛！',
            '见鬼！',
            '哎哟！',
            '天哪！我被盯上了！',
            '迎面走来的是..？？',
            '你怎么走到这的？',
            '作者忘记关门了？？',
        ]
    },
    // 通用双人对话包（双方在三格范围内）
    'dialogue2': {
        'any any': [
            ['作者在看我们吗？', '应该没有', '为啥？', '不然他会给我们加工作'],
            ['你想来片口香糖吗？', '不，谢了', '我们都认为你需要', '额，你意思是...？', '你猜对了，伙计！'],
            ['来点烟不？', '不了谢谢..', '我用power卷的', '卧槽！'],
            ['要不要教你登dua郎', '杰哥不要啦~'],
            ['我的脚着火了', '动一下', '我做不到'],
            ['我想偷懒了...', '作者发现会让你自杀的', '噢不...'],
            ['真的猛士，敢于...', '别念了，快搬砖吧'],
            ['哎哟，你踩到我脚了！', '应该踩你嘴！', '话说我们有脚吗？', '...'],
            ['为啥我们走路这么慢？', '防止2小时退款..', '...'],
            ['哥们儿，你放屁了？', '可能吧...', '我去！离我远点！'],
            ['你拿到驾照了吗？', '我们这有车吗？'],
            ['有烟吗？', '没，我不知道你抽烟', '我不抽，我想烧了基地', '你疯了！？', '这样就不用007了'],
            ['嘘！我偷偷藏了点能量', '小点声，记得分享', '等作者下线先'],
            ['我一直在想...', '想什么？', '额，突然忘了'],
            ['敌人没偷袭我们太好了', '是啊', '我们防御代码都没有！'],
            ['这个游戏发售了吗？', '是的，在Steam！', '屌爆了'],
            ['我们长得好圆啊', '是啊肯定开了抗锯齿'],
            ['你猜我几岁了？', '反正活不过1500t'],
            ['作者咋不renew咱', '你想+1s？', '太暴力了！'],
            ['天生万物以养人！', '你8要命啦！？'],
            ['我想给自己起名..', '咋了[rloe]?', '你看我们名字乱码似的'],
            ['基地这图案啥意思？', '好像是工人运动？', '全世界无产者联合起来', '别喊了我们就一爬爬', '...'],
            ['看看这个地方', '太平静了', '我都想住这了'],
            ['你快升官了吗？', '你想多了', '要是能偷点能量...', '要power才行..'],
            ['不要跟我妈说我在这', '为什么这么说？', '她以为我在妓院弹钢琴', '哦哦好...'],
            ['有烟吗?', '都扔完了', '为什么？', '里面进了太多沙子了', '我们这有沙子吗？', '那我们这有烟吗？', '...'],
            ['我昨天碰到脚本作者了', '你说MiaoC？', '对，他代码写的真烂！'],
            ['我们为啥叫爬爬？', '嘛玩儿？你说的嘛？', '我也不知道自己说的嘛'],
            ['你知道吗？', '嗯？', '我想我爱你', '滚犊子...'],
            ['要是这有妹子就好了', '确实，刺激荷尔蒙', '呃我不是那个意思..', '那是什么意思？', '那样就有人做饭了'],
            ['*唱歌*', '你应该去做个歌手', '真的吗！？', '那样就不用听你唱歌了'],
            ['你可以往那边挪挪吗？', '不可以', '谢谢', '不客气'],
            ['我有个主意', '算了吧，都是馊主意'],
            ['作者的代码真蠢', '管用就行', '上次更新后我卡了半天', '...'],
            ['哈哈哈！你的脸', '什么？', '满脸都是像素', '...'],
            ['昨晚做了个奇怪的梦', '做了什么梦？', '到处都是1和0', '有什么问题吗？', '突然看见一个2！', '啊啊，真可怕'],
            ['这个为所欲为的玩家', '玩家？', '是的，躲在屏幕后面'],
            ['还是密集型的基地好', '你在说啥？？', '这样我们就不用跑很远'],
            ['真希望作者代码出错', '为啥？', '那样我们就可以休息了'],
            ['你为啥整天大喊大叫？', '让别人知道我们活着'],
            ['我爱死这基地了', '闭上你的嘴巴！', '就不！'],
            ['你是怎么来的？', '...', '没看到交通工具过来', '...', '你是不是代码刷的？', '呃额'],
            ['玩家是什么?', '在电脑外看着我们的人', '大概是'],
        ]
    }
}


/**
 * 为每个creep概率设定要说的话，由于双人对话涉及不同的creep，因此采取全局函数而不是creep原型拓展的设计
 * 注意：为了在当前tick说当前tick获取的dialogue，setDialogue要比showDialogue先调用
 * 注意：概率为每个tick每个creep的概率，双人对话涉及两个creep概率升高（一个成功另一个也成功），且概率非严格概率（需要乘上上一条件失败概率）
 */
global.setDialogue = function () {
    for (let creep of Object.values(Game.creeps)) {
        // 排除生产中的creep
        if (creep.spawning) { continue; }

        // 如果memory里没有要说的dialogue
        if (!creep.memory.dialogue) {
            // 如果受伤则10%概率获取受伤的dialogue
            if (creep.hits < creep.hitsMax && Math.random() < 0.1) {
                let text = _.sample(dialogue['dialogue1']['hurt']);
                let sayTime = Game.time;
                let _dialogue = { 'sayTime': sayTime + 1, 'text': text };
                creep.memory.dialogue = [_dialogue];
                continue;
            }

            // 如果处于自卫战争时期且3格内有敌人则10%概率获取对敌的dialogue
            // 注意：即使没有自卫战争时期这一设定也不会报错，就是不触发该类型对话而已，设定处于自卫战争时期才扫描可以减少CPU消耗
            if (creep.room.memory.period && creep.room.memory.period.warOfSelfDefence &&
                creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {
                    filter: (hostile) => {
                        return !configs.whiteList['global'].concat(configs.whiteList[creep.room.name] || []).includes(hostile.owner.username);
                    }
                }).length && Math.random() < 0.1) {
                let text = _.sample(dialogue['dialogue1']['hostile']);
                let sayTime = Game.time;
                let _dialogue = { 'sayTime': sayTime + 1, 'text': text };
                creep.memory.dialogue = [_dialogue];
                continue;
            }

            let _chance = Math.random();

            // 如果2格内有其他creep则5%概率获取双人的dialogue
            if (_chance < 0.05 && creep.ticksToLive > 20) {
                let suitableCreep = creep.pos.findInRange(FIND_MY_CREEPS, 2, {
                    filter: (i) => {
                        return !i.pos.isEqualTo(creep.pos) && !i.memory.dialogue && !i.spawning && i.ticksToLive > 20;
                    }
                });
                if (suitableCreep.length) {
                    let otherCreep = creep.pos.findClosestByRange(suitableCreep);
                    let texts = _.sample(dialogue['dialogue2']['any any']);
                    let sayTime = Game.time;

                    // 奇数语句给creep，偶数语句给otherCreep
                    for (let i = 0; i < texts.length; i++) {
                        if (i % 2 == 0) {
                            let _dialogue = { 'sayTime': sayTime + 1 + i, 'text': texts[i] };
                            creep.memory.dialogue ?
                                creep.memory.dialogue.push(_dialogue) : (creep.memory.dialogue = [_dialogue]);
                        }
                        else {
                            let _dialogue = { 'sayTime': sayTime + 1 + i, 'text': texts[i] };
                            otherCreep.memory.dialogue ?
                                otherCreep.memory.dialogue.push(_dialogue) : (otherCreep.memory.dialogue = [_dialogue]);
                        }
                    }
                    continue;
                }
            }

            // 3%概率获取通用单人的dialogue
            if (_chance > 0.97) {
                let text = _.sample(dialogue['dialogue1']['any']);
                let sayTime = Game.time;
                let _dialogue = { 'sayTime': sayTime + 1, 'text': text };
                creep.memory.dialogue = [_dialogue];
                continue;
            }
        }
    }
}

/**
 * 让每个有话说的creep说话，由于双人对话涉及不同的creep，因此采取全局函数而不是creep原型拓展的设计
 * 注意：为了在当前tick说当前tick获取的dialogue，setDialogue要比showDialogue先调用
 */
global.showDialogue = function () {
    for (let creep of Object.values(Game.creeps)) {
        _showDialogue(creep);
    }

    // 为了能让[存在以前tick要说的dialogue]的creep在当前tick重新说下一个dialogue，特地抽取的函数
    function _showDialogue(creep) {
        // 如果memory里有要说的dialogue
        if (creep.memory.dialogue) {
            let _dialogue = creep.memory.dialogue[0];
            // 如果dialogue[0]是这个tick要说的，则say，然后移除该dialogue[0]
            if (_dialogue.sayTime == Game.time) {
                creep.say(_dialogue.text, true);
                creep.memory.dialogue.shift();
                // 如果dialogue空了，移除该dialogue
                if (!creep.memory.dialogue.length) {
                    delete creep.memory.dialogue;
                }
            }
            // 如果dialogue是以前的tick要说的，则移除该dialogue，防止可能的bug，然后自己重新说
            else if (_dialogue.time < Game.time) {
                creep.memory.dialogue.shift();
                _showDialogue(creep);
            }
        }
    }
}
