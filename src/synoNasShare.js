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

module.exports = class ShareAccessory {
  constructor(name) {
    this.Outlet = {
      label: name,
      name: "Share:\r\n" + name,
      setState: function () {
        let callAction = null;
        if (this.state) {
          callAction = 'encrypt';
          this.state = false;
        } else {
          callAction = 'decrypt';
          this.state = true;
        }
        synoNasConnection.query('/webapi/entry.cgi', {
          api: 'SYNO.Core.Share.Crypto',
          version: "1",
          method: callAction,
          password: config.bridge.accessoryNasShare.encryptionKey,
          name: '"' + name + '"'
        }, function (err, data) {
          if (err) {
            console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
            return console.error(err)
          }
          else {
            console.log("Share - " + this.label + " mount state changed to: " + this.state);
          }
        }.bind(this));
        return this.state;
      },
      state: true,
      getState: function () {
        synoNasConnection.query('/webapi/entry.cgi', {
          api: 'SYNO.Core.Share',
          version: "1",
          method: 'list',
          additional: '["encryption"]'
        }, function (err, data) {
          if (err) {
            console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
            return console.error(err)
          }
          else {
            var foundUser = data['data']['shares'].filter(function (obj) {
              return obj.name === name & obj.encryption != 1;
            });
            if (foundUser.length === 1) {
              this.state = true;
            }
            else {
              this.state = false;
            }
            this.accessory.getService(Service.Outlet).getCharacteristic(Characteristic.On).updateValue(this.state);
          }
        }.bind(this));
        console.log("Share - " + this.label + " checking mount state: " + this.state);
        return this.state;
      },
      uuid: hap.uuid.generate("synology.nas.userconnections.Outlet" + name + Math.random().toString(36).substring(7)),
      accessory: null
    };
    console.log("Accessory " + name + " " + config.bridge.accessoryNasShare.label + " created.");
  }

  getAccessory() {
    if (!this.Outlet.accessory) {
      let acc;
      acc = new Accessory(this.Outlet.name, this.Outlet.uuid);
      acc.username = this.Outlet.username;
      acc.pincode = this.Outlet.pincode;
      acc
        .addService(Service.Outlet, this.Outlet.name)
        .getCharacteristic(Characteristic.On)
        .on('set', async (value, cb) => {
          await this.Outlet.setState(value);
          cb();
        })
        .on('get', async (cb) => {
          cb(null, await this.Outlet.getState());
        });
      acc.getService(Service.AccessoryInformation)
        //   .setCharacteristic(Characteristic.Manufacturer, this.Outlet.type + "-" + this.Outlet.descr)
        .setCharacteristic(Characteristic.Model, this.Outlet.label)
        //   .setCharacteristic(Characteristic.SerialNumber, this.Outlet.from)
        .setCharacteristic(Characteristic.FirmwareRevision, "1.0.0");



      this.Outlet.accessory = acc;
      return acc;
    } else return this.Outlet.accessory;
  }
}