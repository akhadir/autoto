"use strict";
(function () {
    var pollFlag = true, ajaxCalls = [], domAgent = window.DomAgent, tcSidebar, tcPanel;
    domAgent.init("POLL_REQ");
    // chrome.devtools.panels.create("Autoto", "icon.png", "panel.html", function (panel) {
    //     tcPanel = panel;
    //     panel.show();
    // });
    chrome.devtools.panels.elements.createSidebarPane("Autoto", function (sidebar) {
        tcSidebar = sidebar;
        sidebar.setPage("sidebar.html");
    });
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function (res) {
        console.log(res);
    });
})();
//# sourceMappingURL=devtools.js.map