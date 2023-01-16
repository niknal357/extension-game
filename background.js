chrome.runtime.onMessage.addListener(function (request) {
    if (request.scheme == "dark") {
        chrome.browserAction.setIcon({
            path: {
                128: "icons/icon2.png",
                48: "icons/icon2.png",
                16: "icons/icon2.png",
            },
        });
    }
});
