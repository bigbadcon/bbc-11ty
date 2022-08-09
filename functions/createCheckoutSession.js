const environment = process.env.CONTEXT
const api_key = environment !== "production"
    ? process.env.STRIPE_TEST_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = require('stripe')(api_key)

// Function for purchasing via Stripe
require('dotenv').config();

exports.handler = async function (event, context) {
    const referer = event.headers.referer
    const params = new URLSearchParams(event.body)
    const price_id = params.get('price_id');
    const client_reference_id = params.get('userId');
    const customer_email = params.get('userEmail');
    console.log(price_id)

    // TODO: add try / catch
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: price_id,
                quantity: 1,
            }
        ],
        customer_email: customer_email,
        client_reference_id: client_reference_id,
        mode: "payment",
        // TODO: customize thanks page with order details
        success_url: "https://www.bigbadcon.com/buy-a-badge-thanks/",
        cancel_url: referer,
    })

    // return session url success or cancel_url
    return {
        statusCode: 303,
        headers: {
            Location: session.url,
        }
    }

}