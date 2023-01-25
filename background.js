chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        console.log(Date.now()-last_force_logout)
        if (Date.now()-last_force_logout > 1000*60*60*24){
            last_force_logout = Date.now();
            sendResponse({doit: "true"});
            console.log(true)
        } else {
            sendResponse({doit: "false"});
            console.log(false)
        }
    }
);

var last_force_logout = null;

function init(){
    if (last_force_logout == null){
        chrome.storage.local.get(['last_force_logout'], function(result) {
            last_force_logout = result.last_force_logout;
            if (last_force_logout == null) {
                last_force_logout = 0;
            }
            console.log('Value currently is ' + result.last_force_logout);
        });
    }
    setInterval(() => {
        chrome.storage.local.set({'last_force_logout': last_force_logout}, function() {
            console.log('Value is set to ' + last_force_logout);
        });
    }, 10000)
}

init()