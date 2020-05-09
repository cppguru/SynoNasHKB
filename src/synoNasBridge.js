/** 
 *  Synology NAS companion
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */

 const config = require('../configs/config-SynoNasBridge.json');
const { Bridge, uuid, Categories } = require('hap-nodejs');


exports.bridge = bridge = new Bridge('Synology NAS-HKB', uuid.generate('Synology NAS-HKB'));

bridge.publish({
  username: config.bridge.mac,
  port: config.bridge.port,
  pincode: config.bridge.pincode,
  category: Categories.BRIDGE
});


console.log(config.bridge.name + " HomeKit Bridge published!");

