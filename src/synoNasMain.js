/** 
 *  Synology NAS companion
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */

const config = require('../configs/config-SynoNasBridge.json');
const synoNasUserConnection = require('./synoNasUserConnections');
const synoNasTemperature = require('./synoNasTemperature');
const synoNasUpsBattery = require('./synoNasUpsBattery');
const synoLibrary = require('./synoLibrary');

const synoNasShare = require('./synoNasShare');
const storage = require('node-persist');
//storage.initSync();
const { bridge } = require('./synoNasBridge');
const hap = require("hap-nodejs");
const Service = hap.Service;
const Characteristic = hap.Characteristic;

async function buildNasUserConnections() {
    const queryNasShares = await synoLibrary.query({
        api: 'SYNO.Core.CurrentConnection',
        version: "1",
        method: 'list'
    });
    if (queryNasShares.data != null) {
        for (var key in queryNasShares.data['items']) {
            var bridgeAcc = bridge.bridgedAccessories.filter(function (obj) {
                return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value === queryNasShares.data['items'][key].who & obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.SerialNumber).value === queryNasShares.data['items'][key].from);
            });
            if (bridgeAcc.length === 0) {
                const dev = new synoNasUserConnection(queryNasShares.data['items'][key].who, queryNasShares.data['items'][key].from, queryNasShares.data['items'][key].type);
                bridge.addBridgedAccessories({
                    accessory: dev.getAccessory()
                });
            }
            else {
                var connectionAccessories = bridge.bridgedAccessories.filter(function (obj) {
                    return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.FirmwareRevision).value.includes('2.0.0'));
                });
                var res = connectionAccessories.filter(item1 =>
                    !queryNasShares.data['items'].some(item2 => (item2.who === item1.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value && item2.from === item1.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.SerialNumber).value)))
                if (res.length != 0) {
                    for (var key in res) {
                        bridge.removeBridgedAccessory(res[key]);
                    }
                }
            }
        }
    }
    else {
        console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
    }
}

async function buildNasSharesList() {
    const queryNasShares = await synoLibrary.query({
        'api': 'SYNO.Core.Share',
        'version': '1',
        'method': 'list',
        'additional': '["encryption"]'
    });
    if (queryNasShares.data != null) {
        for (var key in queryNasShares.data['shares']) {
            var bridgeAcc = bridge.bridgedAccessories.filter(function (obj) {
                return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value === queryNasShares.data['shares'][key].name);
            });
            if (bridgeAcc.length === 0) {
                const dev = new synoNasShare(queryNasShares.data['shares'][key].name);
                bridge.addBridgedAccessories({
                    accessory: dev.getAccessory()
                });
            }
            else {
                var connectionAccessories = bridge.bridgedAccessories.filter(function (obj) {
                    return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.FirmwareRevision).value.includes('1.0.0'));
                });
                var res = connectionAccessories.filter(item1 =>
                    !queryNasShares.data['shares'].some(item2 => (item2.name === item1.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value)))
                if (res.length != 0) {
                    for (var key in res) {
                        bridge.removeBridgedAccessory(res[key]);
                    }
                }
            }
        }
    }
    else {
        console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " empty payload: " + queryNasShares.data);
    }
}


bridge.addBridgedAccessories({
    accessory:  synoNasTemperature,synoNasUpsBattery
});

setInterval(async function f() {
    await buildNasUserConnections();
}, config.bridge.accessoryNasConnectedUser.refreshInterval * 1000);


setInterval(async function f() {
    await buildNasSharesList();
}, config.bridge.accessoryNasConnectedUser.refreshInterval * 1000);

buildNasUserConnections();
buildNasSharesList();

