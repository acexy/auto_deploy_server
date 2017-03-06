/**
 * Created by Zxy on 2016/11/25.
 *
 * 监听指定文件目录的变化情况
 *
 */
var watch = require('gulp-watch');

var upload = require('./upload');

var watchRootPath = global.config.system.watchRootPath;
var envConfig = global.config.envConfig;

// 发生文件变动的汇总Array
var changedFilesPathArray = [];

// timeout 函数用于文件变更完毕后触发上传
var startUploadTimer;

// 正在执行上传动作
var uploading = false;

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

    console.log('开始监听以下目录: '.green);
    console.log((JSON.stringify(watchAllPath, null, 4)).white);

    watch(watchAllPath, {
        events: ['change', 'add'],
        awaitWriteFinish: {
            stabilityThreshold: 3000,
            pollInterval: 100
        }
    }, function (dataCallback) {
        if (changedFilesPathArray.indexOf(dataCallback.path) == -1) {
            console.log(('监控到文件变更: ' + dataCallback.path).green);
            changedFilesPathArray.push(dataCallback.path);
        }
        clearTimeout(startUploadTimer);
        startUploadTimer = setTimeout(startUpload, global.config.system.watchDelayTime);
    });
};

// 开启上传
function startUpload() {
    // 验证并处理发生变化的文件
    console.log(uploading);
    while (!uploading) {
        console.log('文件变更终止,开始上传'.red);
        verificationChangedFiles(changedFilesPathArray);
        changedFilesPathArray = [];
        uploading = true;
        return;
    }
}

/**
 * 将watch模块得到的所有文件变化汇总
 * 按照配置环境进行分类
 */
function verificationChangedFiles(changedFiles) {

    var changedFilesPath = {};

    for (var index in changedFiles) {
        var path = changedFiles[index];
        if (!path) {
            continue;
        }
        var pathSplit = path.replace(watchRootPath, '').split(global.config.fileSeparator);
        var buildKey = '';
        for (var len = 1; len < 4; len++) {
            buildKey += global.config.fileSeparator + pathSplit[len];
        }
        if (!changedFilesPath[buildKey]) {
            changedFilesPath[buildKey] = [path];
        } else {
            changedFilesPath[buildKey].push(path);
        }
    }

    var totalTasks = 0;
    for (var index in changedFilesPath) {
        var servers = envConfig[index];
        for (var len in servers) {
            totalTasks++;
        }
    }

    upload.upload(changedFilesPath, totalTasks, uploading);
}