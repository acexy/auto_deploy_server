# auto_deploy 基于 node gulp及watch组件

    自动部署工程，上传code到目标服务器，执行远程ssh重启应用（用于实际开发中部署各个环境的服务，减少部署成本）
    Gulp介绍（中文）： http://www.gulpjs.com.cn/ 
    github（英文）： https://github.com/gulpjs/gulp    
### 背景
---
    在开发node端项目时接触到gulp，node端的代码部署方式非常简单，由于node是脚本非编译类型的代码，
    所以每次需要更新开发测试环境的代码时，只需要在本地执行一条gulp deployDev（配置的任务名），则将自动将本地代码push
    到服务器上。那么对于咱们部署代码就还差一步就完成了，那就是再重启服务。美好的事情就是node pm2 
    https://www.npmjs.com/package/pm2 （pm2 是一个带有负载均衡功能的Node应用的进程管理器.）实现了watch
    （监听文件变化的功能），它能发现code发生变化后自动重启应用。那么所有的部署最终变成了一句命令，你只需要把你
    的代码push到服务器上那么pm2就自动重启了，部署就那么那么的方便简单。对于后端java应用，由于我们是新应用我们
    要从无部署到各个环境很耗时，很烦，每次都要耗费大量时间，那么为什么我们不能利用gulp思想，node的部署方式实现
    push代码就完事，服务器什么的自动给我重启就好了？
