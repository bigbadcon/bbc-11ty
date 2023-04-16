const axios = require('axios');
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet')

const apiBaseUrl = `${process.env.API_BASE_URI}`

const apiKey = `ApiKey ${process.env.BBC_API_KEY}`
// headers: {"x-api-key": apiKey}

exports.handler = async function(event, context) {

    if (event.httpMethod === 'POST') {  
        /* -------------------------------------------------------------------------- */
        /*                        1. grab submitted event data                        */
        /* -------------------------------------------------------------------------- */

        const eventBody = JSON.parse(event.body)

        

        /* -------------------------------------------------------------------------- */
        /*                        2. Submit data to google form                       */
        /* -------------------------------------------------------------------------- */

         console.log('Try submit to Google Sheet');
         try {
             // Initialize the sheet - doc ID is the long id in the sheets URL
             const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_VOLUNTEER_GPNW_2023);
        
             // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
             await doc.useServiceAccountAuth({
                 client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                 private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
             });
        
             await doc.loadInfo() // loads document properties and worksheets
             console.log(doc.title);
             const sheet = doc.sheetsByIndex[0];
        
//             /* ---------------------- Take submit event and add row --------------------- */
//        
//             const dateAdded = new Date().toLocaleDateString();
//             const addedRow = await sheet.addRow({
//                 dateAdded: dateAdded,
//                 displayName: eventBody.displayName,
//                 userId: eventBody.userId,
//                 userEmail: eventBody.userEmail,
//                 userAge: eventBody.yourAge, //required
//                 phone: eventBody.phone, //required
//                 discord: eventBody.discord, //required
            //      otherInfo: eventBody.otherInfo, //not required
            //      communityStandards: eventBody.communityStandards && "Agreed"
            //  })
             console.log("addedRow", addedRow);

            /* -------------------------------------------------------------------------- */
            /*                        3. add volunteer role to use                        */
            /* -------------------------------------------------------------------------- */
            
            // TODO: add Volunteer Role to any registered users. TEST THIS!!!
        //    const body = {
        //        "role": "volunteer",
        //        "userId": parseInt(eventBody.userId)
        //    }
        //    
        //    const headers = { headers: {"x-api-key": apiKey} }
        //    console.log("addRoleToUser API POST", headers, body);
        //    try {
        //    
        //        const res = await axios.post(apiBaseUrl + `users/addRoleToUser`, body, headers)
        //    
        //        if (res.status === 200) {
        //            return {
        //                statusCode: 200,
        //                body: "user added volunteer role",
        //            }
        //        } else {
        //            return {
        //                statusCode: 500,
        //                body: "failed"
        //            }
        //        }
        //    } catch (err) {
        //        console.log("add user role for volunteer failed", err.toString());
        //        return {
        //            statusCode: 200,
        //            body: "add user role for volunteer failed"
        //        }
        //    }

         } catch (e) {
             console.log('Google Sheet add failed', e)
             return {
                 statusCode: 500,
                 body: e.toString(),
             }
         }
    } else {
        return {
            statusCode: 500,
            body: `only POST events are allowed`
        }
    }
}