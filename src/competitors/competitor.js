const async = require("async");
const Request = require("../modules/requests");
const cheerio = require("cheerio");

class Competitor {

    constructor(competitor, link, cache) {
        this.db = cache
        this.vendor = competitor;
        this.rootLink = link;
        this.ads = [];
        this.reduceReport = [];
        this.totAds = 0;
        const self = this;
        this.queuePaginate = async.queue(async task => {
            try {
                let $ = cheerio.load(await Request(task));
                $("a[id*=link_ad_]").each(function (index, elem) {
                    let rel = $(this).attr("href");
                    self.queuePage.push(rel);
                });
                return true;
            } catch (error) {
                throw error;
            }
        }, 1);

        this.queuePage = async.queue(async task => {
            try {
                let $ = cheerio.load(await Request(task));
                let data = JSON.parse($("#js-hydration").html());
                const propertyData = data.listing.properties[0];
                let price = (data.price) ? data.price.price : null;
                if (null === price) {
                    if (data.listing.price) {
                        price = data.listing.price.price
                    }            
                }
                // Controllo  che non ci sia più di un prezzo
                /*if (/-/g.test(propertyData.costs.price) === true) {
                    return true;
                }*/
                if (!self.ads[data.trovakasa.provincia]) {
                  self.ads[data.trovakasa.provincia] = [];
                }
                self.ads[data.trovakasa.provincia].push({
                  price: Number(price),
                  url: task,
                  provider_pk: data.listing.id
                });                
                return true;
            } catch (error) {
                throw error;
            }
        }, 3);

        setInterval(() => {
            console.log(
                `${competitor} - queuePage item remaing : ${this.queuePage.length()}`
            );
        }, 1000);
    }

    async report() {
        try {
            await this._rootPage(this.rootLink);
            await this.queuePaginate.drain();
            await this.queuePage.drain();
            let response = {
                tot: {
                    totitem: 0,
                    totprice: 0
                },
                prov: {},
                added: {},
                removed: {}
            };

            for (let pr in this.ads) {
                if (!response["prov"][pr]) {
                    response["prov"][pr] = {
                        totprice: 0,
                        totitem: 0
                    };
                }
                response["prov"][pr].totitem = this.ads[pr].length;
                response["tot"].totitem += this.ads[pr].length;
                for (let i = 0; i < this.ads[pr].length; i++) {
                    this.reduceReport.push({
                        provider_pk: Number(this.ads[pr][i].provider_pk),
                        price: Number(this.ads[pr][i].price),
                        province: pr
                    });
                    response["prov"][pr].totprice += this.ads[pr][i].price;
                    response["tot"].totprice += this.ads[pr][i].price;
                }
            }

            let ads = await this.db.getAds(this.vendor);
            if (ads) {
                let added = await adsDiff(this.reduceReport, ads);
                let removed = await adsDiff(ads, this.reduceReport);
                if (added.length > 0) {
                    added.forEach(item => {
                        if (!response["added"][item.province]) {
                            response["added"][item.province] = {
                                totprice: 0,
                                totitem: 0
                            };
                        }
                        response["added"][item.province].totprice += item.price;
                        response["added"][item.province].totitem += 1;
                    })
                }
                if (removed.length > 0) {
                    removed.forEach(item => {
                        if (!response["removed"][item.province]) {
                            response["removed"][item.province] = {
                                totprice: 0,
                                totitem: 0
                            };
                        }
                        response["removed"][item.province].totprice += item.price;
                        response["removed"][item.province].totitem += 1;
                    });
                }
            }
            await this.db.setAds(this.vendor, this.reduceReport);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async _rootPage(url) {
        try {
            const self = this;
            let html = await Request(url);            
            let $ = cheerio.load(html);
            let itemTot = $(".count-ads")
                .text()
                .replace(/[^\d]+/g, "");
            let pageTot = Math.ceil(itemTot / 25);            
            for (let i = 2; i <= pageTot; i++) {
                let pag = `${url}&pag=${i}`;
                self.queuePaginate.push(pag);
            }
            $("a[id*=link_ad_]").each(function (index, elem) {
                let rel = $(this).attr("href");
                self.queuePage.push(rel);
            });
        } catch (error) {
            throw error;
        }
    }
}

async function adsDiff(arrayAds1, arrayAds2) {
    let find = false;
    let difference = [];
    arrayAds1.forEach(item1 => {
        find = false;
        arrayAds2.forEach(item2 => {
            if (item1.provider_pk == item2.provider_pk) {
                find = true;
            }
        });
        if (!find) {
            difference.push(item1);
        }
    });

    return difference;
}

module.exports = Competitor;