# Screeps Script of TC-MiaoC

[Screeps](https://screeps.com/a/#!/enter)是一款大型多人在线编程RTS游戏，该项目实现了在Screeps公共服务器（[shard3](https://screeps.com/a/#!/shards)）上运行的半自动化AI脚本。

## 准备工作

为了运行该项目，你需要首先：

- **安装依赖**

```bash
# nodejs >= 10.13.0
npm install
```

- **添加密钥**

在`./`下新建 `.secret.json` 文件，并填入以下内容:

```json
{
    "main": {
        "token": "[YOUR_TOKEN]",
        "protocol": "https",
        "hostname": "screeps.com",
        "port": 443,
        "path": "/",
        "branch": "default"
    },
    "local": {
        "copyPath": "[YOUR_LOCAL_FILE_DIRECTORY]"
    }
}
```

## 运行项目

你可以通过以下 `npm` 命令来运行该项目：

- rollup本地编译 （只本地编译，不提交代码，可调试编译过程）

```
npm run build
```

- 直接向服务器提交代码（需要填写 `.secret.json` 中 `main.token` 字段，包含本地编译，无需启动游戏）

```
npm run push
```

- 通过本地文件目录提交代码（需要填写 `.secret.json` 中 `local.copyPath` 字段，包含本地编译，需启动游戏steam客户端）

```
npm run local
```

## 手动控制

你可以通过以下方法手动控制游戏运行：

- 修改`./src/configs.js`配置文件（~~或其他文件，如果你对该项目够熟的话🤪~~），然后重新编译上传项目
- 通过游戏内控制台访问Memory、全局变量和全局函数进行控制（参考[操作指南](/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97.md)）
- 游戏内直接修改memory（不推荐）

## 代码设计

访问 [/doc](./doc/) 来查看代码设计。

## 其他说明

本项目的构建参考了简书上HoPGoldy大佬❤的[中文教程](https://www.jianshu.com/p/5431cb7f42d3)（~~没错这个Markdown也是参考的这位大佬写的😀~~），同时得到了[Screeps>_编程交流群](https://jq.qq.com/?_wv=1027&k=FFUue0TM)里许多大佬的帮助与解答，包括并不限于 *大猫的家*、*PandaFlower* 等等，感谢各位大佬的指导！

本项目几乎全部代码由本人独立完成，借鉴的代码如 `./src/structures/index.js` 借鉴群里 Scorpior_gh 大佬的 `极致建筑缓存v1.4.3` 均在文件开头有所声明。

注意，本项目**尚未完成**，访问[/TODO.md](TODO.md)来查看后续更新计划，你可以通过本项目了解 Screeps 相关的操作以及如何将 rollup 应用在 Screeps 里（本项目包含大量的中文注释）。

警告，本项目不适合中途拿来用，因为初始化内存时需要重新构建已存在creep内存，除非你先调用杀死所有creep的命令（在global.js内存初始化那里）。

为了尊重自己和他人的游戏体验，请不要将本项目直接部署在官方服务器上（~~不会吧不会吧，不会真的有人会用这辣鸡代码吧！？😨~~）。