function setupContainer() {
    var jasminePanel = $('#jasmine-ext-container');
    if (jasminePanel) {
        jasminePanel.remove()
    }

    $(document.body).append('<div id="jasmine-ext-container" style="min-width: 100%; min-height: 100%; position: absolute;"><div>')

    // Note: Triggers the Jasmine Test Suite (See boot.js)
    window.runJasmine();
}

$(document).ready(setupContainer);

