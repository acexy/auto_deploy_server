/**
 * Created by Zxy on 2016/11/25.
 *
 * 监听指定文件目录的变化情况
 *
 */

var watch = require('gulp-watch');

var watchRootPath = global.config.system.watchRootPath;
var envConfig = global.config.envConfig;


// 是否监听到了文件变化
var watchFilesChanged = false;

// 监听到的文件变化的路径
var changedFilesPath = [];

// 在sftp上传过程中发现的文件更改
var changedFilesPathToWait = [];

module.exports.watch = function () {

    var watchAllPath = [];
    var watchPaths = Object.keys(envConfig);

    for (var index = 0; index < watchPaths.length; index++) {
        watchAllPath.push(
            watchRootPath +
            watchPaths[index] +
            global.config.fileSeparator +
            '**' + global.config.fileSeparator + '*'
        );
    }

    console.log('开始监听以下目录: ');
    console.log(JSON.stringify(watchAllPath, null, 4));

    // 开启对文件的监听
    watch(watchAllPath, 'changed', function (dataCallback) {

        // 文件变更事件非删除
        if (dataCallback.event != 'unlink') {
            if (changedFilesPath.indexOf(dataCallback.path) == -1) {
                // 判断当前是否有sftp和重启任务正在进行
                if (global.config.uploading) {
                    console.log('监控到文件变更（已有任务正在执行）: ' + dataCallback.path);
                    changedFilesPathToWait.push(dataCallback.path)
                } else {
                    watchFilesChanged = true;
                    console.log('监控到文件变更: ' + dataCallback.path);
                    // 将所有的变化文件push到变更数组中
                    changedFilesPath.push(dataCallback.path);
                }
            }
        } else {
            // 检测到了删除事件
        }
    });

};

// 是否开始了文件上传等待
var toStart = false;

// 按照配置配置的时 定时检查是否有更新文件
// 这个时间是批量上传的延时时间
// 例如 延迟时间是5秒 系统在0秒时发生了文件变化
// 在第5秒时发现文件又发生了变化 则系统会理解为
// 文件还在持续上传不会去立马推到目标服务器并重启
// 理论上系统在发现文件没有发生变化的两次间隔时间
// 大于指定延迟时间后才会去上传并重启服务
setInterval(function () {

    if (watchFilesChanged) {
        if (toStart) {
            return;
        }
        toStart = true;
        console.log('等待%s ms 后开始上传', global.config.system.watchDelayTime);
        // 发现了文件变更
        setTimeout(function () {
            watchFilesChanged = false;
            toStart = false;
            console.log('终止等待文件上传');
            sortChangedFile();
        }, global.config.system.watchDelayTime);
    }

}, 500);


// 这个任务是检查是否有堆积的文件变化情况
setInterval(function () {
    if (changedFilesPathToWait.length > 0) {
        if (!global.config.uploading) {

            // 发现有堆积的文件变化并且上传任务已经完成
            // 则将这些变化的文件推给任务进行处理

            console.log('堆积的文件变化开始处理');
            changedFilesPath = changedFilesPathToWait;
            watchFilesChanged = true;
            changedFilesPathToWait = [];
        }
    }
}, 1000);

/**
 * 将watch模块得到的所有文件变化汇总
 * 按照配置环境进行分类
 */
function sortChangedFile() {
    var changedSort = {};
    for (var index in changedFilesPath) {
        var path = changedFilesPath[index];
        var pathSplit = path.replace(watchRootPath, '').split(global.config.fileSeparator);
        var buildKey = '';
        for (var len = 1; len < 4; len++) {
            buildKey += global.config.fileSeparator + pathSplit[len];
        }
        if (!changedSort[buildKey]) {
            changedSort[buildKey] = [path];
        } else {
            changedSort[buildKey].push(path);
        }
    }
    changedFilesPath = [];
    var totalUploadTask = 0;
    for (var index in changedSort) {
        var servers = envConfig[index];
        for (var len in servers) {
            totalUploadTask++;
        }
    }
    // 写入全局变量中
    global.config.changedSort = changedSort;
    global.config.totalUploadTask = totalUploadTask;
}