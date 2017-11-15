DEFAULT_WAIT_TIMEOUT = 30000;

/********************************************************************************/
/** Visibility */
/********************************************************************************/

function isSelectorVisible(jQuerySelector) {
    const canSee = isNodeVisible($(jQuerySelector));
    Guardian.log('Is ' + jQuerySelector + ' visible? ' + canSee);
    return  canSee;
}

function isNodeVisible(jQueryElement) {
    if (!jQueryElement) {
        Nimble.log('Expecting a jQuery DOM element');
        console.dir(jQueryElement);
        return false;
    }
    if (!(jQueryElement instanceof jQuery)) {
        Nimble.log('Expecting a jQuery instance');
        console.dir(jQueryElement);
        return false;
    }

    return jQueryElement.is(':visible');
}

/********************************************************************************/
/** Wait */
/********************************************************************************/

function waitUntilDOMReady() {
    return waitUntil(function () {
        return document.readyState === 'complete';
    })
}

function waitUntilSelectorVisible(selector) {
    return waitUntil(function () {
        return isSelectorVisible(selector);
    });
}

function waitUntilSelectorIsNotVisible(selector) {
    return waitUntil(function () {
        return !isSelectorVisible(selector);
    });
}

function waitUntilToastrSuccessMsg() {
    return waitUntilSelectorVisible('.toast.toast-success');
}

function waitUntil(predicate, msg) {
    msg = msg || '';
    return waitUntilTimeout(predicate, DEFAULT_WAIT_TIMEOUT, msg);
}

/**
 * Wait until predicate resolves to true or timeout exceeded.
 *
 * @param predicate function evaluating to 'true' when the wait condition is met
 * @param timeout
 * @param msg to display while waiting. Predicate fn is displayed by default
 * @returns deferred which resolves once the wait condition is met
 */
function waitUntilTimeout(predicate, timeout, msg) {
    msg = msg || predicate.toLocaleString();
    var defer = $.Deferred();
    var checkInverval = 1000;
    var startTime = new Date().getTime();
    var counter = 0;

    // Check the Predicate periodically for true evaluation
    var intervalId = setInterval(function () {
        var now = new Date().getTime();
        if (predicate() === true) {
            defer.resolve();
        } else {
            Nimble.log('Waiting on ... ' + msg + ' (' + counter + '/' + timeout / 1000 + ' s)');
            counter++;
        }
        if (now - startTime > timeout) {
            defer.reject('Timed out while waiting for: ' + msg);
        }
    }, checkInverval);

    // Cancel Timer after defer resolution
    defer.always(function () {
        clearInterval(intervalId);
        counter = 0;
    });
    return defer;
}
