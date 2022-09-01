/* -------------------------------------------------------------------------- */
/*                 Eventbrite payment processor functions                     */
/* -------------------------------------------------------------------------- */

const eventBriteReferrer = 'https://www.eventbrite.com/';

function getEventbriteToken() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const eventbriteCode = urlParams.get('code');
    const referrer = document.referrer;
    console.log(eventbriteCode);
    console.log(referrer);

    if (referrer === eventBriteReferrer) {
        console.log("submit Eventbrite token: ", eventbriteCode)
        let res = fetchData('/payment/eventbrite/token', {
            method: 'POST',
            body: {code: eventbriteCode}
        })
        console.log("Eventbrite token submit response", res)
        if (res.status === 200) { //&& res.headers.get('authorization')) {
            console.log("Eventbrite token stored")
        }
        window.location.replace("/eventbrite-purchase/");
    } else {
        console.log("Call not referred by Eventbrite, ignoring token");
    }
}

const eventbriteOrderCallback = async function () {
    const paymentObj = arguments[0];
    const orderCode = paymentObj['orderId'];
    console.log("submit Eventbrite order code: ", orderCode)
    let res = await fetchData('/payment/eventbrite/order', {
        method: 'POST',
        body: {orderId: orderCode}
    })
    console.log("Eventbrite order code submit response", res)
    if (res.status === 200) { //&& res.headers.get('authorization')) {
        console.log("Eventbrite order code stored")
    }
    console.log('Order complete!');
};