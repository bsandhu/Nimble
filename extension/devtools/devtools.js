/**
 * Loads the Nimble panel in the side bar - Elements view
 */
chrome.devtools.panels.elements.createSidebarPane(
    "Nimble",
    function (sidebar) {
        sidebar.setPage('extension/devtools/sidebar.html');
        sidebar.setHeight('100vh');
        sidebar.onShown.addListener(function(window){
            // Note: Console logging doesn't seem to work for Sidebar panel
            // alert('Sidebar shown');
        });
    });

/**
 * Create the Nimble tab (next to Console)
 */
chrome.devtools.panels.create(
    "Nimble",
    "icon.png",
    'extension/devtools/console.html',

    function onCreate(extensionPanel) {
        console.log('Added Nimble panel');
        var _window;

        var data = [];

        // Establish an connection (port) with the background page.
        // The background page will forward logs to this channel.
        var port = chrome.runtime.connect({name: 'Nimble.panel'});

        port.onMessage.addListener(function (msg) {
            // Write information to the panel, if exists.
            // If we don't have a panel reference (yet), queue the data.
            if (_window) {
                _window.appendToView(msg);
            } else {
                data.push(msg);
            }
        });

        extensionPanel.onShown.addListener(function tmp(panelWindow) {
            extensionPanel.onShown.removeListener(tmp); // Run once only
            _window = panelWindow;

            // Release queued data
            var msg;
            while (msg = data.shift()) {
                _window.appendToView(msg);
            }
        });
    });