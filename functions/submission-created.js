const axios = require('axios');
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet')

const apiBaseUrl = `${process.env.API_BASE_URI}`
const apiKey = `ApiKey ${process.env.BBC_API_KEY}`

exports.handler = async function(event, context) {
    // your server-side functionality
    const payload = JSON.parse(event.body).payload;
    const data = payload.data
    console.log("submission data", data);

    /* -------------------------------------------------------------------------- */
    /*                       Script for Create Account form                       */
    /* -------------------------------------------------------------------------- */
    if (data.formName === 'create-account') {
        console.log("create account function start");
        const { displayName, firstName, lastName, nickname, userEmail, userNicename, userLogin, userPass, twitter } = data

        const properNickname = (!nickname || nickname === "") ? displayName : nickname

        const params = {
            displayName: displayName, 
            firstName: firstName, 
            lastName: lastName, 
            nickname: properNickname, 
            userEmail: userEmail, 
            userNicename: userNicename, 
            userLogin: userLogin, 
            userPass: userPass,
            userUrl: "",
            emailSubject: "Go Play NW User account created",
            emailBody: "An account for this email address has been created at https://www.goplaynw.org" + "!" +
                "You may log in with either this email address, or the username " + displayName + "."
            // twitter: twitter
        }

        /* -------------------------------------------------------------------------- */
        /*                                Login as Admin                              */
        /* -------------------------------------------------------------------------- */

        const username = process.env.ADMIN_LOGIN
        const password = process.env.ADMIN_PASSWORD

        let token = null
        let isUser = false
        let auth = token

        try {
            console.log("1. try login")
            const res = await axios.post(apiBaseUrl + "login", { username: username, password: password })
            if (res.status === 200 && res.headers.authorization) {
                token = res.headers.authorization
            }
        } catch (err) {
            console.log(err);
        }

        try {
            console.log("2. try check username")
            const config = { headers: { Authorization: token } }
            const res = await axios.get(apiBaseUrl + `users/username/${userNicename}`, config)
    
            if (res.status === 200) {
                isUser = true
            } else {

            }
        } catch (err) {
            console.log("User does not exist", err.response.config.url, err.response.status);
        }

        // If there isn't a user with that name then create it. If not send an email indicating that the user exists
        if (!isUser) {
            /* -------------------------------------------------------------------------- */
            /*                          Attempt to create account                         */
            /* -------------------------------------------------------------------------- */
            try {
                console.log("3a. try create user")
                const res = await axios.put(apiBaseUrl + 'users/create', params)
                // console.log("put response", res);
                console.log("New user successfully created for", userNicename, userEmail, displayName);

            } catch(e) {
                /* -------------------------------------------------------------------------- */
                /*                      Catch for failed Account creation                     */
                /* -------------------------------------------------------------------------- */
                console.log("account submission error", e);


            }
        }
 
    }

    /* -------------------------------------------------------------------------- */
    /*                             Script for Register                            */
    /* -------------------------------------------------------------------------- */

    if (data.formName === 'register-bigbadonline') {
        console.log("script for",data.formName);
        console.log(process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"));
        try {
            // Initialize the sheet - doc ID is the long id in the sheets URL
            const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_REGISTER_BIGBADONLINE_2022)

            // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
            await doc.useServiceAccountAuth({
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            });

            await doc.loadInfo() // loads document properties and worksheets
            console.log(doc.title);
            const sheet = doc.sheetsByIndex[0]

            /* ---------------------- Take submit event and add row --------------------- */

            const dateAdded = new Date().toLocaleDateString()
            const addedRow = await sheet.addRow({
                dateAdded: dateAdded,
                displayName: data.displayName,
                userEmail: data.userEmail,
                userNicename: data.userNicename,
                userId: data.userId,
                "Agree To Community Standards": data["agree-to-community-standards"],
            })
            console.log("🚀 ~ file: submission-created.js ~ line 149 ~ exports.handler=function ~ addedRow", addedRow)
            
            // TODO: add Volunteer Role to any registered users. TEST THIS!!!
            const body = {
                "role": "volunteer",
                "userId": data.userId
            }
            
            const headers = { headers: {"x-api-key": apiKey} }
            console.log("addRoleToUser API POST", headers, body);
            try {
            
                const res = await axios.post(apiBaseUrl + `users/addRoleToUser`, body, headers)
            
                if (res.status === 200) {
                    return {
                        statusCode: 200,
                        body: "user added volunter role",
                    }
                } else {
                    return {
                        statusCode: 500,
                        body: "failed"
                    }
                }
            } catch (err) {
                console.log("add user role for voluteer failed", err.toString());
                return {
                    statusCode: 200,
                    body: "add user role for voluteer failed"
                }
            }

            return {
              statusCode: 200,
              body: JSON.stringify({
                message: `row added`,
              }),
            }
          } catch (e) {
            return {
              statusCode: 500,
              body: e.toString(),
            }
          }
    }

    return {
        statusCode: 200,
        body: "form with no script"
    }
}