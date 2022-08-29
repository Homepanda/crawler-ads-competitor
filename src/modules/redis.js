const redis = require("redis");
const client = redis.createClient({
  host: "127.0.2.1",
  port: 6379,
  prefix: "homepanda-ads-competitor:"
});

client.on("error", function(err) {
  console.log("Error " + err);
  process.exit(1);
});

class Redis {

    async getAds(provider) {
        return new Promise((resolve, reject) => {
            client.get(provider, (err, data) => {
              if (err) {
                reject(err);
              } else {          
                resolve((data !== null) ? JSON.parse(data) : data);
              }
            });
        });
    }

    async setAds(provider, data) {
        return new Promise((resolve, reject) => {
            client.set(provider, JSON.stringify(data), (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
        });
    }
}

module.exports = Redis;