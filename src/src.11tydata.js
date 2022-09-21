// TODO: add ability to see drafts in dev and on netlify either with branch or with preview link
module.exports = {
    published: true,
    eleventyComputed: {
        permalink: data => {
            if (data.published !== true) {
                return false
            } else {
                return data.permalink
            }
        }
    }
}