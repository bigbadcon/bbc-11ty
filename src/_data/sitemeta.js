require('dotenv').config();

module.exports = {
    domain: process.env.DOMAIN || "www.bigbadcon.com",
    url: process.env.URL || "https://www.bigbadcon.com",
    environment: process.env.ELEVENTY_ENV,
    context: process.env.CONTEXT,
    eventDate: "Oct 27-30, 2022",
};
