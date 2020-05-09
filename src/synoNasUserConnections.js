/** 
 *  Synology NAS companion
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */

const hap = require('hap-nodejs');
const config = require('../configs/config-SynoNasBridge.json');
const synoNasConnection = require('./synoNasConnection');
const Accessory = hap.Accessory;
const Characteristic = hap.Characteristic;
const Service = hap.Service;
const { bridge } = require('./synoNasBridge');

module.exports = class DoorAccessory {
  constructor(name, from, type, descr) {
    this.Door = {
      label: name,
      name: 'Usr: ' + name.substring(0, 6) + '\r\n' + type.substring(0, 4) + ': ' + from.substring(from.length - 4),
      from,
      type,
      descr,
      manufacturer: "DM Industries",
      model: "Synology Nas Connected Users",
      serialNumber: "00000001", //serial number (optional)
      setState: function () {
        if (this.state == true) {
          this.state = false;
          synoNasConnection.query('/webapi/entry.cgi', {
            api: 'SYNO.Core.CurrentConnection',
            version: "1",
            method: 'kick_connection',
            http_conn: '[{"who":"' + this.name + '","from":"' + this.from + '"}]'
          }, function (err, data) {
            if (err) {
              console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
              return console.error(err)
            }
            else {
              bridge.removeBridgedAccessory(this.accessory);
              console.log("Disconnecting User: " + this.name + " " + this.state);
            }
          }.bind(this));
        }
        return this.state;
      },
      state: true,
      getState: function () {
        // synoNasConnection.query('/webapi/entry.cgi', {
        //   api: 'SYNO.Core.CurrentConnection',
        //   version: "1",
        //   method: 'list'
        // }, function (err, data) {
        //   if (err) {
        //     console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
        //     return console.error(err)
        //   }
        //   else {
        //     var foundUser = data['data']['items'].filter(function (obj) {
        //       return obj.who === name & obj.from === from;
        //     });
        //     if (foundUser.length === 1) {
        //       this.state = true;
        //     }
        //     else {
        //       this.state = false;
        //       bridge.removeBridgedAccessory(this.accessory);
        //     }
        //     this.accessory.getService(Service.Door).getCharacteristic(Characteristic.On).updateValue(this.state);
        //   }
        // }.bind(this));
        // console.log("Getting User: " + this.name + " connection State: " + this.state);
        return this.state;
      },
      uuid: hap.uuid.generate("synology.nas.userconnections.Door" + name + Math.random().toString(36).substring(7)),
      accessory: null
    };
    console.log("Accessory " + name + " " + config.bridge.accessoryNasConnectedUser.label + " created.");
  }

  getAccessory() {
    if (!this.Door.accessory) {
      let acc;
      acc = new Accessory(this.Door.name, this.Door.uuid);
      acc.username = this.Door.username;
      acc.pincode = this.Door.pincode;
      acc
        .addService(Service.Door, this.Door.name)
      acc.getService(Service.Door)
        .setCharacteristic(Characteristic.TargetDoorState, 100)
        .setCharacteristic(Characteristic.TargetPosition, 100)
        .setCharacteristic(Characteristic.CurrentPosition, 100);
      acc.getService(Service.Door)
        .getCharacteristic(Characteristic.TargetPosition)
        .on('set', async (value, cb) => {
          await this.Door.setState(value);
          cb();
        })
      acc.getService(Service.Door)
        .getCharacteristic(Characteristic.TargetDoorState)
        .on('get', async (cb) => {
          cb(null, await this.Door.getState());
        });
      acc.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Manufacturer, this.Door.type + "-" + this.Door.descr)
        .setCharacteristic(Characteristic.Model, this.Door.label)
        .setCharacteristic(Characteristic.SerialNumber, this.Door.from)
        .setCharacteristic(Characteristic.FirmwareRevision, "2.0.0");
      this.Door.accessory = acc;
      return acc;
    } else return this.Door.accessory;
  }
}