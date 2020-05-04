const config = require('../configs/config-SynoNasBridge.json');
const synoNasUserConnection = require('./synoNasUserConnections');
const synoNasTemperature = require('./synoNasTemperature');
const synoNasConnection = require('./synoNasConnection');
const synoNasUpsBattery = require('./synoNasUpsBattery');
const synoNasShare = require('./synoNasShare');
const { bridge } = require('./synoNasBridge');
const hap = require("hap-nodejs");
const Service = hap.Service;
const Characteristic = hap.Characteristic;

async function buildNasUserConnections() {
    synoNasConnection.query('/webapi/entry.cgi', {
        api: 'SYNO.Core.CurrentConnection',
        version: "1",
        method: 'list'
    }, function (err, data) {
        if (err) {
            console.log("!!! ERROR WHILE TALKING TO " + config.nas.fqdn + " " + err);
            return console.error(err)
        }
        else {
            for (var key in data['data']['items']) {
                var bridgeAcc = bridge.bridgedAccessories.filter(function (obj) {
                    return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value === data['data']['items'][key].who & obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.SerialNumber).value === data['data']['items'][key].from);
                });
                if (bridgeAcc.length === 0) {
                    const dev = new synoNasUserConnection(data['data']['items'][key].who, data['data']['items'][key].from, data['data']['items'][key].type);
                    bridge.addBridgedAccessories({
                        accessory: dev.getAccessory()
                    });
                }
                else {
                    var connectionAccessories = bridge.bridgedAccessories.filter(function (obj) {
                        return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.FirmwareRevision).value.includes('2.0.0'));
                    });
                    var res = connectionAccessories.filter(item1 =>
                        !data['data']['items'].some(item2 => (item2.who === item1.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value && item2.from === item1.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.SerialNumber).value)))
                    if (res.length != 0) {
                        for (var key in res) {
                            bridge.removeBridgedAccessory(res[key]);
                        }
                    }
                }
            }
        }
    });
}

async function buildNasSharesList() {
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
            for (var key in data['data']['shares']) {
                var bridgeAcc = bridge.bridgedAccessories.filter(function (obj) {
                    return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value === data['data']['shares'][key].name);
                });
                if (bridgeAcc.length === 0) {
                    const dev = new synoNasShare(data['data']['shares'][key].name);
                    bridge.addBridgedAccessories({
                        accessory: dev.getAccessory()
                    });
                }
                else {
                    var connectionAccessories = bridge.bridgedAccessories.filter(function (obj) {
                        return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.FirmwareRevision).value.includes('1.0.0'));
                    });
                    var res = connectionAccessories.filter(item1 =>
                        !data['data']['shares'].some(item2 => (item2.name === item1.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value)))
                    if (res.length != 0) {
                        for (var key in res) {
                            bridge.removeBridgedAccessory(res[key]);
                        }
                    }
                }
            }
        }
    });
}


bridge.addBridgedAccessories({
    accessory: synoNasUpsBattery, synoNasTemperature
});

setInterval(async function f() {
    await buildNasUserConnections();
}, config.bridge.accessoryNasConnectedUser.refreshInterval * 1000);


setInterval(async function f() {
    await buildNasSharesList();
}, config.bridge.accessoryNasConnectedUser.refreshInterval * 1000);

buildNasUserConnections();
buildNasSharesList();
