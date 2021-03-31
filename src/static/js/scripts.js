document.addEventListener('DOMContentLoaded', function() {
    darkmode()
});

function darkmode() {
    // Grab state from localStorage
    const storedMode = window.localStorage.getItem('darkmode');

    // setState based on stored mode or set to auto
    if (storedMode) {
        $(`#theme-toggle input[value='${storedMode}']`).checked = true;
        setState(storedMode);
    } else setState('auto');

    function setState(state) {
        document.body.classList.remove("light","dark");
        if (state !== 'auto') document.body.classList.add(state);
        window.localStorage.setItem('darkmode',state);
    }

    $$("#theme-toggle input").forEach(t => {
        t.addEventListener('click', e => {
            if (t.checked) setState(t.getAttribute("value"));
        });
    });

}


/*!
 * Get the first matching element in the DOM
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String} selector The element selector
 * @param  {Node}   parent   The parent to search in [optional]
 * @return {Node}            The element
 */
var $ = function (selector, parent) {
    return (parent ? parent : document).querySelector(selector);
};

/*!
 * Get an array of all matching elements in the DOM
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String} selector The element selector
 * @param  {Node}   parent   The parent to search in [optional]
 * @return {Array}           Th elements
 */
var $$ = function (selector, parent) {
    return Array.prototype.slice.call((parent ? parent : document).querySelectorAll(selector));
};