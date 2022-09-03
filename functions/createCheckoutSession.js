require('dotenv').config();
const environment = process.env.CONTEXT
const apiKey = environment !== "production"
    ? process.env.STRIPE_TEST_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = require('stripe')(apiKey)

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function paramsToObject(entries) {
    const result = {}
    for(const [key, value] of entries) { // each 'entry' is a [key, value] tupple
      result[key] = value;
    }
    return result;
}

/* -------------------------------------------------------------------------- */
/*                   Main Function for purchasing via Stripe                  */
/* -------------------------------------------------------------------------- */

exports.handler = async function (event, context) {
    const referer = event.headers.referer

    // const body = event.body
    // console.log("🚀 ~ file: createCheckoutSession.js ~ line 28 ~ event.body", event.body)

    const urlParams = new URLSearchParams(event.body)
    const entries = urlParams.entries()
    const params = paramsToObject(entries)
    console.log("🚀 ~ file: createCheckoutSession.js ~ line 30 ~ params", params)

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: params.price_id,
                    quantity: 1,
                }
            ],
            customer_email: params.userEmail,
            client_reference_id: params.userId,
            metadata: {
                userDisplayName: params.userDisplayName,
                age: params.age,
                recipient: params.recipient,
                anon: params.anon,
                recipientEmail: params.recipientEmail.trim(),
            },
            mode: "payment",
            // TODO: customize thanks page with order details
            success_url: "https://www.bigbadcon.com/buy-a-badge-thanks/",
            cancel_url: referer,
            // TODO: add metadata with other person's email address
        })

        // console.log(session)

        // return session url success or cancel_url
        return {
            statusCode: 303,
            headers: {
                Location: session.url,
            }
        }
    } catch (e) {
        console.log("🚀 ~ file: createCheckoutSession.js ~ line 78 ~ e", e)
        return {
            statusCode: 303,
            headers: {
                Location: "https://www.bigbadcon.com/buy-a-badge-fail/",
            }
        }
    }

    return {
        statusCode: 303,
        headers: {
            Location: referer,
        }
    }
}