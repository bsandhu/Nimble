/********************************************************************************/
/** DOM interaction */
/********************************************************************************/

/**
 * Look through all children and find text table
 * @param jQueryElement
 */
function innerText(jQueryElement) {
    return jQueryElement
        .map(function (index, elem) {
            return $(elem).text().trim();
        }).filter(function (index, elem) {
            return elem !== ''
        })
}