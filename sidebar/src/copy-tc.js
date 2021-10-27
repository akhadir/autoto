import { Component } from 'react';
import Utils from './util';

export default class CopyTC extends Component {
    data: any;
    state: any;
    forceUpdate: any;
    eventOptions: string[];
    headless: string = 'true';
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
        // await page.waitForNavigation({timeout: 0, waitUntil: 'load'});
                `);
                break;
            case 12:
                out = (`
        // await page.waitForNavigation({timeout: 0, waitUntil: 'networkidle0'});
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
    getScreenAssertions = (assertions) => {
        if (assertions.length) {
            this.headless = "false";
            var assertionStmts = assertions.map(function (value, key) {
                var image = value.image,
                    node = value.node;
                
                return (`
        var ssConfig = {path: 'test.png', clip: null};
        ssConfig.clip = await getNodeClip("${node}");
        await page.screenshot(ssConfig);
        await runResemble("${image}");
                `);
            });
            return assertionStmts.join('');
        }
        return '';
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
                    assertStr = `"${node}" should have the text, "${assertVal}"`;
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
                screenAssertionsStmt = that.getScreenAssertions(value.screens),
                node = value.node;
            return (`
    it('tests event "${eventName}" on node "${node}"', async function() {
        ${simulateEvent}${assertionStmts}${screenAssertionsStmt}
    });
                `);
        });
        return tcList.join('');
    };
    render = () => {
        var tc = this.getTc(),
            headless = this.headless,
            URL = this.data[0].URL;
        return (`
/**
* @description 
* Auto generated document
*/
var puppeteer, browser, page, expect, resemble, fs;
describe('Spec to test - "${URL}"', function () {
    this.timeout(0);
    var count = 0,
        compareThreshold = 5;
    before(async function () {
        this.enableTimeouts(false);
        if (!puppeteer) {
            puppeteer = require('puppeteer');
        }
        if (!browser) {
            browser = await puppeteer.launch({headless: ${headless}});
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
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
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
    async function getNodeClip(cssSel) {
        var clip;
        try {
            clip = await evaluate(function (cssSel) {
                var node = document.querySelector(cssSel),
                    rect = node.getBoundingClientRect();
                return {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                };
            }, cssSel);
        } catch (e) {
            console.log("Node not found =>" + cssSel);
            throw new Error("Node not found exception. Node =>" + cssSel);
        }  
        return clip;
    }
    function runResemble (file) {
        if (!resemble) {
            resemble = require("resemblejs");
        }
        if (!fs) {
            fs = require("fs");
        }
        var p = new Promise(function (resolve, reject) {
            resemble(file).compareTo("test.png").ignoreLess().onComplete(function(data){
                fs.writeFileSync('error-' + count + '.png', data.getBuffer());
                expect(parseInt(data.misMatchPercentage), "Image Comparison Failed").to.be.below(compareThreshold);
                expect(data.isSameDimensions).to.equal(true);
                resolve(true);
            }); 
        });
        return p;
    }
    ${tc}
});
        `);
    };
}