
/** 
 *  Synology NAS companion
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */


const config = require('../configs/config-SynoNasBridge.json');
const axios = require('axios').default;
const querystring = require('querystring');
let sid = null;

function auth() {
    let data = querystring.stringify({
        'api': 'SYNO.API.Auth',
        'version': '2',
        'method': 'login',
        'account': config.nas.username,
        'passwd': config.nas.password,
        'session': 'DownloadStation',
        'format': 'sid'
    })
    return axios.post(config.nas.fqdn + ':' + config.nas.port + '/webapi/auth.cgi', data)
}

exports.query = async function querySyno(payload, path) {
    if (!path) {
        path = '/webapi/entry.cgi';
    }
    if (!sid) {
        const authToken = await auth();
        if (authToken.data['success'] === true) {
            //console.log(authToken.data['data']['sid']);
            sid = authToken.data['data']['sid'];
            payload._sid = sid;
            //console.log(sid);
        }
    }
    payload._sid = sid
    payload = querystring.stringify(payload);
    const result = await axios.post(config.nas.fqdn + ':' + config.nas.port + path, payload);
    //console.log(result);
    if (result.data['success'] === true) {
        return result.data;
    }
    else {
        console.log('Failed while querying ' + config.nas.fqdn + ' at ' + path);
    }
}

