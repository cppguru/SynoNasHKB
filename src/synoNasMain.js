const config = require('../configs/config-SynoNasBridge.json');
const synoNasUserConnection = require('./synoNasUserConnections');
const synoNasTemperature = require('./synoNasTemperature');
const synoNasConnection = require('./synoNasConnection');
const synoNasUpsBattery = require('./synoNasUpsBattery');
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
buildNasUserConnections();

