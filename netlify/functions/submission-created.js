const axios = require("axios");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { GoogleSpreadsheet } = require("google-spreadsheet");
const environment = process.env.CONTEXT;

const apiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
const bbcApiKey = `ApiKey ${process.env.BBC_API_KEY}`;

exports.handler = async function (event) {
	// your server-side functionality
	const payload = JSON.parse(event.body).payload;
	const data = payload.data;
	console.log("submission data", data);

	/* -------------------------------------------------------------------------- */
	/*                       Script for Create Account form                       */
	/* -------------------------------------------------------------------------- */
	if (data.formName === "create-account") {
		const { displayName, firstName, lastName, nickname, userEmail, userPass } = data;

		// login and nicename are the same as email going forward
		const userNicename = userEmail;
		const userLogin = userEmail;
		const properNickname = !nickname || nickname === "" ? displayName : nickname;

		const params = {
			displayName,
			firstName,
			lastName,
			properNickname,
			userEmail,
			userNicename,
			userLogin,
			userPass,
			userUrl: "",
			// twitter: twitter
		};

		if (data.phone !== "" || !displayName) {
			console.log("Check for displayName and phone honeypot trap for", data.phone, userEmail, displayName);
			return {
				statusCode: 500,
				body: "Not allowed",
			};
		}

		console.log("create account function start for", userEmail);

		/* -------------------------------------------------------------------------- */
		/*                                Login as Admin                              */
		/* -------------------------------------------------------------------------- */

		let isUser = undefined;
		const config = { headers: { "x-api-key": bbcApiKey } };

		console.log("1. try check userEmail");
		try {
			const res = await axios.get(apiBaseUrl + `users/email/${userEmail}`, config);
			console.log("res.status", res.status);
			if (res.status === 200) {
				isUser = true;
			}
		} catch (err) {
			console.log(err.response);
			console.log("Error with 1", userEmail, err.response.data.message, err.response.status);
			if (err.response.data.message == "No user found!") {
				isUser = false;
			} else {
				return {
					statusCode: 500,
					body: "User email check failed for " + userEmail,
				};
			}
		}

		// If there isn't a user with that name then create it. If not send an email indicating that the user exists
		if (isUser === false) {
			/* -------------------------------------------------------------------------- */
			/*                          Attempt to create account                         */
			/* -------------------------------------------------------------------------- */
			console.log("2. try create user");
			try {
				await axios.put(apiBaseUrl + "users/create", params, config);
				// console.log("put response", res);
				console.log("New user successfully created for", userEmail, displayName);

				/* -------------------------------------------------------------------------- */
				/*                     If successful try above send emails                    */
				/* -------------------------------------------------------------------------- */

				/* --------------------------- New user message ---------------------------- */
				const newUserMsg = {
					to: userEmail,
					from: "info@bigbadcon.com",
					subject: "Big Bad Con New User Account",
					text: `Welcome ${displayName}! Your new user account has been created. You can now return to bigbadcon.com to log in!`,
					html: `Welcome ${displayName}! Your new user account has been created. You can now return to <a href="http://www.bigbadcon.com">bigbadcon.com</a> to log in!`,
				};

				await sgMail.send(newUserMsg);
				/* --------------------------- Admin user message --------------------------- */
				const newUserAdminMsg = {
					to: "info@bigbadcon.com",
					from: "info@bigbadcon.com",
					subject: "New User added",
					text: `New user ${displayName} added! Email: ${userEmail}; Full name: ${firstName} ${lastName}`,
					html: `New user ${displayName} added! Email: ${userEmail}; Full name: ${firstName} ${lastName}`,
				};
				await sgMail.send(newUserAdminMsg);

				// finalize function
				return {
					statusCode: 200,
					body: "account submitted and emails sent",
				};
			} catch (e) {
				/* -------------------------------------------------------------------------- */
				/*                      Catch for failed Account creation                     */
				/* -------------------------------------------------------------------------- */
				console.log("account submission error", e);

				/* -------------------------------------------------------------------------- */
				/*                    Send emails for failed account creation                */
				/* -------------------------------------------------------------------------- */

				/* --------------------------- New user message ---------------------------- */
				const newUserMsg = {
					to: userEmail,
					from: "info@bigbadcon.com",
					subject: "Big Bad Con New User Account",
					text: `Hello ${displayName}, Unfortunately there was a problem adding your account. It's possible that you already have an account with us if you had an account on our old site. As our reset password is broken right now you can go to our old site at https://admin.bigbadcon.com and reset it there. Once reset it will work on our new site. If you have any questions you can reply to this message.`,
					html: `Hello ${displayName}, Unfortunately there was a problem adding your account. It's possible that you already have an account with us if you had an account on our old site. As our reset password is broken right now you can go to our old site at https://admin.bigbadcon.com and reset it there. Once reset it will work on our new site. An email has been sent to our admin staff to see what is wrong. If you have any questions you can reply to this message.`,
				};

				await sgMail.send(newUserMsg);
				/* --------------------------- Admin user message --------------------------- */
				const newUserAdminMsg = {
					to: "info@bigbadcon.com",
					from: "info@bigbadcon.com",
					subject: "New User Account Creation Failed",
					text: `The user ${displayName} attempted but failed to create an account. Not sure why it failed. Email: ${userEmail}; Full name: ${firstName} ${lastName}`,
					html: `The user ${displayName} attempted but failed to create an account. Not sure why it failed. Email: ${userEmail}; Full name: ${firstName} ${lastName}`,
				};
				await sgMail.send(newUserAdminMsg);

				// finalize function
				return {
					statusCode: 500,
					body: "account creation failed and emails sent",
				};
			}
		} else if (isUser === true) {
			/* ------------- Send email that user exists with that username ------------- */

			console.log("2b. user exists send email");
			/* --------------------------- New user message ---------------------------- */
			const newUserMsg = {
				to: userEmail,
				from: "info@bigbadcon.com",
				subject: "Big Bad Con New User Account",
				text: `Hello ${displayName}, there is already an account set up with the email ${userEmail}. If you need to reset your password, click reset password in the login panel. If you continue to have issues please contact us at info@bigbadcon.com`,
				html: `Hello ${displayName}, there is already an account set up with the email ${userEmail}. If you need to reset your password, click reset password in the login panel. If you continue to have issues please contact us at info@bigbadcon.com`,
			};

			await sgMail.send(newUserMsg);

			/* --------------------------- Admin user message --------------------------- */
			const newUserAdminMsg = {
				to: "info@bigbadcon.com",
				from: "info@bigbadcon.com",
				subject: "New User Account Creation Failed",
				text: `The user ${displayName} attempted but failed to create an account due to the same email ${userEmail} already being in the system. They have been emailed explaining this. Email: ${userEmail}; Full name: ${firstName} ${lastName}`,
				html: `The user ${displayName} attempted but failed to create an account due to the same email ${userEmail} already being in the system. They have been emailed explaining this. Email: ${userEmail}; Full name: ${firstName} ${lastName}`,
			};
			if (environment === "production") await sgMail.send(newUserAdminMsg);

			// finalize function
			return {
				statusCode: 500,
				body: "account creation failed due to same username and emails sent",
			};
		} else {
			return {
				statusCode: 500,
				body: "account creation failed due to user check error",
			};
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                             Script for Register                            */
	/* -------------------------------------------------------------------------- */

	if (data.formName === "register-bigbadonline") {
		console.log("script for", data.formName);
		console.log(process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"));
		try {
			// Initialize the sheet - doc ID is the long id in the sheets URL
			const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_REGISTER_BIGBADONLINE);

			// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
			await doc.useServiceAccountAuth({
				client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
				private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			});

			await doc.loadInfo(); // loads document properties and worksheets
			console.log(doc.title);
			const sheet = doc.sheetsByIndex[0];

			/* ---------------------- Take submit event and add row --------------------- */

			const dateAdded = new Date().toLocaleDateString();
			const addedRow = await sheet.addRow({
				dateAdded: dateAdded,
				displayName: data.displayName,
				userEmail: data.userEmail,
				userNicename: data.userNicename,
				userId: data.userId,
				"Agree To Community Standards": data["agree-to-community-standards"],
			});
			console.log("🚀 ~ file: submission-created.js ~ line 149 ~ exports.handler=function ~ addedRow", addedRow);

			// TODO: add Volunteer Role to any registered users. TEST THIS!!!
			const body = {
				role: "volunteer",
				userId: data.userId,
			};

			const headers = { headers: { "x-api-key": bbcApiKey } };
			console.log("addRoleToUser API POST", headers, body);
			try {
				const res = await axios.post(apiBaseUrl + `users/addRoleToUser`, body, headers);

				if (res.status === 200) {
					return {
						statusCode: 200,
						body: "user added volunteer role",
					};
				} else {
					return {
						statusCode: 500,
						body: "failed",
					};
				}
			} catch (err) {
				console.log("add user role for volunteer failed", err.toString());
				return {
					statusCode: 200,
					body: "add user role for volunteer failed",
				};
			}
		} catch (e) {
			return {
				statusCode: 500,
				body: e.toString(),
			};
		}
	}

	return {
		statusCode: 200,
		body: "form with no script",
	};
};
