/**
 * Created by Zxy on 2016/11/25.
 */
var gulp = require('gulp'),
    cmd = require('../shell_cmd/cmd'),
    sftp = require('gulp-sftp');

var envConfig = global.config.envConfig;
var watchRootPath = global.config.system.watchRootPath;


// 处理完成的任务数量
var completedUploadTask = 0;

function upload(changedSort) {
    for (var index in changedSort) {
        var servers = envConfig[index];
        for (var len in servers) {
            var uploadInfo = {};
            uploadInfo.changedFile = changedSort[index];
            uploadInfo.base = watchRootPath + index;
            uploadInfo.server = servers[len]
            uploadAndRestart(uploadInfo);
        }
    }
}

function uploadAndRestart(uploadInfo) {
    var server = uploadInfo.server;
    gulp.src(uploadInfo.changedFile, {base: uploadInfo.base}).pipe(
        sftp({
            host: server.host,
            user: server.user,
            pass: server.pass,
            port: server.port,
            remotePath: server.remotePath,
            callback: function () {
                cmd.exe(server.cmd, function () {
                    completedUploadTask++;
                    console.log(
                        '目录: ' + uploadInfo.base
                        + ' 已成功上传至: [' + server.host + '] 并重启完成 当前完成任务数: '
                        + completedUploadTask
                        + ' 需要完成任务数: ' + global.config.totalUploadTask
                    );
                });
            }
        })
    );
}

// 这个定时任务在一直查看是否需要做上传处理
setInterval(function () {

    if (global.config.uploading) {
        // 已经有任务开始执行
        return;
    }

    if (global.config.totalUploadTask > 0) {
        console.log('开始上传文件 需要处理的任务数量: ' + global.config.totalUploadTask);
        global.config.uploading = true;
        upload(global.config.changedSort);

    }
}, 1);

// 这个定时任务在一直查看如果有上传任务是否已经全部完成
setInterval(function () {
    if (!global.config.uploading) {
        // 没有任务执行
        return;
    }

    if (global.config.totalUploadTask == completedUploadTask) {
        // 所有任务已经完成
        global.config.totalUploadTask = completedUploadTask = 0;
        global.config.uploading = false;
        global.config.changedSort = {};
        console.log('所有任务上传完毕');
    } else {
        console.log('任务处理中');
    }
}, 500);