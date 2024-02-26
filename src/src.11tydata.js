module.exports = {
	published: true,
	eleventyComputed: {
		permalink: (data) => {
			if (
				data.published === true &&
				(!data.eventType || data.eventType === "both" || data.global.eventType === data.eventType)
			) {
				return data.permalink;
			}
			return false;
		},
	},
};
