/**
 * Fills in tje PageObject with corresponding attributes from the JSON data
 * @param pageObj Page to be filled
 * @param dataSet JSON data structure
 */
function fill(pageObj, dataSet) {
    var defer = $.Deferred();

    for (var attr in dataSet) {
        if (pageObj.hasOwnProperty(attr)
            && dataSet.hasOwnProperty((attr))
            && isValidDOMInput(dataSet[attr])) {
            try {
                pageObj[attr].val(dataSet[attr]);
                Nimble.log('Set value ' + dataSet[attr] + ' on ' + attr);
            } catch (ex) {
                console.error('Failed to fill attr ' + attr);
            }
        }
    }
    defer.resolve();
    return defer;
}

/**
 * Matches/verifies the attributes on the PageObject against the corresponding attributes from the JSON data
 * @param pageObj Page to be inspected
 * @param dataSet JSON data structure
 */
function verify(pageObj, dataSet, attrsToIgnore) {
    attrsToIgnore = attrsToIgnore || [];
    var mismatches = [];

    for (var attr in dataSet) {
        if (pageObj.hasOwnProperty(attr)
            && dataSet.hasOwnProperty((attr))
            && isValidDOMInput(dataSet[attr])) {
            try {
                if (attrsToIgnore.indexOf(attr) >= 0) {
                    Nimble.log('Ignoring attr: ' + attr);
                    continue;
                }
                var pageValue = pageObj[attr].val();
                var datasetValue = String(dataSet[attr]);

                if (pageValue == datasetValue || String(pageValue) == String(datasetValue)) {
                    Nimble.log(attr + ' verified - OK');
                } else {
                    mismatches.push(attr);
                    Nimble.log(
                            attr + ' failed verification. Page value' + pageValue + " != Dataset " + datasetValue);
                }
            } catch (ex) {
                mismatches.push(attr);
                Nimble.log('Failed to match attr ' + attr);
            }
        }
    }
    return mismatches;
}

var Nimble = Nimble || {};
Nimble.log = function (msg) {
    chrome.runtime.sendMessage({sender: 'Nimble.panel', msg: msg});
}
