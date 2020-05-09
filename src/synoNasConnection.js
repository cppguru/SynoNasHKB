/** 
 *  Synology NAS companion
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */

const config = require('../configs/config-SynoNasBridge.json');
const Syno = require('synology');

module.exports = new Syno({
    host: config.nas.fqdn,
    port: config.nas.port,
    secure: config.nas.https,
    user: config.nas.username,
    password: config.nas.password
  })