/**
 * Created by Zxy on 2016/11/24.
 */

var process = require('child_process');

module.exports.exe = function (cmd, cb) {

    try {
        process.exec(cmd, function (error, stdout, stderr) {

            if (error !== null) {
                console.info('exec cmd error: ' + error);
            }

            console.log(stdout);
            console.log(stderr);
            cb();
        });
    } catch (e){
        console.log(e);
        cb();
    }


};