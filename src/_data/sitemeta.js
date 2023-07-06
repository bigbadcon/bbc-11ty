require('dotenv').config();

module.exports = {
    domain: process.env.DOMAIN || "www.goplaynw.org",
    url: process.env.URL || "https://www.goplaynw.org",
    eventDate: "27 OCT - 29 OCT 2023",
    eventLocation: "Discord",
    eventType: "ONLINE", // IN-PERSON, ONLINE, HYBRID
    eventStatus: "OFF-SEASON", // UPCOMING, ONGOING, OFF-SEASON
    signupsOpen: false,
    gameSubmissionOpen: false,
};