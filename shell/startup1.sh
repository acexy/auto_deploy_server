#!/bin/sh

# ********************************设置相关信息
# 防止进程启动中立即ps进程无法查找到 延迟ps时间(s)
SLEEPTIME=1
# ********************************设置相关信息


# 绿底白字
echo_green () {
    echo -e "\033[42;37m$1\033[0m";
}
# 红底白字
echo_red () {
    echo -e "\033[41;37m$1\033[0m";
}

# 获取执行的sh文件相对于当前执行目录的相对路径
DIR=`dirname $0`
cd $DIR

# 得到完整的绝对路径
DIR=`pwd`

# 以得到的完整路径为ps搜索条件判断是否能ps到相关进程信息
PID=`ps -ef | grep $DIR | grep -v grep | grep -v $0 > /dev/null 2>&1`
if [ $? -ne 0 ]; then # 是否ps到相关信息
    # 执行启动命令 自定义
    STARTCMD
    sleep $SLEEPTIME
    PID=`ps -ef | grep $DIR | grep -v grep | grep -v $0 | awk '{print $2}'`
    if [ "$PID" = "" ]; then
        # 启动进程后无法ps到进程号,启动失败
        echo_red "执行启动命令后未能ps到启动进程号!"
    else
        echo_green "启动完成 pid: $PID"
    fi
else
    echo_red "检测到已有进程:  `ps -ef | grep $DIR | grep -v grep | grep -v $0 | awk '{print $2}'`"
fi
