$( document ).ready(function () {
    var clearLink = $('#nimble-console-clear');
    clearLink.click(function () {
        logContainer.text('');
    });
});

var logContainer;

function appendToView(msg) {
    logContainer = logContainer || $('#nimble-console');
    logContainer.append("<br/>");
    logContainer.append(msg);
    logContainer.animate({ scrollTop: logContainer.height()/logContainer.css('line-height') }, 50);
}


