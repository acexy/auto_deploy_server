/**
 * Created by Zxy on 2016/11/25.
 */
var os = require('os');
var fs = require('fs');
var util = require('util');


global.config = {};
global.config.uploading = false;

const BASE_CONFIG_PATH = '/home/dev/autoDeploy/config';

const CFG_FILE_LIST = {
    system: 'system.json',
    servers: 'servers.json',
    envs: 'envs.json',
};


function readFileSync(fileName) {
    try {
        return fs.readFileSync(BASE_CONFIG_PATH + '/' + fileName, 'utf8');
    } catch (e) {
        console.log(('加载配置文件异常: ' + BASE_CONFIG_PATH + '/' + fileName).yellow);
    }
}

/**
 * 加載配置文件信息
 */
function loadConfig() {

    console.log('配置加载...'.white);
    // 读取所有配置文件
    for (jsonKey in CFG_FILE_LIST) {
        try {
            var content = readFileSync(CFG_FILE_LIST[jsonKey]);
            if(!content){
                continue;
            }
            global.config[jsonKey] = JSON.parse(content);
        } catch (e) {
            console.info(('配置文件内容错误: ' + content).yellow, e);
            continue;
        }
    }
    if(Object.keys(global.config).length == 3){
        console.log('未能成功的加载到配置文件信息，程序退出'.red);
        process.exit();
        return;
    }

    // 读取完毕后处理这些简单的配置文件将一些属性组装处理下以备后面方便使用
    disposeConfig();
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

    // 平台 环境 模块 服务器 服务器配置
    var platform, env, module, server, serverConfig, cmd;

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