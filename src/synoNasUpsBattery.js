/** 
 *  Synology NAS companion
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */

const hap = require("hap-nodejs");
const config = require('../configs/config-SynoNasBridge.json');
const synoNasConnection = require('./synoNasConnection');
const Accessory = hap.Accessory;
const Characteristic = hap.Characteristic;
const CharacteristicEventTypes = hap.CharacteristicEventTypes;
const Service = hap.Service;

const accessoryUuid = hap.uuid.generate("synology.nas.host.ups");
const accessory = new Accessory(config.bridge.accessoryNasUps.label, accessoryUuid);
module.exports = accessory;

const nasUpsService = new Service.HumiditySensor(config.bridge.accessoryNasUps.label);
const nasUpsBatteryService = new Service.BatteryService(config.bridge.accessoryNasUps.label);

BATTERY = {
  manufacturer: "DM Industries",
  model: "Synology NAS UPS Status",
  serialNumber: "00000001",
  charge: 0,
  chargingState: 1,
  statusLowBattery: 0,
  duration: 0,
  getChargeLevel: function () {
    synoNasConnection.query('/webapi/entry.cgi', {
      api: 'SYNO.Core.ExternalDevice.UPS',
      version: 1,
      method: 'get'
    }, function (err, data) {
      if (err) {
        console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
        return console.error(err)
      }
      else {
        BATTERY.charge = parseInt(data['data']['charge']);
        BATTERY.duration = (parseInt(data['data']['runtime']) / 60);
        if (BATTERY.duration <= 20) {
          BATTERY.statusLowBattery = 1;
        }
        else {
          BATTERY.statusLowBattery = 0;
        }
        if (String(data['data']['status']).includes('online')) {
          BATTERY.chargingState = 1;
        }
        else {
          BATTERY.chargingState = 2;
        }
        //BATTERY.charge = parseInt(data['data']['charge']);
        accessory.getService(Service.AccessoryInformation)
          .setCharacteristic(Characteristic.Manufacturer, "Batt. Duration: " + BATTERY.duration)

        accessory.getService(Service.BatteryService).getCharacteristic(Characteristic.ChargingState).updateValue(BATTERY.chargingState);
        accessory.getService(Service.HumiditySensor).getCharacteristic(Characteristic.CurrentRelativeHumidity).updateValue(BATTERY.charge);
        accessory.getService(Service.BatteryService).getCharacteristic(Characteristic.StatusLowBattery).updateValue(BATTERY.statusLowBattery);
      }
    })
    console.log(config.bridge.accessoryNasUps.label + " - Checking charging state: " + BATTERY.chargingState);
    console.log(config.bridge.accessoryNasUps.label + " - Checking charge level: " + BATTERY.charge);
    console.log(config.bridge.accessoryNasUps.label + " - Checking battery status low: " + BATTERY.statusLowBattery);
    return BATTERY.charge;
  }
}


nasUpsService
  .getCharacteristic(Characteristic.CurrentRelativeHumidity)
  .on(CharacteristicEventTypes.GET, callback => {
    callback(undefined, BATTERY.getChargeLevel())
  });


accessory.addService(nasUpsService);
accessory.addService(nasUpsBatteryService);
console.log("Accessory " + config.bridge.accessoryNasUps.label + " created.")


setInterval(async function f() {
  BATTERY.getChargeLevel()
}, config.bridge.accessoryNasUps.refreshInterval * 1000);

