require("dotenv").config();

module.exports = {
	domain: process.env.DOMAIN || "www.bigbadcon.com",
	url: process.env.URL || "https://www.bigbadcon.com",
	environment: process.env.ELEVENTY_ENV,
	context: process.env.CONTEXT,
	eventDateOnline: false,
	eventDateIrl: "Sep 28 - Oct 1 2023",
	eventDate: "Sep 28 - Oct 1 2023",
};
