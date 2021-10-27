import { useCallback, useEffect } from "react";

function capture(e, captureCB) {
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
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            xx = w.innerWidth || e.clientWidth || g.clientWidth,
            yy = w.innerHeight || e.clientHeight || g.clientHeight;
        const grabbedEvent = {
            event: e,
            eventType: et,
            targetSelector: trgt,
            target: target,
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
}
export default function useGrabEvent(props: { captureCB?: (grabbedEvent) => void; enableMouseEvents?: boolean; }) {
    const { captureCB, enableMouseEvents } = props;
    const evnts = ['click', 'focus', 'blur', 'keyup', 'keydown', 'keypressed', 'scroll', 'resize', 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'];
    if (enableMouseEvents) {
        evnts.push('mouseup', 'mousedown', 'mousemove');
    }
    const captureWrap = useCallback((e) => {
        capture(e, captureCB);
    }, []);
    const stopGrab = useCallback(() => {
        evnts.forEach((evnt) => {
            window.removeEventListener('' + evnt + '', captureWrap, false);
        });
    }, [evnts]);
    const startGrab = useCallback(() => {
        evnts.forEach((evnt) => {
            window.addEventListener('' + evnt + '', captureWrap, false);
        });
    }, [evnts]);
    useEffect(() => {
        return stopGrab;
    }, []);
    return { stopGrab, startGrab };
}
