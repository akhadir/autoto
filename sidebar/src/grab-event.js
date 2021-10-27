let evnts = ['click', 'mouseup', 'mousedown', 'focus', 'blur', 'keyup', 'keydown', 'keypressed', 'scroll', 'resize', 'mousemove', 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'];
evnts.forEach((evnt) => {
    window.addEventListener('' + evnt + '', function (e) { capture(e); }, false);
});
function capture(e) {
    let evt = e || window.event;
    if (evt) {
        if (evt.isPropagationStopped && evt.isPropagationStopped()) {
            return;
        }
        let et = evt.type ? evt.type : evt;
        let trgt = evt.target ? evt.target : window;
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

        if (typeof trgt !== 'string') {
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
        const event = {
            event: e,
            eventType: et,
            target: trgt,
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
        return event;
    }
}