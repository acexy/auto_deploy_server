#!/bin/sh

# ********************************设置相关信息
# 设置保存启动进程的pid文件名
PIDFILE='.pid'
# ********************************设置相关信息

# 绿底白字
echo_green () {
    echo -e "\033[42;37m$1\033[0m";
}
# 红底白字
echo_red () {
    echo -e "\033[41;37m$1\033[0m";
}

DIR=`dirname $0`
cd $DIR

if [ -f "$PIDFILE" ]; then
    PID=`cat $PIDFILE`
    if [ "$PID" = "" ]; then
        echo_red "pid文件中没有有效的pid信息: $PIDFILE"
    else
        kill  $PID
        if [ $? -eq 0 ]; then
            sleep 1
            echo_green "已成功发送kill命令pid: $PID"
        else
            echo_red "发送kill命令后得到失败结果pid: $PID"
        fi
    fi
else
    echo_red "未找到进程pid记录文件: $PIDFILE"
fi
