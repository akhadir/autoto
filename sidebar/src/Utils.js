import React, { Component } from 'react';
export default class Utils {
    static getSelector = (callback) => {
        window.DomAgent.process({ type: "DATA_REQ_SEL", callback: callback, data: { usi: true } });
    };
    static getSelectorFromRoot = (root, callback) => {
        window.DomAgent.process({ type: "DATA_REQ_SEL_WITH_ROOT", root: root, callback: callback, data: { usi: true } });
    };
    static runEvent = (event) => {
        window.RunEvents.run(event);
    };
    static runEvents = (events) => {
        window.RunEvents.runAll(events);
    };
}