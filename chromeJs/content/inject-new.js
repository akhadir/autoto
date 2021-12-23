(function () {
    const GRAB_EVENTS = 'grab_events';
    const UNGRAB_EVENTS = 'ungrab_events';
    let winOver, winOver2;
    let devToolsTabId;
    let eventCaptureReqId;
    const capture = function (e, captureCB) {
        const cb = captureCB || winOver2.captureCB;
        let evt = e || window.event;
        if (evt && !(evt.isPropagationStopped && evt.isPropagationStopped())) {
            let et = evt.type ? evt.type : evt;
            let trgt = evt.target ? evt.target : document.body;
            const target = evt.target ? evt.target : document;
            let time = Math.floor(Date.now() / 1000);
            let x = 0, y = 0, scrolltop = 0;
            if (evt.pageX) {
                x = evt.pageX;
            }
            if (evt.pageY) {
                y = evt.pageY;
            }
            if (trgt.scrollTop) {
                scrolltop = trgt.scrollTop;
            }
            if (trgt.className && trgt.id) {
                trgt = '.' + trgt.className.replace(/\s/g, '.') + '#' + trgt.id;
            }
            else if (trgt.id) {
                trgt = '#' + trgt.id;
            }
            else if (trgt.className) {
                trgt = '.' + trgt.className.replace(/\s/g, '.');
            } else {
                trgt = trgt.tagName;
            }
    
            if (trgt && typeof trgt !== 'string') {
                if (trgt.tagName) {
                    trgt = trgt.tagName;
                }
                else {
                    trgt = trgt.toString().toLowerCase();
                    trgt = trgt.replace('[object ', '');
                    trgt = trgt.replace(']', '');
                    trgt = trgt.replace('htmlbodyelement', 'BODY');
                }
            }
            let ctrlKeys = [];
            if (evt.shiftKey) {
                ctrlKeys.push('shift');
            }
            if (evt.altKey) {
                ctrlKeys.push('alt');
            }
            if (evt.metaKey) {
                ctrlKeys.push('meta');
            }
            if (evt.ctrlKey) {
                ctrlKeys.push('ctrl');
            }
            let w = window,
                d = w.document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                xx = w.innerWidth || e.clientWidth || g.clientWidth,
                yy = w.innerHeight || e.clientHeight || g.clientHeight;
            const grabbedEvent = {
                event: e,
                eventType: et,
                targetSelector: trgt,
                // target: target,
                scrollTop: scrolltop,
                pointer: {
                    x,
                    y
                },
                timestamp: time,
                ctrlKeys,
                width: xx,
                height: yy,
                keyCode: evt.keyCode,
            };
            if (captureCB) {
                captureCB(grabbedEvent);
            }
        }
    };
    const captureWrap = function (e) {
        capture(e, (data) => {
            data.senderId = devToolsTabId;
            data.reqId = eventCaptureReqId;
            chrome.runtime.sendMessage('', data);
        });
    }
    // connecting to BG
    chrome.runtime.onMessage.addListener(async (request, sendResponse) => {
        const { type, senderId, reqId, options } = request;
        devToolsTabId = senderId;
        eventCaptureReqId = reqId;
        switch (type) {
            case GRAB_EVENTS:
                winOver2.grabEvents(options.params);
                break;
            case UNGRAB_EVENTS:
                winOver2.ungrabEvents(options.params);
                break;
            default:
                const { params } = options;
                if (params && params.length && params[0] === '$0') {
                    params[0] = document.activeElement;
                }
                const resp = winOver[type].apply(winOver, options.params);
                const out = {
                    resp,
                    senderId: devToolsTabId,
                    reqId,
                }
                chrome.runtime.sendMessage('', out);
                break;
        }
        return true;
    });
    winOver2 = {
        grabEvents: function (evnts) {
            evnts.forEach((evnt) => {
                window.addEventListener('' + evnt + '', captureWrap, false);
            });
        },
        ungrabEvents: function (evnts) {
            evnts.forEach((evnt) => {
                window.removeEventListener('' + evnt + '', captureWrap, false);
            });
        },
    };
    winOver = {
        observedAjaxCalls: [],
        takenScreenShots: {},
        isFocusable: function (node) {
            var out, tag = node.tagName;
            if (tag == 'A' || tag == "SELECT" || tag == "INPUT" || tag == "AREA" ||
                tag == "BUTTON" || node.tabIndex >= 0 || tag == "TEXTAREA") {
                out = true;
            }
            else {
                out = false;
            }
            return out;
        },
        getFocusable: function (node) {
            var out = [], jout;
            if ($) {
                jout = $(node).find("a, button, select, input, [tabindex='0'], textarea, area");
                jout.each(function (i) {
                    var node = jout[i];
                    out.push({ tagName: node.tagName, id: node.id, className: node.className });
                });
            }
            else {
                throw ("JQUERY INJECT IS NOT WORKING");
            }
            return out;
        },
        observeAjaxCalls: function () {
            this.observedAjaxCalls = [];
            var ajaxSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function () {
                winOver.observedAjaxCalls.push(arguments);
                ajaxSend.apply(this, arguments);
            };
        },
        getObservedAjaxCalls: function () {
            var out = winOver.observedAjaxCalls;
            return out;
        },
        getFocusables: function (node) {
            var jout = {};
            if ($) {
                jout = $(node).find("a, button, select, input, [tabindex='0'], textarea, area");
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
            return jout;
        },
        getComputedProps: function (root, node, nodeIndex, properties) {
            var out = {}, i, attributes, attrName, len, cNode;
            if ($) {
                cNode = $(root).find(node).eq(nodeIndex);
                $.each(properties, function (index, prop) {
                    if (prop === "data") {
                        attributes = cNode[0].attributes;
                        len = attributes.length;
                        for (i = 0; i < len; i++) {
                            attrName = attributes[i];
                            if (attrName.name.indexOf("data-") === 0) {
                                out[attrName.name] = attrName.value;
                            }
                        }
                    }
                    else if (prop === "value") {
                        out[prop] = cNode.val();
                    }
                    else if (prop === "focus") {
                        out[prop] = (document.activeElement == cNode[0]);
                    }
                    else {
                        out[prop] = cNode.css(prop);
                    }
                });
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
            return out;
        },
        getSelectorForce: function (node, root, usi) {
            var out, node = $(node);
            if ($(root).has(node).length) {
                out = this.getSelector(node, root, usi);
            }
            else {
                out = "";
            }
            return out;
        },
        getSelector: function (node, root, usi, maxDepth) {
            var self = this, out = "", nindex, index = 0, rootNode, parents, parent;
            try {
                if ($) {
                    parents = $(node).parents("[id]");
                    if (root) {
                        maxDepth = 0;
                        rootNode = $(root);
                    }
                    parents.each(function (i) {
                        var node = parents[i];
                        index++;
                        if (!rootNode || rootNode.has(node).length) {
                            if (node.id.indexOf(":") === -1) {
                                if (usi) {
                                    out = '#' + node.id + ' ' + out;
                                }
                                else {
                                    out = self.getClassNameSel(node) + ' ' + out;
                                }
                                if (maxDepth && index <= maxDepth) {
                                    return false;
                                }
                            }
                        }
                        else {
                            return false;
                        }
                    });
                    if (usi) {
                        out += self.getParentClass($(node)[0]) + ' ';
                    }
                }
                else {
                    throw "JQUERY INJECT IS NOT WORKING";
                }
            }
            catch (e) {
                return out;
            }
            if (usi && node.id && node.id.indexOf(":") === -1) {
                out += '#' + node.id;
            }
            else {
                out += self.getClassNameSel(node);
            }
            nindex = self.getNodeIndex(node, rootNode, out);
            if (nindex > -1) {
                out += ":nth(" + nindex + ")";
            }
            return out;
        },
        getParentClass: function (node) {
            var parent = $(node).parent(),
                out = '';
            if (parent.length && !parent[0].id) {
                if (parent[0].className) {
                    out = '.' + parent[0].className.trim().replace(/\s+/g, '.');
                } else {
                    out = this.getParentClass(parent[0]);
                }
            }
            return out;
        },
        getClassNameSel: function (node) {
            var out = node.tagName;
            if (node.className && node.className.indexOf(":") === -1) {
                out += '.' + node.className.trim().replace(/\s+/g, '.');
            }
            return out;
        },
        getNodeIndex: function (node, rootNode, selector) {
            var nodes, i, len, cnode, jnode = $(node), out = -1;
            if (rootNode) {
                nodes = rootNode.find(selector);
            }
            else {
                nodes = $(selector);
            }
            len = nodes.length;
            if (len > 1) {
                for (i = 0; i < len; i++) {
                    cnode = nodes.eq(i);
                    if (cnode[0] == jnode[0]) {
                        out = i;
                        break;
                    }
                }
            }
            return out;
        },
        getChildren: function (root, usi) {
            var out = [], children;
            if ($) {
                children = winOver.getFocusables(root);
                children.each(function (index, node) {
                    out.push(winOver.getSelector(node, root, usi));
                });
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
            return out;
        },
        getOtherCalls: function (node, attrib) {
            var out = '';
            if ($) {
                out = JSON.parse($(node).attr('data-' + attrib));
                $(node).attr('data-' + attrib, '');
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
            return out;
        },
        postEvents: function (node, event, value, options) {
            var jnode;
            if ($) {
                jnode = $(node);
                if (value) {
                    jnode.val(value);
                }
                dispatcherEvent(jnode[0], options, event, true, true);
            }
            else {
                throw "JQUERY INJECT IS NOT WORKING";
            }
        },
        takeScreenShot: function (node, id) {
            window.html2canvas($(node)[0], {  
                onrendered: function(canvas) {
                  var img = canvas.toDataURL()
                  winOver.takenScreenShots[id] = img;
                } 
            });
        },
        getScreenShots: function (id) {
            var out = '';
            if (winOver.takenScreenShots[id]) {
                out = winOver.takenScreenShots[id];
                delete winOver.takenScreenShots[id];
            }
            return out;
        },
        getRect: function (node) {
            return JSON.stringify($(node)[0].getBoundingClientRect());
        },
        getViewport: function () {
            return JSON.stringify({"width": window.innerWidth, "height": window.innerHeight});
        },
        getInnerText: function (node) {
            return $(node)[0].innerText;
        },
        getNodeCount: function (node) {
            return $(node).length;
        }
    };
    var dispatcherEvent = function (target, eventOptions, ...args) {
        var e = document.createEvent("Event");
        e.initEvent.apply(e, args);
        if (eventOptions) {
            e.altKey = eventOptions.altKey;
            e.ctrlKey = eventOptions.ctrlKey;
            e.shiftKey = eventOptions.shiftKey;
            e.metaKey = eventOptions.metaKey;
            e.keyCode = eventOptions.keyCode;
            e.charCode = eventOptions.charCode;
        }
        target.dispatchEvent(e);
    };
})();