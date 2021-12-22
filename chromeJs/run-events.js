"use strict";
(function (RunEvents_1) {
    RunEvents_1.RunEvents = {
        events: [],
        init: function (events) {
            this.events = $.extend(true, [], events);
        },
        getEventName: function (input) {
            var out = "click";
            switch (input) {
                case "0":
                    out = "";
                    break;
                case "1":
                    out = "click";
                    break;
                case "2":
                    out = "change";
                    break;
                case "3":
                    out = "mouseover";
                    break;
                case "4":
                    out = "keypress";
                    break;
                case "5":
                    out = "keyup";
                    break;
                case "6":
                    out = "keydown";
                    break;
                case "7":
                    out = "focus";
                    break;
                case "8":
                    out = "blur";
                    break;
                case "9":
                    out = "rightclick";
                    break;
                case "10":
                    out = "doubleclick";
                    break;
                case "11":
                    out = "submit";
                    break;
            }
            return out;
        },
        run: function (event, callback) {
            var value, data, eventName = this.getEventName(event.event + '');
            if (eventName) {
                if (event.evalue) {
                    value = event.evalue;
                }
                data = {
                    node: event.node,
                    event: eventName,
                    value: value
                };
                window.DomAgent.process({ type: "DATA_POST_EVENTS", data: data, callback: function (res) {
                    setTimeout(function () {
                        if (callback) {
                            callback();
                        }
                    }, event.timer * 1000);
                } });
            }
            else {
                if (callback) {
                    callback();
                }
            }
        },
        runIndex: function (index, event, callback) {
            this.run(event, callback);
        },
        runAll: function (events) {
            var self = this,
                revents;
            if (events && events.length) {
                revents = $.extend(true, [], events);
                self.runIndex(0, revents[0], function () {
                    revents.splice(0, 1);
                    if (revents.length) {
                        self.runAll(revents);
                    }
                });
            }
        }
    };
})(window);