/**
 * Created by Zxy on 2016/11/25.
 */
var os = require('os');
var fs = require('fs');
var util = require('util');


// const BASE_CONFIG_PATH = 'E:\\data';
const BASE_CONFIG_PATH = '/home/dev/autoDeploy/config';

const CFG_FILE_LIST = {
    system: 'system.json',
    servers: 'servers.json',
    envs: 'envs.json',
};


function readFileSync(fileName) {
    return fs.readFileSync(BASE_CONFIG_PATH + '/' + fileName, 'utf8');
}

global.config = {};
global.config.changedSort = {};
global.config.totalUploadTask = 0;

/**
 * 加載配置文件信息
 */
function loadConfig() {

    console.log('配置加载...');
    // 读取所有配置文件
    for (jsonKey in CFG_FILE_LIST) {
        try {
            global.config[jsonKey] = JSON.parse(readFileSync(CFG_FILE_LIST[jsonKey]));
        } catch (e) {
            console.error('load config error: ', e);
            break;
        }
    }

    // 读取完毕后处理这些简单的配置文件将一些属性组装处理下以备后面方便使用
    disposeConfig();
    console.log('配置文件处理完毕: ');
    console.log(JSON.stringify(global.config.envConfig, null, 4));
}

module.exports.loadConfig = loadConfig;

function disposeConfig() {

    var osType = os.platform();

    var fileSeparator = '/';

    if (osType.startsWith('win')) {
        fileSeparator = '\\';
    }

    global.config.fileSeparator = fileSeparator;

    var config = global.config;

    var envs = config.envs;

    var servers = config.servers;

    var envConfig = {};

    // 平台
    var platform;
    // 环境
    var env;
    // 模块
    var module;
    // 服务器
    var server;
    // 服务器配置
    var serverConfig;

    var cmd;

    // 遍历平台配置 - cbank / funpay
    for (var platformKey in envs) {
        platform = envs[platformKey];

        // 遍历环境配置 - dev / test
        for (var envKey in platform) {
            env = platform[envKey];

            // 遍历模块配置 - order / merchant
            for (var moduleKey in env) {
                module = env[moduleKey];

                var configKey = fileSeparator + platformKey + fileSeparator + envKey + fileSeparator + moduleKey;
                var configServer = [];

                // 遍历服务器配置 - 10.43.1.189 /10.43.1.188
                for (var serverKey in module) {
                    serverConfig = module[serverKey];
                    cmd = serverConfig.cmd;

                    // 类似的 deep copy
                    server = util._extend({}, servers[serverKey]);

                    server.remotePath = serverConfig.remotePath;
                    server.cmd = buildRestartCommand(server, cmd.startShellName, cmd.stopShellName);
                    configServer.push(server);

                }
                envConfig[configKey] = configServer;
            }
        }
    }
    global.config.envConfig = envConfig;
}

/**
 * 创建重启应用的命令
 */
function buildRestartCommand(server, startShellName, stopShellName) {

    var host = server.host;
    var port = server.port;
    var user = server.user;
    var pass = server.pass;

    var cmd = "sshpass -p ";
    cmd += "'" + pass + "' ";
    cmd += "ssh " + user + "@" + host + " ";
    cmd += "-p " + port + " ";
    cmd += "'cd " + server.remotePath + " && ";
    cmd += "sh " + stopShellName + " && ";
    cmd += "sh " + startShellName + "'";

    return cmd;
}