require("dotenv").config();

module.exports = {
	domain: process.env.DOMAIN || "www.bigbadcon.com",
	url: process.env.URL || "https://www.bigbadcon.com",
	environment: process.env.ELEVENTY_ENV,
	context: process.env.CONTEXT,
	eventDate: "Sep 28 - Oct 1, 2023",
	eventSignupDate: "Sun Sep 25 2022 11:50:00 GMT-0700 (PDT)",
};
