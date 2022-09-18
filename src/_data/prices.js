const environment = process.env.CONTEXT

const api_key = environment !== "production"
    ? process.env.STRIPE_TEST_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = require('stripe')(api_key)

function compareValues(a, b) {
    // return -1/0/1 based on what you "know" a and b
    // are here. Numbers, text, some custom case-insensitive
    // and natural number ordering, etc. That's up to you.
    // A typical "do whatever JS would do" is:
    return (a < b)
        ? -1
        : (a > b)
            ? 1
            : 0;
}

async function getPrices()  {
    const response = await stripe.prices.list({
        expand: ["data.product"]
    })
    // Only grab active products and sort from highest to lowest price
    return response.data.filter(price => price.active).sort((i1, i2) => compareValues(i2.unit_amount, i1.unit_amount))
}

// TODO: add try catch
module.exports = async function () {
    try {
        return await getPrices()
    } catch (err) {
        console.log(err);
        return false
    }
}