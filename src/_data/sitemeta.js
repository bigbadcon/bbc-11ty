require("dotenv").config();

/* --------------------------- Check server status -------------------------- */
function checkServer(url, timeout = 500) {
	const controller = new AbortController();
	const signal = controller.signal;
	const options = { mode: "no-cors", signal };
	fetch(url, options)
		.then(
			setTimeout(() => {
				controller.abort();
			}, timeout)
		)
		.then((response) => {
			// eslint-disable-next-line no-console
			console.log("Check server response:", response.statusText);
			return response.statusText;
		})
		.catch((error) => {
			// eslint-disable-next-line no-console
			console.error("Check server error:", error.message);
			return false;
		});
}

module.exports = async () => {
	const isAdminOnline = checkServer("https://admin.bigbadcon.com");

	return {
		domain: process.env.DOMAIN || "www.bigbadcon.com",
		url: process.env.URL || "https://www.bigbadcon.com",
		environment: process.env.ELEVENTY_ENV,
		context: process.env.CONTEXT,
		eventDateOnline: false,
		eventDateIrl: "Sep 28 - Oct 1 2023",
		eventDate: "Sep 28 - Oct 1 2023",
		dataService: isAdminOnline,
	};
};
