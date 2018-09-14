import React, { Component } from 'react';
// import domAgent from "../../chromeJs/DomAgent";
export default class EventForm extends Component {
    constructor(props) {
        super(props);
        this.settings = props.settings;
        this.value = props.event;
        this.key = props.index;
    };
    eventChange = (e) => {
        this.value.event = parseInt(e.target.value, 10);
        this.forceUpdate();
    };
    changeEventTimer = (e) => {
        this.value.timer = parseInt(e.target.value, 10);
    };
    valueChange = (e) => {
        this.value.evalue = e.target.value;
    };
    selectorChange = (e) => {
        this.value.node = e.target.value;
    };
    controlButtons = () => {
        var buttons = null;
        if (this.value.event > 0) {
            buttons = (
                <div className='event-controls'>
                    <button className="run-event btn btn-sm btn-primary" data-index={this.key}>Run</button>
                    <button className="remove-event btn btn-sm btn-primary" data-index={this.key}>Remove</button>
                </div>
            );
        }
        return buttons;
    };
    getSelector = (callback) => {
        // domAgent.process({ type: "DATA_REQ_SEL", callback: callback, data: { usi: true } });
    };
    getSelectorFromRoot = (root, callback) => {
        // domAgent.process({ type: "DATA_REQ_SEL_WITH_ROOT", root: root, callback: callback, data: { usi: true } });
    };
    selectNodeFromBrowser = (e) => {
        var that = this;
        this.getSelector(function (res) {
            that.value.event.node = res;
            that.forceUpdate();
        });
    };
    render = () => {
        return (
            <React.Fragment>
                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                    <label htmlFor={`sbAddEvent${this.key}`}>Select an Event: </label>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                    <input name="eventNode" onClick={this.selectNodeFromBrowser} title="CSS Selector of Element" placeholder="Element" className="event-node input-sm" id={`sbAddEvent${this.key}`} onChange={this.selectorChange} defaultValue={this.value.node}></input>
                    <select className="input-sm" defaultValue={this.value.event} onChange={this.eventChange}>
                        <option value="0">PageLoad</option>
                        <option value="1">Click</option>
                        <option value="2">Change</option>
                        <option value="3">Hover</option>
                        <option value="4">KeyPress</option>
                        <option value="5">KeyUp</option>
                        <option value="6">KeyDown</option>
                        <option value="7">Focus</option>
                        <option value="8">Blur</option>
                        <option value="9">RightClick</option>
                        <option value="10">DoubleClick</option>
                        <option value="11">Submit</option>
                    </select>
                    <input type="text" name="evalue" className="evalue input-sm" onChange={this.valueChange} defaultValue={this.value.evalue} placeholder="Value If Any" title="Value to be added to selected element"></input>
                    <input type="number" min="0" max="15" name="timer" className="timer input-sm" defaultValue={this.value.timer} onChange={this.changeEventTimer} size="2" max-length="2" title="Timer in Seconds" placeholder="Timer"></input>
                    {this.controlButtons()}
                </div>
            </React.Fragment>
        );
    };
}