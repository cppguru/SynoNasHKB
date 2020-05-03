const synoNasUserConnection = require('./synoNasUserConnections');
const synoNasTemperature = require('./synoNasTemperature');
const synoNasConnection = require('./synoNasConnection');
const { bridge } = require('./synoNasBridge');
const hap = require("hap-nodejs");
const Service = hap.Service;
const Characteristic = hap.Characteristic;
var existingNasUserConnectionsOnTheBridge = new Array();

async function buildNasUserConnections() {
    synoNasConnection.query('/webapi/entry.cgi', {
        api: 'SYNO.Core.CurrentConnection',
        version: "1",
        method: 'list'
    }, function (err, data) {
        if (err) return console.error(err);
        for (var key in data['data']['items']) {
            var bridgeAcc = bridge.bridgedAccessories.filter(function (obj) {
                return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value === data['data']['items'][key].who & obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.SerialNumber).value === data['data']['items'][key].from);
            });
            if (bridgeAcc.length === 0) {
                const dev = new synoNasUserConnection(data['data']['items'][key].who, data['data']['items'][key].from);
                bridge.addBridgedAccessories({
                    accessory: dev.getAccessory()
                });
            }
        }
    });
}

bridge.addBridgedAccessories({
    accessory: synoNasTemperature
});

setInterval(async function f() {
    await buildNasUserConnections();
}, 5 * 1000);

buildNasUserConnections();

