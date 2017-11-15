chrome.runtime.sendMessage({NimbleMsg: "StartMasterSuite"}, function(response) {
    console.log(response);
});
