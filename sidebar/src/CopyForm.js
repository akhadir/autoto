import React, { Component } from 'react';
// import Utils from './Utils';

export default class CopyForm extends Component {
    constructor(props) {
        super(props);
        this.data = props.data;
        this.events = this.data.events;
        this.state = props.settings;
    };
    componentWillReceiveProps(props) {
        this.forceUpdate();
    }
    copyText = () => {
        return JSON.stringify(this.events, null, 4);
    };
    render = () => {
        return (
            <React.Fragment>
                <div>
                    <h4>Copy TestCases</h4>
                </div>
                <div>
                    <textarea id="copyText">{this.copyText()}</textarea>
                </div>
            </React.Fragment>
        );
    };
}