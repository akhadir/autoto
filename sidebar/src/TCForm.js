import React, { Component } from 'react';
import EventForm from './EventForm';
import ScreenForm from './ScreenForm';
import Utils from './Utils';

export default class TCForm extends Component {
    state = {events: [], msg: ''};
    constructor(props) {
        super(props);
        var events = [{
            URL: '',
            node: 'document',
            event: 0,
            evalue: '',
            timer: props.settings.eventTimer,
            screens: []
        }];
        this.state.events = events;
        this.updateURL(events);
    };
    copyAction = (e) => {
        e.preventDefault();
        this.props.copyAction(this.state.events);
    };
    updateURL = (events) => {
        var that = this;
        Utils.getInsWindowURL(function (URL) {
            events[0].URL = URL; 
            that.state.events = events;
        });
    }
    addExtraEvent = (e) => {
        var index = e.target.attributes['data-index'].value,
            events = JSON.parse(JSON.stringify(this.state.events)),
            event = {
                URL: null,
                node: '',
                event: 1,
                evalue: '',
                timer: this.props.settings.eventTimer,
                screens: []
            };
        events.splice(index + 1, 0, event);
        this.setState({events: events});
        e.preventDefault();
    }
    addEventScreen = (e) => {
        var index = e.target.attributes['data-index'].value,
            events = Object.assign([], this.state.events);
        events[index].screens.push({
            node: '',
            image: ''
        });
        this.setState({events: events});
        e.preventDefault();
    };
    removeScreen = (eventIndex, screenIndex) => {
        var events = JSON.parse(JSON.stringify(this.state.events));
        var eventScreens = events[eventIndex].screens;
        eventScreens.splice(screenIndex, 1);
        this.setState({events: events});
    };
    removeEvent = (eventIndex) => {
        var events = JSON.parse(JSON.stringify(this.state.events));
        events.splice(eventIndex, 1);
        this.setState({events: events});
    }
    screens = (index) => {
        var settings = this.props.settings,
            that = this,
        listItems = this.state.events[index].screens.map(function(value, key) {
            return (
                <div className="row form-control-static" key={`${index}${key}`} data-index={`${index}${key}`}>
                <ScreenForm settings={settings} screen={value} index={key} pindex={index} remove={that.removeScreen.bind(that)}></ScreenForm>
                </div>
            );
        });
        return listItems;
    };
    eventScreens = () => {
        var settings = this.props.settings,
            that = this;
        var listItems = this.state.events.map(function(value, key) {
            return (
                <React.Fragment key={key}>
                <div className='event-screen'>
                    <div className="row form-control-static" data-index={key}>
                        <EventForm settings={settings} index={key} event={value} remove={that.removeEvent.bind(that)}></EventForm>
                    </div>
                    {that.screens(key)}
                    <div className='screen-control'>
                        <button className="screen-event btn btn-sm btn-secondary" onClick={that.addEventScreen} data-index={key}>+ Add Screen</button>
                    </div>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={that.addExtraEvent} data-index={key}>+ Add Event Here</button>
                </React.Fragment>
            );
        });
        return listItems;
    };
    runAllEvents = (e) => {
        // Utils.runEvents(this.events);
        e.preventDefault();
    };
    setDataAfterValidation = (strData) => {
        try {
            var data = JSON.parse(strData);
            if (typeof data[0].event !== 'number' || typeof data[0].node !== 'string') {
                throw new Error("DATA_VALIDATION_EXCEPTION");
            }
            this.setState( {events: data });
        } catch (e) {
            this.setState({msg: "Data Validation Failed"});
        }
    };
    loadEvents = (e) => {
        var file = e.target.files[0],
            data,
            reader = new FileReader(),
            that = this;
        reader.onload = function(fc) {
            that.setDataAfterValidation(fc.target.result);
        };
        reader.readAsText(file);
    };
    showMessage = () => {
        var out = '',
            that = this;
        if (this.state.msg) {
            out = (
                <div class="alert alert-info message">
                    <strong>Info!</strong> {this.state.msg}
                </div>
            );
            setTimeout(function () {
                that.setState({msg: ""});
            }, 5000)
        }
        return out;
    };
    render = () => {
        return (
            <React.Fragment>
                <h4>Add TestCases</h4>
                <form>
                    {this.showMessage()}
                    <div className="row form-control-static">
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                            <label htmlFor="loadEvents">Load Saved Events: </label>
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                            <input type="file" id="loadEvents" className="btn btn-sm btn-primary" onChange={this.loadEvents}></input>
                        </div>
                        </div>
                        <div className="form-control-static">
                        {this.eventScreens()}
                        </div>
                        <div className="form-control-static">
                            <button className="run-events btn btn-sm btn-default" onClick={this.runAllEvents}>Run All Events</button>
                        </div>
                        <div className="form-control-static center">
                            <button className="save-events-sess btn btn-sm btn-primary" title="Save this to the current file">Save</button>
                            <input type="file" className="save-events-sess btn btn-sm btn-primary"title="Save this to a differnt file"></input>
                            <input type="submit" className="btn btn-sm btn-primary" onClick={this.copyAction} value="Copy Testcases"></input>
                        </div>
                </form>
            </React.Fragment>
        );
    };
}