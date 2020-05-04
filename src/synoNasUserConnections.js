/** 
 *  Synology RT2600ac and MR2200ac router companion
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

module.exports = class SwitchAccessory {
  constructor(name, from, type, descr) {
    this.Switch = {
      name,
      from,
      type,
      descr,
      manufacturer: "DM Industries",
      model: "Synology Nas Connected Users",
      serialNumber: "00000001", //serial number (optional)
      state: false,
      setState: function () {
        if (this.state == true) {
          this.state = false;
          synoNasConnection.query('/webapi/entry.cgi', {
            api: 'SYNO.Core.CurrentConnection',
            version: "1",
            method: 'kick_connection',
            http_conn: '[{"who":"' + this.name + '","from":"' + this.from + '"}]'
          }, function (err, data) {
            if (err) return console.error(err);
            bridge.removeBridgedAccessory(this.accessory);
            console.log("Disconnecting User: " + this.name + " " + this.state);
          }.bind(this));
        }
        return this.state;
      },
      state: true,
      getState: function () {
        synoNasConnection.query('/webapi/entry.cgi', {
          api: 'SYNO.Core.CurrentConnection',
          version: "1",
          method: 'list'
        }, function (err, data) {
          if (err) return console.error(err);
          var foundUser = data['data']['items'].filter(function (obj) {
            return obj.who === name;
          });
          if (foundUser.length === 1) {
            this.state = true;
          }
          else {
            this.state = false;
          }
          this.accessory.getService(Service.Switch).getCharacteristic(Characteristic.On).updateValue(this.state);
        }.bind(this));
        console.log("Getting User: " + this.name + " connection State: " + this.state);
        return this.state;
      },
      uuid: hap.uuid.generate("synology.nas.userconnections.switch" + name + Math.random().toString(36).substring(7)),
      accessory: null
    };
    console.log("Accessory " + name + " " + config.bridge.accessoryNasConnectedUser.label + " created.");
  }

  getAccessory() {
    if (!this.Switch.accessory) {
      let acc;
      acc = new Accessory(this.Switch.name, this.Switch.uuid);
      acc.username = this.Switch.username;
      acc.pincode = this.Switch.pincode;
      acc
        .addService(Service.Switch, this.Switch.name)
        .getCharacteristic(Characteristic.On)
        .on('set', async (value, cb) => {
          await this.Switch.setState(value);
          cb();
        })
        .on('get', async (cb) => {
          cb(null, await this.Switch.getState());
        });
      acc.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Manufacturer, this.Switch.type + "-" + this.Switch.descr)
        .setCharacteristic(Characteristic.Model, this.Switch.name)
        .setCharacteristic(Characteristic.SerialNumber, this.Switch.from)
      //.setCharacteristic(Characteristic.FirmwareRevision, require('./package.json').version);



      this.Switch.accessory = acc;
      return acc;
    } else return this.Switch.accessory;
  }
}