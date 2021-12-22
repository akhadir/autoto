"use strict";
(function () {
    var pollFlag = true, ajaxCalls = [], tcSidebar, tcPanel;
    // domAgent.init("POLL_REQ");
    // chrome.devtools.panels.create("Autoto", "icon.png", "panel.html", function (panel) {
    //     tcPanel = panel;
    //     panel.show();
    // });
    chrome.devtools.panels.elements.createSidebarPane("Autoto", function (sidebar) {
        tcSidebar = sidebar;
        sidebar.setPage("sidebar.html");
        let captureCB;
        var _window; // Going to hold the reference to sidebar.html's `window`
        // script to connect to background script
        var data = [];
        var port = chrome.runtime.connect({name: 'devtools'});
        port.onMessage.addListener(function(msg) {
            if (captureCB) {
                captureCB(msg);
            }
        });
        const sendMessage = async (tabId, type, evnts, cb) => {
            captureCB = cb;
            port.postMessage({
                tabId,
                type,
                options: {
                    events: evnts
                }
            });
        }
        sidebar.onShown.addListener(function tmp(sidebarPane) {
            sidebar.onShown.removeListener(tmp); // Run once only
            _window = sidebarPane;
            if (_window.DomAgent) {
                _window.DomAgent.sendMessage = sendMessage;
            }
            // Release queued data
            // var msg;
            // while (msg = data.shift()) 
            //     _window.do_something(msg);
            // // Just to show that it's easy to talk to pass a message back:
            // _window.respond = function(msg) {
            //     port.postMessage(msg);
            // };
        });
    });
    // chrome.devtools.panels.elements.onSelectionChanged.addListener(function (res) {
    //     console.log(res);
    // });

})();
//# sourceMappingURL=devtools.js.map