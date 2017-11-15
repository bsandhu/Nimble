/********************************************************************************/
/** Infrastructure */
/********************************************************************************/

// Global namespace for Nimble functions
var Nimble = Nimble || {};
Nimble.pageObjGenerators = Nimble.pageObjGenerators || [];

function NimbleSetupException(message) {
    this.message = message;
    this.name = "NimbleSetupException";
}

function logRuntimeMsg(sender, request) {
    console.log("Msg: " + JSON.stringify(sender));
    console.log("Msg contents: " + JSON.stringify(request));
}

/********************************************************************************/
/** Test execution hooks */
/********************************************************************************/

chrome.browserAction.onClicked.addListener(function () {
    console.log('Running Master suite');
    runMasterSuite();
});

chrome.runtime.onMessage.addListener(
    function (request, sender) {
        if (request.NimbleMsg === 'StartMasterSuite') {
            logRuntimeMsg(sender, request);
            runMasterSuite();
        }
    });

chrome.runtime.onMessage.addListener(
    function (request, sender) {
        if (request.NimbleMsg === 'ReRunTestSuite') {
            logRuntimeMsg(sender, request);
            tabLoaded(sender.tab.id)
                .then(function () {
                    runSuite(sender.tab.id, request.SuiteFileName)
                });
        }
    });

function tabLoaded(tabId) {
    var loaded = false;
    return waitUntil(function () {
        chrome.tabs.get(tabId, function (tab) {
            if (tab.status === 'complete') {
                console.log('Tab Re-loaded')
                loaded = true;
            }
        });
        return loaded === true;
    });
}
/********************************************************************************/
/** Manual script injection */
/********************************************************************************/

function injectScript(tabId, fileName) {
    if (!tabId) {
        throw new NimbleSetupException('No TabId supplied');
    }
    var defer = $.Deferred();

    chrome.tabs.executeScript(
        tabId,
        {file: fileName},
        function onScriptRun() {
            console.log('Injected ' + fileName + ' .Tab id: ' + tabId);
            if (chrome.extension.lastError) {
                console.error(chrome.extension.lastError);
            }
            defer.resolve(tabId);
        });
    return defer;
}

function injectScripts(tabId, scriptsArray) {
    var defer = $.Deferred();
    var allDefer = $.map(scriptsArray, function (script) {
        return injectScript(tabId, script);
    });
    $.when.apply($, allDefer)
        .then(function () {
            defer.resolve(tabId);
        });
    return defer;
}

function injectJasmine(tabId) {
    chrome.tabs.insertCSS(
        tabId,
        {file: "extension/lib/jasmine/jasmine-2.3.4.css"}
    );
    return injectScripts(tabId,
        ["extension/lib/jquery-2.1.4.js",
            "extension/lib/jasmine/jasmine-2.3.4.js",
            "extension/lib/jasmine/jasmine-html-2.3.4.js",
            "extension/lib/jasmine/jasmine-teamcity-reporter.js",
            "extension/lib/jasmine/jasmine-boot-2.3.4.js"
        ]);
}

/********************************************************************************/
/** Browser tab management */
/********************************************************************************/

function initTabTracking() {
    sessionStorage.setItem('activeTabs', '');
}

function updateTabsInUse(tabId) {
    sessionStorage.setItem('activeTabs', sessionStorage.getItem('activeTabs') + ' ' + tabId);
}

function isTabInUse(tabId) {
    return sessionStorage.getItem('activeTabs').indexOf(tabId) >= 0;
}

/**
 * Query tabs in window for one matching the <host name> of tge given url.
 * If a match is found, Switch and reload else start a new tab
 */
function getTab() {
    var defer = $.Deferred();
    var credentials = {
        username: MasterSuite.username,
        password: MasterSuite.password};

    chrome.tabs.query({url: '*://*/*'}, function onQuery(tabs) {
        var currentTab = document.createElement('a');
        var appTab = document.createElement('a');
        var matchingTabIds = $.map(tabs, function (tab) {
            currentTab.href = tab.url;
            appTab.href = MasterSuite.appUrl;

            var domainMatches = currentTab.host === appTab.host;
            return (domainMatches && (!isTabInUse(tab.id))) ? tab.id : null;
        });

        matchingTabIds.length > 0
            ? switchToExistingTab()
            : createNewAppTab();

        function switchToExistingTab() {
            updateTabsInUse(matchingTabIds[0]);
            chrome.tabs.update(matchingTabIds[0],
                {"active": true, "highlighted": true, "url": MasterSuite.appUrl},
                function onTabSwitch(tab) {
                    console.log("Switching to tab .." + JSON.stringify(tab));
                    registerAuthListener(tab.id, credentials);

                    chrome.tabs.reload(matchingTabIds[0],
                        function () {
                            console.log("Reloading tab .." + tab.url);
                            waitUntilDOMReady().then(function () {
                                defer.resolve(matchingTabIds[0]);
                            })
                        });
                });
        }

        function createNewAppTab() {
            chrome.tabs.create({url: MasterSuite.appUrl},
                function onTabCreate(tab) {
                    registerAuthListener(tab.id, credentials);
                    updateTabsInUse(tab.id);
                    console.log("Created tab .." + JSON.stringify(tab));
                    tabLoaded(tab.id)
                        .then(function () {
                            defer.resolve(tab.id);
                        });
                });
        }
    });

    return defer;
}

/********************************************************************************/
/** Inject credentials */
/********************************************************************************/

function registerAuthListener(tabId, credentials) {
    chrome.webRequest.onAuthRequired.addListener(
        function (details, callback) {
            console.log('Auth Required: ' + JSON.stringify(details));
            if (details.tabId === tabId) {
                console.log('Supplying credentials: ' + JSON.stringify(credentials) + ' to tabId: ' + tabId);
                callback({authCredentials: credentials})
            } else {
                console.log('Skipped credentials');
                callback({});
            }
        },
        {urls: ["<all_urls>"]},
        ['asyncBlocking']);
}


/********************************************************************************/
/** Test suite execution */
/********************************************************************************/

function runMasterSuite() {
    if (!MasterSuite) {
        throw new NimbleSetupException('Could not find MasterSuite definition');
    }
    initTabTracking();
    MasterSuite.run(function () {
        console.log('**** Nimble [Master Suite Done] ****');
    });

}

/**
 * @params Functions with $.Deferreds as return values
 * @returns Partial function which on invocation > runs all supplied fns in $.when wrapper
 */
function inParallel() {

    function _inParallel(runSuiteFns) {
        var defer = $.Deferred();
        var allDeferreds = $.map(runSuiteFns, function (fn) {
            return fn();
        });
        $.when.apply($, allDeferreds)
            .then(function () {
                defer.resolve();
            });
        return defer;
    }

    return _inParallel.bind(this, arguments);
}

/**
 * @param testFile Jasmine test to run
 * @returns Function which opens a Tab and executes the test suite
 */
function run(testFile) {
    return function () {
        var defer = $.Deferred();
        getTab()
            .then(function (tabId) {
                return runSuite(tabId, testFile, MasterSuite.appUrl);
            })
            .then(function () {
                defer.resolve();
            });
        return defer;
    }
}

function runSuite(tabId, testFile) {
    var defer = $.Deferred();
    $.when(injectJasmine(tabId))
        .then(function () {
            return injectScripts(tabId, MasterSuite.imports);
        })
        .then(function () {
            return $.when(
                injectScript(tabId, testFile),
                injectScript(tabId, "extension/lib/startJasmine.js"),
                suiteFinished(tabId)
            ).done(function () {
                    defer.resolve();
                })
        });
    return defer;
}

/**
 * Listens for the 'JasmineDone' msg from the Jasmine-teamcity-reporter.js
 * Note: Injected scripts are able to communicate with the extension via messages.
 *
 * @returns A deferred which resolves when the msg. is received
 */
function suiteFinished(tabId) {
    var defer = $.Deferred();
    chrome.runtime.onMessage.addListener(
        function (request, sender) {
            if (sender.tab && sender.tab.id === tabId && request.NimbleMsg === 'JasmineDone') {
                logRuntimeMsg(sender, request);
                defer.resolve(tabId);

                // Visual notification
                var notification = chrome.notifications.create(tabId + "100",
                    { iconUrl: "icon.png",
                        type: 'basic',
                        title: 'Suite Done',
                        message: 'Jasmine Suite finished execution. You can see results by scrolling down the app page'},
                    function onDon() {
                        console.log('Notified');
                    });
                if (notification) {
                    notification.show();
                }

                // TODO Close by Tab depending on the extension options config
                //  chrome.tabs.remove(tabId, function onTabClose() {
                //      console.log('Tab ' + tabId + ' closed');
                //  })
            }
        });
    return defer;
}

/**
 * Add listener for the Nimble log messages.
 * Forward log msgs to the Nimble.panel channel
 */
chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.sender === "Nimble.panel") {
        notifyNimblePanel(request.msg);
    }

    function notifyNimblePanel(msg) {
        ports.forEach(function (port) {
            port.postMessage(msg);
        });
    }
});


// Track all the ports (persistent connections)
var ports = [];

/**
 * Invoked when a persistent connection is established.
 * Listen for the Nimble Panel connection and track it.
 */
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== "Nimble.panel") {
        return;
    } else {
        ports.push(port);
        console.log('Connected to the Nimble log panel');
    }

    // Remove port when destroyed (eg. when devtools instance is closed)
    port.onDisconnect.addListener(function () {
        if (ports.indexOf(port) !== -1) {
            ports.splice(ports.indexOf(port), 1);
        }
    });
    port.onMessage.addListener(function (msg) {
        // Received message from devtools.
        // At the moment all communication in from Background page --> Nimble log
    });
});


