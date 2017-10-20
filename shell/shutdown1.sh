#!/bin/sh

# 绿字
echo_green () {
    echo -e "\033[01;32m"$1"\033[00m";
}
# 红字
echo_red () {
    echo -e "\033[01;31m"$1"\033[00m";
}
# 蓝字
echo_blue () {
    echo -e "\033[01;34m"$1"\033[00m";
}

DIR=`dirname $0`
cd $DIR

DIR=`pwd`

PID=`ps -ef | grep $DIR | grep -v grep | awk '{print $2}'`
if [ "$PID" = "" ]; then
    echo_red "未能查找到有效的pid号"
else
    kill $PID
    if [ $? -eq 0 ]; then
        sleep 1
        echo_green "已成功发送kill命令pid: $PID"
    else
        echo_red "发送kill命令后得到失败结果pid: $PID"
    fi
fi
