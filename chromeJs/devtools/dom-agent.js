"use strict";
const GRAB_EVENTS = 'grab_events';
const UNGRAB_EVENTS = 'ungrab_events';
(function (DomAgents) {
    if (!DomAgents.DomAgent) {
        DomAgents.DomAgent = {
            sendMessage: undefined,
            reqIndex: 0,
            loopFlag: true,
            requestQueue: {},
            pollString: "POLL_RES",
            init: function (pollString) {
                if (pollString) {
                    this.pollString = pollString;
                }
            },
            process: function (request) {
                var id, out, type = request.type;
                if (type === 'DATA_REQ_SEL') {
                    DomWorker.getSelector(request);
                }
                else if (type === 'DATA_REQ_SEL_WITH_ROOT') {
                    DomWorker.getSelectorForce(request);
                }
                else if (type === 'DATA_REQ_SEL_CHILDREN') {
                    DomWorker.getChildren(request);
                }
                else if (type === 'DATA_REQ_PROPS') {
                    DomWorker.getProperties(request);
                }
                else if (type === 'DATA_REQ_OTHER_CALLS') {
                    DomWorker.getOtherCalls(request);
                }
                else if (type === 'DATA_REQ_AJAX_CALLS') {
                    DomWorker.getAjaxCalls(request);
                }
                else if (type === 'DATA_POST_EVENTS') {
                    DomWorker.postEvents(request);
                }
                else if (type === 'DATA_REQ_SCREEN_SHOT') {
                    DomWorker.getScreen(request);
                }
                else if (type === 'DATA_REQ_INNER_TEXT') {
                    DomWorker.getInnerText(request);
                }
                else if (type === 'DATA_REQ_NODE_COUNT') {
                    DomWorker.getNodeCount(request);
                }
                else if (type === 'DATA_REQ_WINDOW_URL') {
                    DomWorker.getInspWindowURL(request);
                }
                else if (type === 'DATA_REQ_WINDOW_VIEWPORT') {
                    DomWorker.getInspWindowViewPort(request);
                }
                else {
                    if (this.size(this.requestQueue) === 0) {
                        this.reqIndex = 1;
                        id = 0;
                    }
                    else {
                        id = this.reqIndex++;
                    }
                    this.requestQueue[id] = request;
                    out = this.clone(request);
                    out.id = id;
                    delete out.callback;
                    this.run(out);
                }
            },
            // new sendMessage replacing eval.
            // TODO: Migrate all eval to sendMessage
            grabEvents: function (evnts, captureCB) {
                if (DomAgent.sendMessage) {
                    DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, GRAB_EVENTS, evnts, captureCB);
                } else {
                    console.log('BG Port not initialized');
                }
            },
            ungrabEvents: function (evnts, captureCB) {
                if (DomAgent.sendMessage) {
                    DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, UNGRAB_EVENTS, evnts, captureCB);
                } else {
                    console.log('BG Port not initialized');
                }
            },
            run: function (options) {
                var reqQ = this.requestQueue;
                chrome.runtime.sendMessage(options, function (res) {
                    var out;
                    if (res && res.data) {
                        out = res.data;
                    }
                    reqQ[options.id].callback(out);
                    delete reqQ[options.id];
                });
            },
            reset: function () {
                this.requestQueue = {};
                this.reqIndex = 0;
            },
            size: function (obj) {
                var size = 0, key;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        size++;
                    }
                }
                return size;
            },
            clone: function (obj) {
                var out = {}, key;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        out[key] = obj[key];
                    }
                }
                return out;
            }
        };
    }
    var ajaxCalls = {};
    const domCallback = function (result, isException, req, code) {
        if (!isException) {
            req.callback(result);
        }
        else {
            console.log(code);
            console.log("Exception: " + JSON.stringify(isException));
        }
    };
    var DomWorker = {
        getInnerText: function (req) {
            let node = req.root;
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getInnerText', [node], (res) => {
                    domCallback(res.resp, false, req, 'getInnerText');
                });
            } else {
                console.log('BG Port not initialized');
            }
        },
        getNodeCount: function (req) {
            let node = req.root;
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getNodeCount', [node], (res) => {
                    domCallback(res.resp, false, req, 'getInnerText');
                });
            } else {
                console.log('BG Port not initialized');
            }
        },
        getInspWindowViewPort: function (req) {
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getViewport', undefined, (res) => {
                    domCallback(res.resp, false, req, 'getInnerText');
                });
            } else {
                console.log('BG Port not initialized');
            }
        },
        getInspWindowURL: function (req) {
            chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, function (tab) {
                req.callback(tab.url);
            });
        },
        getScreen: function (req) {
            chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, function (tab) {
                chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, function (res) {
                    var origCallback = req.callback;
                    req.callback = function (newRes) {
                        origCallback({ image: res, clip: newRes });
                    }
                    DomWorker.getRect(req);
                });
            });
        },
        getRect: function (req) {
            let node = req.root;
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getRect', [node], (res) => {
                    domCallback(res.resp, false, req, 'getRect');
                });
            } else {
                console.log('BG Port not initialized');
            }
        },
        getSelector: function (req) {
            let data = { "selector": undefined };
            let inp = ['$0', '', req.data.usi];
            if (req.root) {
                inp = ['$0', req.root, req.data.usi];
            }
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getSelector', inp, (result) => {
                    data.selector = result.resp;
                    if (req.callback) {
                        req.callback(result.resp);
                    }
                });
            } else {
                console.log('BG Port not initialized');
            }
        },
        getSelectorForce: function (req) {
            let data = { "selector": undefined };
            let inp = ['$0', req.root, req.data.usi];
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getSelectorForce', inp, (result) => {
                    if (result) {
                        data.selector = result.resp;
                        if (req.callback) {
                            req.callback(result.resp);
                        }
                    }
                    else {
                        setTimeout(function () {
                            DomWorker.getSelectorForce(req);
                        }, 1000);
                    }
                });
            } else {
                console.log('BG Port not initialized');
            }
        },
        getChildren: function (req) {
            let data = { "selector": undefined };
            let inp = ['$0', '', req.data.usi];
            let parentNode = req.root;
            if (req.root) {
                inp = [parentNode, req.data.usi];
            }
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getSelector', inp, (result) => {
                    data.selector = result.resp;
                    if (req.callback) {
                        req.callback(result.resp);
                    }
                });
            } else {
                console.log('BG Port not initialized');
            }
        },
        postEvents: function (req) {
            var data = req.data;
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'postEvents', data.event, () => { });
            } else {
                console.log('BG Port not initialized');
            }
        },
        _find: function (array, key, kvalue) {
            var i, out, temp, len = array.length;
            for (i = 0; i < len; i++) {
                temp = array[i];
                if (temp[key] == kvalue) {
                    out = temp;
                    break;
                }
            }
            return out;
        },
        getAjaxCalls: function (req) {
            var data = [], id, entry, header, i, len;
            chrome.devtools.network.getHAR(function (log) {
                len = log.entries.length;
                for (i = 0; i < len; i++) {
                    entry = log.entries[i];
                    header = DomWorker._find(entry.request.headers, "name", "X-Requested-With");
                    if (header && header['value'] === "XMLHttpRequest") {
                        id = window.md5(JSON.stringify(entry));
                        if (!ajaxCalls[id]) {
                            entry.request.clearPrev = false;
                            data.push(entry.request);
                            ajaxCalls[id] = entry.request;
                        }
                    }
                }
                if (req.callback) {
                    req.callback(data);
                }
            });
        },
        getProperties: function (req) {
            var data = { data: {}, root: '', node: '' },
                dat = req.data,
                root = dat.root,
                node = dat.node,
                index = dat.nodeIndex,
                properties = dat.props,
                propString = JSON.stringify(properties),
                params = [root, node, index, propString];
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getComputedProps', params, (result) => {
                    data.data = result.resp;
                    data.root = root;
                    data.node = node;
                    if (req.callback) {
                        req.callback(data);
                    }
                });
            } else {
                console.log('BG Port not initialized');
            }
        },
        getOtherCalls: function (req) {
            var dat = req.data,
                node = dat.dataNode,
                attr = dat.dataAttrib;
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, 'getOtherCalls', [node, attr], (res) => {
                    domCallback(res.resp, false, req, 'getOtherCalls');
                });
            } else {
                console.log('BG Port not initialized');
            }
        },

    };
})(window);
//# sourceMappingURL=DomAgent.js.map