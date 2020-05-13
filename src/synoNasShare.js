/** 
 *  Synology NAS companion
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */

const hap = require('hap-nodejs');
const config = require('../configs/config-SynoNasBridge.json');
const synoLibrary = require('./synoLibrary');
const Accessory = hap.Accessory;
const Characteristic = hap.Characteristic;
const Service = hap.Service;

module.exports = class ShareAccessory {
  constructor(name) {
    this.GarageDoorOpener = {
      label: name,
      name: "Share:\r\n" + name,
      setState: async function () {
        let callAction = null;
        if (this.state) {
          callAction = 'encrypt';
          this.state = false;
        } else {
          callAction = 'decrypt';
          this.state = true;
        }
        const queryNasShares = await synoLibrary.query({
          'api': 'SYNO.Core.Share.Crypto',
          'version': '1',
          'method': callAction,
          'password': config.bridge.accessoryNasShare.encryptionKey,
          'name': '"' + name + '"'
        });
        if (queryNasShares != null) {
          if (queryNasShares.success === true) {
            if (this.state) {
              this.accessory.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.CurrentDoorState)
                .updateValue(0);

              this.accessory.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.TargetDoorState)
                .updateValue(0);
            }
            else {
              this.accessory.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.CurrentDoorState)
                .updateValue(1);

              this.accessory.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.TargetDoorState)
                .updateValue(1);
            }
            console.log("Share - " + this.label + " mount state changed to: " + this.state);
          }
          else {
            console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
          }
        }
        return this.state;
      },
      state: true,
      getState: async function () {
        const queryNasShares = await synoLibrary.query({
          'api': 'SYNO.Core.Share',
          'version': '1',
          'method': 'list',
          'additional': '["encryption"]'
        });
        //console.log(queryNasShares);
        if (queryNasShares.data != null) {
          var foundUser = queryNasShares.data['shares'].filter(function (obj) {
            return obj.name === name & obj.encryption != 1;
          });
          if (foundUser.length === 1) {
            this.state = true;
            this.accessory.getService(Service.GarageDoorOpener)
              .getCharacteristic(Characteristic.CurrentDoorState)
              .updateValue(0);

            this.accessory.getService(Service.GarageDoorOpener)
              .getCharacteristic(Characteristic.TargetDoorState)
              .updateValue(0);
          }
          else {
            this.state = false;
            this.accessory.getService(Service.GarageDoorOpener)
              .getCharacteristic(Characteristic.CurrentDoorState)
              .updateValue(1);

            this.accessory.getService(Service.GarageDoorOpener)
              .getCharacteristic(Characteristic.TargetDoorState)
              .updateValue(1);
          }
        }
        else {
          console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " empty payload: " + data);
        }
        //return this.state;
      },
      uuid: hap.uuid.generate("synology.nas.userconnections.GarageDoorOpener" + name),
      accessory: null
    };
    console.log("Accessory " + name + " " + config.bridge.accessoryNasShare.label + " created.");
  }

  getAccessory() {
    if (!this.GarageDoorOpener.accessory) {
      let acc;
      acc = new Accessory(this.GarageDoorOpener.name, this.GarageDoorOpener.uuid);
      acc.username = this.GarageDoorOpener.username;
      acc.pincode = this.GarageDoorOpener.pincode;
      acc
        .addService(Service.GarageDoorOpener, this.GarageDoorOpener.name)
      acc.getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.TargetDoorState, 0)
        .setCharacteristic(Characteristic.TargetPosition, 0)
        .setCharacteristic(Characteristic.ObstructionDetected, false);
      acc.getService(Service.GarageDoorOpener)
        .getCharacteristic(Characteristic.TargetDoorState)
        .on('set', async (value, cb) => {
          await this.GarageDoorOpener.setState(value);
          cb();
        })
      acc.getService(Service.GarageDoorOpener)
        .getCharacteristic(Characteristic.CurrentDoorState)
        .on('get', async (cb) => {
          cb(null, await this.GarageDoorOpener.getState());
        });
      acc.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Model, this.GarageDoorOpener.label)
        .setCharacteristic(Characteristic.FirmwareRevision, "1.0.0");

      this.GarageDoorOpener.accessory = acc;
      return acc;
    } else return this.GarageDoorOpener.accessory;
  }
}