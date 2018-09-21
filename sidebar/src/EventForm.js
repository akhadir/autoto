import React, { Component } from 'react';
import Utils from './Utils';

export default class EventForm extends Component {
    state =  {event: null};
    constructor(props) {
        super(props);
        this.settings = props.settings;
        this.state.event = props.event;
    };
    eventChange = (e) => {
        var eventIndex = parseInt(e.target.value, 10);
        var event = JSON.parse(JSON.stringify(this.state.event));
        event.event = eventIndex;
        this.setState({event: event});
        this.props.event.event = eventIndex;
    };
    removeEvent = function (e) {
        this.props.remove(this.props.index);
        e.preventDefault();
    };
    componentDidUpdate = (prevProps) => {
        if (prevProps !== this.props) {
            this.setState({event: this.props.event});
        }
    };
    changeEventTimer = (e) => {
        var timer = parseInt(e.target.value, 10);
        var event = JSON.parse(JSON.stringify(this.state.event));
        event.timer = timer;
        this.setState({event: event});
        this.props.event.timer = timer;
    };
    valueChange = (e) => {
        var event = JSON.parse(JSON.stringify(this.state.event));
        event.evalue = e.target.value;
        this.setState({event: event});
        this.props.event.evalue = event.evalue;
    };
    selectorChange = (e) => {
        if (!this.selectorUpdate) {
            var event = JSON.parse(JSON.stringify(this.state.event));
            event.node = e.target.value;
            this.setState({event: event});
            this.props.event.node = event.node;
        }
        this.selectorUpdate = false;
    };
    runEvent = (e) => {
        Utils.runEvent(this.state.event);
        e.preventDefault();
    };
    selectNodeFromBrowser = (e) => {
        e.preventDefault();
        var that = this;
        Utils.getSelector(function (res) {
            that.selectorUpdate = true;
            var event = JSON.parse(JSON.stringify(that.state.event));
            event.node = res;
            that.setState({event: event});
            that.props.event.node = event.node;
        });
    };
    controlButtons = () => {
        var buttons = null;
        if (this.state.event.event > 0) {
            buttons = (
                <div className='event-controls'>
                    <button className="run-event btn btn-sm btn-primary" data-index={this.key} onClick={this.runEvent}>Run</button>
                    <button className="remove-event btn btn-sm btn-primary" data-index={this.key} onClick={this.removeEvent.bind(this)}>Remove</button>
                </div>
            );
        }
        return buttons;
    };
    render = () => {
        var event = this.state.event;
        return (
            <React.Fragment>
                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                    <label htmlFor={`sbAddEvent${this.key}`}>Select an Event: </label>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                    <div className="node-sel">
                        <input name="eventNode" title="CSS Selector of Element" placeholder="Element" className="event-node input-sm" id={`sbAddEvent${this.key}`} onChange={this.selectorChange} value={event.node}></input>
                        <button onClick={this.selectNodeFromBrowser} className="btn btn-secondary btn-sm glyphicon glyphicon-import"></button>
                    </div>
                    <select className="input-sm" defaultValue={event.event} onChange={this.eventChange}>
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
                    <input type="text" name="evalue" className="evalue input-sm" onChange={this.valueChange} value={event.evalue} placeholder="Value If Any" title="Value to be added to selected element"></input>
                    <input type="number" min="0" max="15" name="timer" className="timer input-sm" value={event.timer} onChange={this.changeEventTimer} size="2" max-length="2" title="Timer in Seconds" placeholder="Timer"></input>
                    {this.controlButtons()}
                </div>
            </React.Fragment>
        );
    };
}