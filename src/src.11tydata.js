module.exports = {
	published: true,
	eleventyComputed: {
		permalink: (data) => {
			if (data.published === true && (!data.event || data.event === "both" || data.global.event === data.event)) {
				return data.permalink;
			}
			return false;
		},
	},
};
