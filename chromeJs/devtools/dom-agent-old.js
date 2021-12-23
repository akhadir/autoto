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
            var node = req.root,
                code = "winOver.getInnerText('" + node + "')";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, (res, isException) => domCallback(res, isException, req, code));
        },
        getNodeCount: function (req) {
            var node = req.root,
                code = "winOver.getNodeCount('" + node + "')";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, (res, isException) => domCallback(res, isException, req, code));
        },
        getInspWindowViewPort: function (req) {
            var code = "winOver.getViewport()";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, (res, isException) => domCallback(res, isException, req, code));
        },
        getInspWindowURL: function (req) {
            chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, function(tab) {
                req.callback(tab.url);
            });
        },
        getScreen: function (req) {
            chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, function(tab) {
                chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, function(res) {
                    var origCallback = req.callback;
                    req.callback = function (newRes) {
                        origCallback({ image: res, clip: JSON.parse(newRes) });
                    }
                    DomWorker.getRect(req);
                });
            });
        },
        takeScreenShot: function (req) {
            var self = this,
                node = "body",
                id;
            if (req.root) {
                node = req.root;
            }
            id = window.md5(node);
            var code = "winOver.takeScreenShot('" + node + "', '" + id + "')";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    self.getScreenShot(id, req.callback);
                }
                else {
                    console.log(code);
                    console.log("Exception: " + JSON.stringify(isException));
                }
            });
        },
        getScreenShot: function (id, callback, index) {
            var self = this,
                code;
            setTimeout (function () {
                code = "winOver.getScreenShots('" + id + "')";
                chrome.devtools.inspectedWindow.eval(code, {
                    "useContentScriptContext": true
                }, function (result, isException) {
                    if (!isException) {
                        if (result === '') {
                            if (!index) {
                                index = 0;
                            } else {
                                index++;
                            }
                            if (index <= 5) {
                                self.getScreenShot(id, callback, index);
                            } else {
                                console.log("Exception: No of attempts to capture screen shot has exceeded.");
                            }
                        } else {
                            callback(result);
                        }
                    }
                    else {
                        console.log(code);
                        console.log("Exception: " + JSON.stringify(isException));
                    }
                });
            }, 1000);
        },
        getRect: function(req) {
            var node = req.root,
                code = "winOver.getRect('" + node + "')";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    if (req.callback) {
                        req.callback(result);
                    }
                }
                else {
                    console.log("Exception" + isException);
                }
            });
        },
        getSelector: function(req) {
            var data = { "selector": undefined }, code = "winOver.getSelector($0, ''," + req.data.usi + ")";
            if (req.root) {
                code = "winOver.getSelector($0, '" + req.root + "', " + req.data.usi + ")";
            }
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    data.selector = result;
                    if (req.callback) {
                        req.callback(result);
                    }
                }
                else {
                    console.log("Exception" + isException);
                }
            });
        },
        getSelectorForce: function (req) {
            var data = { selector: undefined }, code = "winOver.getSelectorForce($0, '" + req.root + "', " + req.data.usi + ")";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    if (result) {
                        data.selector = result;
                        if (req.callback) {
                            req.callback(result);
                        }
                    }
                    else {
                        setTimeout(function () {
                            DomWorker.getSelectorForce(req);
                        }, 1000);
                    }
                }
                else {
                    console.log("Exception" + isException);
                }
            });
        },
        getChildren: function (req) {
            var data = { selector: undefined }, pnode = req.root;
            chrome.devtools.inspectedWindow.eval("winOver.getChildren('" + pnode + "', " + req.data.usi + ")", {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    data.selector = result;
                    if (req.callback) {
                        req.callback(result);
                    }
                }
                else {
                    console.log("Exception" + isException);
                }
            });
        },
        postEvents: function (req) {
            var data = req.data, code = "winOver.postEvents('" + data.node + "', '" + data.event + "', '" + data.value + "')";
            if (DomAgent.sendMessage) {
                DomAgent.sendMessage(chrome.devtools.inspectedWindow.tabId, RUN_EVENTS, data);
            } else {
                console.log('BG Port not initialized');
            }
            // chrome.devtools.inspectedWindow.eval(code, {
            //     "useContentScriptContext": true
            // }, function (result, isException) {
            //     if (!isException) {
            //         if (req.callback) {
            //             req.callback(true);
            //         }
            //     }
            // });
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
            var data = { data: {}, root: String, node: String }, dat = req.data, root = dat.root, node = dat.node, index = dat.nodeIndex, properties = dat.props, propString = JSON.stringify(properties), code = "winOver.getComputedProps('" + root + "', '" + node + "'," + index + ", " + propString + ")";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, function (result, isException) {
                if (!isException) {
                    data.data = result;
                    data.root = root;
                    data.node = node;
                    if (req.callback) {
                        req.callback(data);
                    }
                }
                else {
                    console.log(code);
                    console.log("Exception: " + JSON.stringify(isException));
                }
            });
        },
        getOtherCalls: function (req) {
            var dat = req.data,
                node = dat.dataNode,
                attr = dat.dataAttrib,
                code = "winOver.getOtherCalls('" + node + "', '" + attr + "')";
            chrome.devtools.inspectedWindow.eval(code, {
                "useContentScriptContext": true
            }, (res, isException) => domCallback(res, isException, req, code));
        },
        
    };
})(window);
//# sourceMappingURL=DomAgent.js.map