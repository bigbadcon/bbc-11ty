exports.handler = async function (event) {
	const eventBody = JSON.parse(event.body);
	const today = new Date();
	console.log(today, eventBody);

	return {
		statusCode: 200,
		body: ``,
	};
};
