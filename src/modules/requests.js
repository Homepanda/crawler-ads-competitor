const PROXY = (process.env.PROXY_URL) ? process.env.PROXY_URL : false;
const rp = require('request-promise');
const j = rp.jar();

module.exports = async (link) => {
    try {
        console.log(`Call http request un url : ${link}`)
        let response = await rp({
            url: link,
            headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36' },
            method: 'GET',
            jar: j,
            gzip: true,
            //simple: false,
            proxy: PROXY
        });
        return response;
    } catch (error) {        
        throw error;
    }
}