let winOver2;

(function () {
    const GRAB_EVENTS1 = 'grab_events';
    const UNGRAB_EVENTS1 = 'ungrab_events';
    let devToolsTabId;
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
                trgt = '.' + trgt.className + '#' + trgt.id;
            }
            else if (trgt.id) {
                trgt = '#' + trgt.id;
            }
            else if (trgt.className) {
                trgt = '.' + trgt.className;
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
            chrome.runtime.sendMessage('', data);
        });
    }
    // connecting to BG
    chrome.runtime.onMessage.addListener(async (request) => {
        const { type, senderId, options } = request;
        devToolsTabId = senderId;
        switch (type) {
            case GRAB_EVENTS1:
                winOver2.grabEvents(options.events);
                break;
            case UNGRAB_EVENTS1:
                winOver2.ungrabEvents(options.events);
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
})();