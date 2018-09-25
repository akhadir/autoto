import { Component } from 'react';
import Utils from './Utils';
// import Utils from './Utils';

export default class CopyTC extends Component {
    data: any;
    state: any;
    forceUpdate: any;
    eventOptions: string[];
    constructor(props) {
        super(props);
        this.data = props.data;
        this.state = props.settings;
        this.eventOptions = Utils.getEventsList();
    };
    componentWillReceiveProps(props) {
        this.forceUpdate();
    }
    copyText = () => {
        return JSON.stringify(this.data, null, 4);
    };
    getSimulateEvent = (event) => {
        var eventName,
            node = event.node,
            setValStmt,
            out = '';
        switch (event.event) {
            case 0:
                out = (`
        await page.waitForNavigation({timeout: 0, waitUntil: 'load'});
                `);
                break;
            case 12:
                out = (`
        await page.waitForNavigation({timeout: 0, waitUntil: 'networkidle0'});
                `);
                break;
            case 13:
                out = (`
        await page.waitForSelector('${node}', {timeout: 0, visible: true});
                `);
                break;
            case 14:
                out = (`
        await page.waitForSelector('${node}', {timeout: 0, hidden: true});
                `);
                break;
            default:
                eventName = this.eventOptions[event.event];
                setValStmt = '';
                if (event.evalue) {
                    setValStmt = `target.value = "${event.evalue}";`
                }
                out = (`
        await evaluate(function () {
            var target = document.querySelector("${node}"),
            e = document.createEvent("Event");
            e.initEvent.apply(e, ['${eventName}', true ,true]);
            target.dispatchEvent(e);
            ${setValStmt}
        }, null);
                    `);
                break;
        }
        return out;
    };
    getAssertions = (assertions) => {
        var assertionStmts = assertions.map(function (value, key) {
            var assertStr = '',
                node = value.node,
                assertVal = value.value,
                assertValStmt = '',
                assertType = value.assertType;
            assertVal = assertVal.replace(/'/g, "\\'");
            switch (assertType) {
                case 0:
                    assertStr = `Check for the availability of the node "${node}"`;
                    assertValStmt = `var val = await page.evaluate("document.querySelectorAll('${node}').length");`;
                    assertVal = '1';
                    break;
                case 1:
                    assertStr = `"${node}" should be equal to count "${assertVal}"`;
                    assertValStmt = `var val = await page.evaluate("document.querySelectorAll('${node}').length");`;
                    break;
                case 2:
                    assertStr = `"${node}" should be equal to "${assertVal}"`;
                    assertValStmt = `var val = await page.evaluate("document.querySelector('${node}').innerText"); val = val.trim();`;
                    break;
                default:
            }
            return (`
        ${assertValStmt}
        expect(val, '${assertStr}').to.equal('${assertVal}');
            `);
        });
        return assertionStmts.join('');
    };
    getTc = () => {
        var eventOptions = this.eventOptions,
            that = this;
        var tcList = this.data.map(function (value, key) {
            var eventName = eventOptions[value.event],
                simulateEvent = that.getSimulateEvent(value),
                assertionStmts = that.getAssertions(value.assertions),
                node = value.node;
            return (`
    it('tests event "${eventName}" on node "${node}"', async function() {
        ${simulateEvent}${assertionStmts}
    });
                `);
        });
        return tcList.join('');
    };
    render = () => {
        var tc = this.getTc(),
            URL = this.data[0].URL;
        return (`
/**
* @description 
* @author Auto generated document
*/
// global puppeteer, browser, page, expect;
describe('Spec to test - "${URL}"', function () {
    this.timeout(0);
    before(async function () {
        this.enableTimeouts(false);
        if (!puppeteer) {
            puppeteer = require('puppeteer');
        }
        if (!browser) {
            browser = await puppeteer.launch({headless: true});
        }
        if (!page) {
            page = await browser.newPage();
        }
        if (!expect) {
            expect = require('chai').expect;
        }
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
        });
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36');
        await page.setViewport({
            width: ${this.data[0].dim.width},
            height: ${this.data[0].dim.height}
        })
        await page.goto("${URL}", {timeout: 0, waitUntil: 'networkidle0'});
    });
    function evaluate(func, arg) {
        var args = arg;
        var fn = "(" + func.toString() + ").apply(this, [" + JSON.stringify(args) + "]);";
        return page.evaluate(fn);
    }
    ${tc}
});
        `);
    };
}