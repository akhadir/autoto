import React, { Component } from 'react';
import CopyTC from './copy-tc';

export default class CopyForm extends Component {
    forceUpdate: any;
    state = {};
    data: any;
    props: any;
    tcStr: string;
    confStr: string;
    constructor(props) {
        super(props);
        this.data = props.data;
        this.state = props.settings;
    };
    componentWillReceiveProps(props) {
        this.forceUpdate();
    }
    copyText = () => {
        var data = JSON.stringify(this.data, null, 4);
        this.confStr = 'data:application/json;charset=utf-8,' + escape(data);
        return data;
    };
    copyTextURI = (e) => {
        var data = JSON.stringify(this.data, null, 4);
        this.confStr = 'data:application/json;charset=utf-8,' + escape(data);
        this.forceUpdate();
    };

    copyAction = (e) => {
        var data =  document.querySelector(".copy-code pre").innerText;
        this.tcStr = 'data:application/javascript;charset=utf-8,' + escape(data);
        // var input = document.createElement('textarea');
        // input.style.position = 'fixed';
        // input.style.opacity = '0';
        // input.value = document.querySelector(".copy-code pre").innerText;
        // document.body.appendChild(input);
        // input.select();
        // document.execCommand('Copy');
        // document.body.removeChild(input);
        this.forceUpdate();
    };

    render = () => {
        return (
            <React.Fragment>
                <div>
                    <h4>Copy TestCases</h4>
                    <a href={this.tcStr} download="testcase" onClick={this.copyAction} className="save-events-sess btn btn-sm btn-primary" title="Save testcases to a file">Save TC</a>
                    <a href={this.confStr} download="config" onClick={this.copyTextURI} className="save-events-sess btn btn-sm btn-primary" title="Save config to a file">Save Config</a>
                </div>
                <div className="copy-conf">
                    <textarea id="copyText">{this.copyText()}</textarea>
                </div>
                <div className="copy-code">
                    <pre>
                    <CopyTC data={this.data} settings={this.props.settings}></CopyTC>
                    </pre>
                </div>
            </React.Fragment>
        );
    };
}