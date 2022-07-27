/* -------------------------------------------------------------------------- */
/*                 Eventbrite payment processor functions                     */
/* -------------------------------------------------------------------------- */

const eventBriteReferrer = 'https://www.eventbrite.com/';

async function getEventbriteToken() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const eventbriteCode = urlParams.get('code');
    const referrer = document.referrer;
    console.log(eventbriteCode);
    console.log(referrer);

    if (referrer === eventBriteReferrer) {
        console.log("submit Eventbrite token: ", eventbriteCode)
        let res = await fetchData('/payment/eventbrite/token', {
            method: 'POST',
            body: {code: eventbriteCode}
        })
        console.log("Eventbrite token submit response", res)
        if (res.status === 200) { //&& res.headers.get('authorization')) {
            console.log("Eventbrite token stored")
        }
    } else {
        console.log("Call not referred by Eventbrite, ignoring token");
    }
}