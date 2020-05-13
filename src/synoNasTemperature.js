/** 
 *  Synology NAS companion
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */

const hap = require("hap-nodejs");
const config = require('../configs/config-SynoNasBridge.json');
const synoLibrary = require('./synoLibrary');
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
  getTemperature: async function () {
    const queryNasTemperature = await synoLibrary.query({
      api: 'SYNO.Core.System',
      version: 1,
      method: 'info'
    });
    if (queryNasTemperature.data != null) {
      SENSOR.currentTemperature = parseFloat(queryNasTemperature.data['sys_temp']);
      accessory.getService(Service.TemperatureSensor).getCharacteristic(Characteristic.On).updateValue(SENSOR.currentTemperature);
    }
    else {
      console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn);
    }
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
  .on(CharacteristicEventTypes.GET,async callback => {
    callback(undefined, await SENSOR.getTemperature())
  });


accessory.addService(nasTemperatureService); // adding the service to the accessory

console.log("Accessory " + config.bridge.accessoryNasTemperature.label + " created.");

setInterval(async function f() {
  await SENSOR.getTemperature();
}, config.bridge.accessoryNasTemperature.refreshInterval * 1000);
