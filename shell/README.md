 定义统一的shell用于应用程序的启动及停止
 ---
 
### startup.sh
```
        用于启动应用程序，放置于目标应用目录，需要将STARTCMD替换为自己应用的启动命令，主要实现以下功能:
    1. 判断当前应用是否已经启动    
    2. 如果未启动则执行指定的STARTCMD启动目标应用
    3. 获取启动后的pid进程并写入.pid(默认)文件中
```

### shutdown.sh
```
        用于停止应用程序，放置于目标应用目录，主要实现以下功能:
    1. 检查.pid(默认)文件中的pid记录是否有效
    2. 如果找到有效的pid则执行kill pid 命令(默认)
```
---

## 说明
* 进程的查找是按照脚本所在的目录进行ps查找的
```
    例如startup.sh 处于/data/app/java/user中 则ps 进程查找为ps /data/app/java/user
所以请保证startup.sh所在的目录只启动了单个进程
```
* shutdown.sh是按照start.sh启动时写入到的.pid(默认)文件中的pid号进行kill的
