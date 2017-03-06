/**
 * Created by Zxy on 2016/11/25.
 */
var gulp = require('gulp'),
    cmd = require('../shell_cmd/cmd'),
    sftp = require('gulp-sftp');

var envConfig = global.config.envConfig;
var watchRootPath = global.config.system.watchRootPath;

// 处理完成的任务数量
var completedUploadTasks = 0;
var taskInterval;

module.exports.upload = function (changedFilesPath, totalTasks, uploading) {
    console.log(('开始上传文件 需要处理的任务数量: ' + totalTasks).yellow);
    for (var index in changedFilesPath) {
        var servers = envConfig[index];
        for (var len in servers) {
            var uploadServersInfo = {};
            uploadServersInfo.changedFile = changedFilesPath[index];
            uploadServersInfo.base = watchRootPath + index;
            uploadServersInfo.server = servers[len];
            uploadAndRestart(uploadServersInfo, totalTasks);
        }
    }

    taskInterval = setInterval(function () {
        if (completedUploadTasks == totalTasks) {
            clearInterval(taskInterval);
            console.log(uploading)
            uploading = false;
            console.log(uploading)
            console.log();
            console.log(('所有上传任务执行完毕总计: ' + totalTasks).green);
            console.log();
        }
    }, 500);
};

function uploadAndRestart(uploadServersInfo, totalTasks) {
    var server = uploadServersInfo.server;
    gulp.src(uploadServersInfo.changedFile, {base: uploadServersInfo.base}).pipe(
        sftp({
            host: server.host,
            user: server.user,
            pass: server.pass,
            port: server.port,
            remotePath: server.remotePath,
            callback: function () {
                cmd.exe(server.cmd, function () {
                    completedUploadTasks++;
                    console.log(
                        '目录: ' + uploadServersInfo.base
                        + (' 已成功上传至: [' + server.host + '] 并重启完成 ').green + ('当前完成任务数: '
                        + completedUploadTasks).yellow
                        + (' 需要完成任务数: ' + totalTasks).red
                    );
                });
            }
        })
    );
}