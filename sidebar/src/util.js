if (!window.DomAgent) {
    window.DomAgent = {process: function () {
        var type = arguments[0].type;
        if (type === 'DATA_REQ_WINDOW_URL') {
            arguments[0].callback(window.location.href);
        } else if (type === 'DATA_REQ_WINDOW_VIEWPORT') {
            arguments[0].callback(JSON.stringify({"width": window.innerWidth, "height": window.innerHeight}));
        } else if (type === 'DATA_REQ_INNER_TEXT') {
            arguments[0].callback("abcd");
        } else if (type === 'DATA_REQ_NODE_COUNT') {
            arguments[0].callback("10");
        }
    }};
}
export default class Utils {
    static getEventIndex = (str) => {
        const eventName = str.toLowerCase();
        return Utils.getEventsList().map((list) => list.toLowerCase()).indexOf(eventName);
    };
    static getSelector = (callback) => {
        window.DomAgent.process({ type: "DATA_REQ_SEL", callback: callback, data: { usi: true } });
    };
    static getSelectorFromRoot = (root, callback) => {
        window.DomAgent.process({ type: "DATA_REQ_SEL_WITH_ROOT", root: root, callback: callback, data: { usi: true } });
    };
    static getScreenShot = (root, callback) => {
        window.DomAgent.process({
            type: "DATA_REQ_SCREEN_SHOT", root: root, callback: function (res) {
                Utils.cropImageToRect(res, callback);
            }, data: { usi: true }
        });
    };
    static runEvent = (event) => {
        window.RunEvents.run(event);
    };
    static runEvents = (events) => {
        window.RunEvents.runAll(events);
    };
    static getInsWindowURL = (callback) => {
        window.DomAgent.process({type: "DATA_REQ_WINDOW_URL", callback: callback});
    };
    static getInnerText = (node, callback) => {
        window.DomAgent.process({type: "DATA_REQ_INNER_TEXT", root: node, callback: callback});
    };
    static getNodeCount = (node, callback) => {
        window.DomAgent.process({type: "DATA_REQ_NODE_COUNT", root: node, callback: callback});
    };
    static getViewPort = (callback) => {
        window.DomAgent.process({type: "DATA_REQ_WINDOW_VIEWPORT", callback: function (result) {
            callback(JSON.parse(result));
        }});
    };
    static cropImageToRect = (res, callback) => {
        var imgURL = res.image,
            rect = res.clip,
            c = document.createElement("canvas"),
            ctx = c.getContext("2d"),
            img = new Image(),
            width = Math.round(rect.width),
            height = Math.round(rect.height),
            x = Math.round(rect.x),
            y = Math.round(rect.y),
            imageData,
            canvas1,
            ctx1;
        img.onload = function () {
            c.width = img.width;
            c.height = img.height;
            ctx.drawImage(img, 0, 0);
            imageData = ctx.getImageData(x, y, width, height);
            canvas1 = document.createElement("canvas");
            canvas1.width = width;
            canvas1.height = height;
            ctx1 = canvas1.getContext("2d");
            ctx1.rect(0, 0, width, height);
            ctx1.fillStyle = 'white';
            ctx1.fill();
            ctx1.putImageData(imageData, 0, 0);
            callback(canvas1.toDataURL("image/png"));
        }
        img.src = imgURL;
    };
    static getEventsList = () => {
        var list = [
            "PageLoad",
            "Click",
            "Change",
            "Hover",
            "KeyPress",
            "KeyUp",
            "KeyDown",
            "Focus",
            "Blur",
            "RightClick",
            "DoubleClick",
            "Submit",
            "NetworkIdle",
            "ElementVisible",
            "ElementHidden",
            "Drag",
            "Drop",
            "TextSelection"
        ];
        return list;
    };
    static grabEvents = (events, callback) => {
        window.DomAgent.grabEvents(events, callback);
    }
    static ungrabEvents = (events, callback) => {
        window.DomAgent.ungrabEvents(events, callback);
    }
    static getAssertionList = () => {
        var list = [
            "Available",
            "Node Count",
            "Inner Text",
        ];
        return list;
    }
}