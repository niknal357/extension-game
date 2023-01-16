chrome.runtime.onMessage.addListener(function (request) {
    if (request.scheme == "dark") {
        chrome.browserAction.setIcon({
            path: {
                128: "icons/icon_dark.png",
                48: "icons/icon_dark.png",
                16: "icons/icon_dark.png",
            },
        });
    }
});
