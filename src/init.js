const Competitor    = require("./competitors/competitor_nocache");
const SibApiV3Sdk   = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey        = defaultClient.authentications['api-key'];
apiKey.apiKey       = process.env.SENDINBLUE_APIKEY;
const apiInstance   = new SibApiV3Sdk.TransactionalEmailsApi();

async function start () {	
    try {
		const Homepanda = new Competitor('homepanda', "https://www.immobiliare.it/agenzie-immobiliari/231505/homepanda/?criterio=dataModifica&ordine=desc", {
			concurrency: {
				page: 2
			}
		});
		const Dove = new Competitor('dove', "https://www.immobiliare.it/agenzie-immobiliari/164866/dove-it/?criterio=dataModifica&ordine=desc", {
			concurrency: {
				page: 2
			}
		});		
		const Rockagent = new Competitor('rockagent', "https://www.immobiliare.it/pro/230915/rockagent/?criterio=dataModifica&ordine=desc", {
			concurrency: {
				page: 2
			}
		});		
       
		const [homepanda, dove, rockagent] = await Promise.all([
			Homepanda.report(),
			Dove.report(),
			Rockagent.report()
		]);

		const template = `
		<h2>Dove</h2>

		<p>Totale: ${dove.tot.totitem} - € ${Number(dove.tot.totprice)}</p>
		<p>di cui:</p>
		${Object.keys(dove.prov).map(
			(key) => {
				let totItem = dove.prov[key].totitem;
				let totPrice = Number(dove.prov[key].totprice);
				let added = ``;
				let removed = ``;
				if (dove.added[key]) {
					added = `inseriti ${dove.added[key].totitem} - € ${Number(dove.added[key].totprice)}`;
				}
				if (dove.removed[key]) {
					removed = `rimossi ${dove.removed[key].totitem} - € ${Number(dove.removed[key].totprice)}`;
				}
				let delta = (added.length > 0 && removed.length > 0)
					? `(${added} | ${removed})`
					: (added.length > 0 && removed.length == 0)
						? `(${added})`
						: (added.length == 0 && removed.length > 0)
							? `(${removed})`
							: ``;
				return `<p>${key}: ${totItem} - € ${totPrice} ${delta}</p>`;
			}
		).join('')}

		<h2>Homepanda</h2>

		<p>Totale: ${homepanda.tot.totitem} - € ${Number(homepanda.tot.totprice)}</p>
		<p>di cui:</p>
		${Object.keys(homepanda.prov).map(
			(key) => {
				let totItem = homepanda.prov[key].totitem;
				let totPrice = Number(homepanda.prov[key].totprice);
				let added = ``;
				let removed = ``;
				if (dove.added[key]) {
					added = `inseriti ${homepanda.added[key].totitem} - € ${Number(homepanda.added[key].totprice)}`;
				}
				if (dove.removed[key]) {
					removed = `rimossi ${homepanda.removed[key].totitem} - € ${Number(homepanda.removed[key].totprice)}`;
				}
				let delta = (added.length > 0 && removed.length > 0)
					? `(${added} | ${removed})`
					: (added.length > 0 && removed.length == 0)
						? `(${added})`
						: (added.length == 0 && removed.length > 0)
							? `(${removed})`
							: ``;
				return `<p>${key}: ${totItem} - € ${totPrice} ${delta}</p>`;
			}
		).join('')}

		<h2>RockAgent</h2>

		<p>Totale: ${rockagent.tot.totitem} - € ${Number(rockagent.tot.totprice)}</p>
		<p>di cui:</p>
		${Object.keys(rockagent.prov).map(
			(key) => {
				let totItem = rockagent.prov[key].totitem;
				let totPrice = Number(rockagent.prov[key].totprice);
				let added = ``;
				let removed = ``;
				if (rockagent.added[key]) {
					added = `inseriti ${rockagent.added[key].totitem} - € ${Number(rockagent.added[key].totprice)}`;
				}
				if (rockagent.removed[key]) {
					removed = `rimossi ${rockagent.removed[key].totitem} - € ${Number(rockagent.removed[key].totprice)}`;
				}
				let delta = (added.length > 0 && removed.length > 0)
					? `(${added} | ${removed})`
					: (added.length > 0 && removed.length == 0)
						? `(${added})`
						: (added.length == 0 && removed.length > 0)
							? `(${removed})`
							: ``;
				return `<p>${key}: ${totItem} - € ${totPrice} ${delta}</p>`;
			}
		).join('')}
		`;
		/*<h2>Homepal</h2>

		<p>Totale: ${homepal.tot.totitem} - € ${Number(homepal.tot.totprice)}</p>
		<p>di cui:</p>
		${Object.keys(homepal.prov).map(
			(key) => {
				let totItem = homepal.prov[key].totitem;
				let totPrice = Number(homepal.prov[key].totprice);
				let added = ``;
				let removed = ``;
				if (homepal.added[key]) {
					added = `inseriti ${homepal.added[key].totitem} - € ${Number(homepal.added[key].totprice)}`;
				}
				if (homepal.removed[key]) {
					removed = `rimossi ${homepal.removed[key].totitem} - € ${Number(homepal.removed[key].totprice)}`;
				}
				let delta = (added.length > 0 && removed.length > 0)
					? `(${added} | ${removed})`
					: (added.length > 0 && removed.length == 0)
						? `(${added})`
						: (added.length == 0 && removed.length > 0)
							? `(${removed})`
							: ``;
				return `<p>${key}: ${totItem} - € ${totPrice} ${delta}</p>`;
			}
		).join('')}
		`;*/
		let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();		
		sendSmtpEmail.to  = [{name:'Gloria De Priori', email:'gloria.depriori@homepanda.it'}];
		sendSmtpEmail.cc  = [
			{name:'Alessandro Alberta', email:'alessandro.alberta@homepanda.it'},
			{name:'Emiliano Mancini', email:'emiliano.mancini@homepanda.it'},
			{name:'Corrado Ronci', email:'corrado.ronci@homepanda.it'}
		];
		sendSmtpEmail.subject  = 'Report Competitor';
		sendSmtpEmail.sender = {'name': 'No Reply Homepanda', 'email': 'no-reply@homepanda.it'};
		sendSmtpEmail.htmlContent = template 
		try {
			let response = await apiInstance.sendTransacEmail(sendSmtpEmail)
			console.log(response)
		} catch (e) {
			throw e;
		}
    } catch (error) {
        console.log(error)
	} finally {
		return true;
	}
}

start().finally(()=> { process.exit(0) });