require("dotenv").config();

module.exports = {
	domain: process.env.DOMAIN || "www.bigbadcon.com",
	url: process.env.URL || "https://www.bigbadcon.com",
	environment: process.env.ELEVENTY_ENV,
	context: process.env.CONTEXT,
	eventDateOnline: "Mar 31 - Apr 1 2023",
	eventDateIrl: "Sep 28 - Oct 1 2023",
	eventDate: "Mar 31 - Apr 1 2023",
};
