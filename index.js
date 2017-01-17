/**
 * Created by Zxy on 2016/11/22.
 */
require('colour');
require('./config/loader').loadConfig();
// 引入文件监听
require('./file_watcher/watcher').watch();
// 引入sftp上传
require('./source_upload/upload');