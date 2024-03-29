"use strict";
(function () {
    // Communication from Content Script
    // As of now the complete listener is hardcoded for event-response
    // TODO: To make it support HAR and other requests as well
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        ports[request.senderId].postMessage(request);
        return true;
    });

    // Script to connect to Devtools script
    var ports = {};
    chrome.runtime.onConnect.addListener(function(port) {
        let tabId;
        if (port.name !== "devtools") return;
        const senderId = port.sender.id;
        ports[senderId] = port;
        // Remove port when destroyed (eg when devtools instance is closed)
        port.onDisconnect.addListener(function() {
            delete ports[senderId];
        });
        port.onMessage.addListener(function(msg) {
            msg.senderId = senderId;
            // Received message from devtools. Do something:
            sendMessageToTab(msg);
        });
    });
    // Function to send a message to all devtools.html views:

    // script to connect to Content script
    function sendMessageToTab(msg) {
        try {
            chrome.tabs.sendMessage(
                msg.tabId,
                msg,
                (response) => {
                    msg.callback(response)
                }
            );
        } catch(e) {
            console.log('Window is not active', e);
        }
    }
})();
