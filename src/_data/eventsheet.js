const Cache = require("@11ty/eleventy-cache-assets");

// Once a google sheet is "published to the web" we can access its JSON
// via a URL of this form. We just need to pass in the ID of the sheet
// which we can find in the URL of the document.
const googleSheetID = "17Q071QsIpbx2qA29V4Cf8K07D098-SBVPPe5y1NCSX4";
const sheetNumber = 1
const googleSheetUrl = `https://spreadsheets.google.com/feeds/cells/${googleSheetID}/${sheetNumber}/public/full?alt=json`;


module.exports = async () => {
    try {
        const sheet = await Cache(googleSheetUrl,{
            duration: "1d",
            type: "json"
        })

        var data = { };
        sheet.feed.entry.forEach(item => {
            const content = item.content.$t
            const row = parseInt(item.gs$cell.row)
            const col = parseInt(item.gs$cell.col)
            data = {...data, [row]:{ ...data[row], [col]: content}}
        });

        const temp = Object.values(data)

        data = temp.map(item => {
            return Object.values(item)
        })

        return data
    } catch(error) {
        console.log(error)
    }
}