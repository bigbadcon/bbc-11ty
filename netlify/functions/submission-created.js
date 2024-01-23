const axios = require("axios");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { GoogleSpreadsheet } = require("google-spreadsheet");
const environment = process.env.CONTEXT;

const apiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
const apiKey = `ApiKey ${process.env.BBC_API_KEY}`;

exports.handler = async function (event, context) {
	// your server-side functionality
	const payload = JSON.parse(event.body).payload;
	const data = payload.data;
	console.log("submission data", data);

	/* -------------------------------------------------------------------------- */
	/*                       Script for Create Account form                       */
	/* -------------------------------------------------------------------------- */
	if (data.formName === "create-account") {
		console.log("create account function start");
		const { displayName, firstName, lastName, nickname, userEmail, userNicename, userLogin, userPass, twitter } =
			data;

		const properNickname = !nickname || nickname === "" ? displayName : nickname;

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
			// twitter: twitter
		};

		/* -------------------------------------------------------------------------- */
		/*                                Login as Admin                              */
		/* -------------------------------------------------------------------------- */

		// TODO: fix this so it uses the API Key
		const username = process.env.ADMIN_LOGIN;
		const password = process.env.ADMIN_PASSWORD;

		let token = null;
		let isUser = false;

		try {
			console.log("1. try login");
			const res = await axios.post(apiBaseUrl + "login", {
				username: username,
				password: password,
			});
			if (res.status === 200 && res.headers.authorization) {
				token = res.headers.authorization;
			}
		} catch (err) {
			console.log(err);
		}

		try {
			console.log("2. try check username");
			const config = { headers: { Authorization: token } };
			const res = await axios.get(apiBaseUrl + `users/username/${userNicename}`, config);

			if (res.status === 200) {
				isUser = true;
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
				console.log("3a. try create user");
				const res = await axios.put(apiBaseUrl + "users/create", params);
				// console.log("put response", res);
				console.log("New user successfully created for", userNicename, userEmail, displayName);

				/* -------------------------------------------------------------------------- */
				/*                     If successful try above send emails                    */
				/* -------------------------------------------------------------------------- */
				try {
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
						text: `New user ${displayName} added! Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
						html: `New user ${displayName} added! Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
					};
					await sgMail.send(newUserAdminMsg);

					// finalize function
					return {
						statusCode: 200,
						body: "account submitted and emails sent",
					};
				} catch (e) {
					return {
						statusCode: e.response.status,
						body: "Account error with sending emails",
					};
				}
			} catch (e) {
				/* -------------------------------------------------------------------------- */
				/*                      Catch for failed Account creation                     */
				/* -------------------------------------------------------------------------- */
				console.log("account submission error", e);

				/* -------------------------------------------------------------------------- */
				/*                    Send emails for failed account creation                */
				/* -------------------------------------------------------------------------- */
				try {
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
						text: `The user ${displayName} attempted but failed to create an account. Not sure why it failed. Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
						html: `The user ${displayName} attempted but failed to create an account. Not sure why it failed. Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
					};
					await sgMail.send(newUserAdminMsg);

					// finalize function
					return {
						statusCode: 500,
						body: "account creation failed and emails sent",
					};
				} catch (e) {
					return {
						statusCode: e.response.status,
						body: "account creation failed. now emails sent",
					};
				}
			}
		} else {
			/* ------------- Send email that user exists with that username ------------- */
			try {
				console.log("3b. user exists send email");
				/* --------------------------- New user message ---------------------------- */
				const newUserMsg = {
					to: userEmail,
					from: "info@bigbadcon.com",
					subject: "Big Bad Con New User Account",
					text: `Hello ${displayName}, there is already an account set up with the username ${userNicename}. If you had an account on the old Big Bad Con site with this username you can login with the same login/password on the new account! If you did not have an account then please choose a different password.`,
					html: `Hello ${displayName}, there is already an account set up with the username ${userNicename}. If you had an account on the old Big Bad Con site with this username you can login with the same login/password on the new account! If you did not have an account then please choose a different password.`,
				};

				await sgMail.send(newUserMsg);

				/* --------------------------- Admin user message --------------------------- */
				const newUserAdminMsg = {
					to: "info@bigbadcon.com",
					from: "info@bigbadcon.com",
					subject: "New User Account Creation Failed",
					text: `The user ${displayName} attempted but failed to create an account due to the same username ${userNicename} already being in the system. They have been emailed explaining this. Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
					html: `The user ${displayName} attempted but failed to create an account due to the same username ${userNicename} already being in the system. They have been emailed explaining this. Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
				};
				if (environment === "production") await sgMail.send(newUserAdminMsg);

				// finalize function
				return {
					statusCode: 500,
					body: "account creation failed due to same username and emails sent",
				};
			} catch (e) {
				return {
					statusCode: e.response.status,
					body: "account creation failed due to same username and emails failed to send",
				};
			}
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

			const headers = { headers: { "x-api-key": apiKey } };
			console.log("addRoleToUser API POST", headers, body);
			try {
				const res = await axios.post(apiBaseUrl + `users/addRoleToUser`, body, headers);

				if (res.status === 200) {
					return {
						statusCode: 200,
						body: "user added volunter role",
					};
				} else {
					return {
						statusCode: 500,
						body: "failed",
					};
				}
			} catch (err) {
				console.log("add user role for voluteer failed", err.toString());
				return {
					statusCode: 200,
					body: "add user role for voluteer failed",
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
