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

const accessoryUuid = hap.uuid.generate("synology.nas.host.temperature");
const accessory = new Accessory(config.bridge.accessoryNasTemperature.label, accessoryUuid);
module.exports = accessory;

const nasTemperatureService = new Service.TemperatureSensor(config.bridge.accessoryNasTemperature.label);

SENSOR = {
  manufacturer: "DM Industries",
  model: "Synology NAS Host Temperature",
  serialNumber: "00000001",

  currentTemperature: 0,
  getTemperature: function () {
    synoNasConnection.query('/webapi/entry.cgi', {
      api: 'SYNO.Core.System',
      version: 1,
      method: 'info'
    }, function (err, data) {
      if (err) {
        console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
        return console.error(err)
      }
      else {
        if (data['data'] != null) {
          SENSOR.currentTemperature = parseFloat(data['data']['sys_temp']);
          accessory.getService(Service.TemperatureSensor).getCharacteristic(Characteristic.On).updateValue(SENSOR.currentTemperature);
        }
        else {
          console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " empty payload: " + data);
        }
      }
    });
    console.log(config.bridge.accessoryNasTemperature.label + " - Checking current temperature: " + SENSOR.currentTemperature);
    return SENSOR.currentTemperature;
  }
}

//const temperatureCharacteristic = nasTemperatureService.getCharacteristic(Characteristic.CurrentTemperature);
//nasTemperatureService.setCharacteristic(Characteristic.Manufacturer, SENSOR.manufacturer);
//nasTemperatureService.setCharacteristic(Characteristic.Model, SENSOR.model)
//nasTemperatureService.setCharacteristic(Characteristic.SerialNumber, SENSOR.serialNumber);
nasTemperatureService
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on(CharacteristicEventTypes.GET, callback => {
    callback(undefined, SENSOR.getTemperature())
  });


accessory.addService(nasTemperatureService); // adding the service to the accessory

console.log("Accessory " + config.bridge.accessoryNasTemperature.label + " created.");

setInterval(async function f() {
  await SENSOR.getTemperature();
}, config.bridge.accessoryNasTemperature.refreshInterval * 1000);
