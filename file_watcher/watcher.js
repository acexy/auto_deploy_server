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

// 当前发现的文件更改数量
var currChangedCount = 0;

// 上次检测发现的文件更改数量
var lastChangedCount = 0;

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
                watchFilesChanged = true;
                console.log('监控到文件变更: ' + dataCallback.path);
                // 将所有的变化文件push到变更数组中
                changedFilesPath.push(dataCallback.path);
            }
        }
    });

};


// 按照配置配置的时 定时检查是否有更新文件
// 这个时间是批量上传的延时时间
// 例如 延迟时间是5秒 系统在0秒时发生了文件变化
// 在第5秒时发现文件又发生了变化 则系统会理解为
// 文件还在持续上传不会去立马推到目标服务器并重启
// 理论上系统在发现文件没有发生变化的两次间隔时间
// 大于指定延迟时间后才会去上传并重启服务
setInterval(function () {

    if (!watchFilesChanged) {
        return;
    }

    lastChangedCount = currChangedCount;
    currChangedCount = changedFilesPath.length;

    if (lastChangedCount == currChangedCount) {
        console.log('终止等待文件上传,此次变更文件汇总: ');
        // 对发生变化的文件进行各个环境分类
        sortChangedFile();
    } else {
        console.log('等待所有文件上传完毕...');
    }

}, global.config.system.watchDelayTime);

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


    lastChangedCount = currChangedCount = 0;
    changedFilesPath = [];
    watchFilesChanged = false;

    console.log(changedSort);

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