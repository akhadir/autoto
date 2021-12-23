import React from 'react';
import AssertionForm from './assertion-form';
import EventGrabber from './event-grabber';
import EventForm from './event-form';
import ScreenForm from './screen-form';
import Utils from './util';

export default class TCForm extends React.Component {
    state = {events: [], msg: ''};
    props: any;
    file: any;
    setState: any;
    constructor(props) {
        super(props);
        var events = [{
            URL: '',
            node: 'document',
            event: 0,
            evalue: '',
            timer: props.settings.eventTimer,
            screens: [],
            assertions: []
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
        var index = parseInt(e.target.attributes['data-index'].value, 10),
            events = JSON.parse(JSON.stringify(this.state.events)),
            event = {
                URL: null,
                node: '',
                event: 1,
                evalue: '',
                timer: this.props.settings.eventTimer,
                screens: [],
                assertions: []
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
    removeAssertion = (eventIndex, aIndex) => {
        var events = JSON.parse(JSON.stringify(this.state.events));
        var assertions = events[eventIndex].assertions;
        assertions.splice(aIndex, 1);
        this.setState({events: events});
    };
    removeEvent = (eventIndex) => {
        var events = JSON.parse(JSON.stringify(this.state.events));
        events.splice(eventIndex, 1);
        this.setState({events: events});
    }
    dimWidthChange = (e) => {
        e.preventDefault();
        var events = JSON.parse(JSON.stringify(this.state.events));
        events[0].dim.width = e.target.value;
        this.setState({events: events});
    };
    dimHeightChange = (e) => {
        e.preventDefault();
        var events = JSON.parse(JSON.stringify(this.state.events));
        events[0].dim.height = e.target.value;
        this.setState({events: events});
    };
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
    assertions = (index) => {
        var settings = this.props.settings,
            that = this,
        listItems = this.state.events[index].assertions.map(function(value, key) {
            return (
                <div className="row form-control-static" key={`${index}${key}`} data-index={`${index}${key}`}>
                <AssertionForm settings={settings} assertion={value} index={key} pindex={index} remove={that.removeAssertion.bind(that)}></AssertionForm>
                </div>
            );
        });
        return listItems;
    };
    getViewport = (e) => {
        if (e) {
            e.preventDefault();
        }
        var that = this;
        Utils.getViewPort(function (dim) {
            var events = JSON.parse(JSON.stringify(that.state.events));
            events[0].dim = dim;
            that.setState({events: events});
        });        
    };
    getViewportForm = (value, index) => {
        var out = '';
        if (index === 0) {
            if (!value.dim) {
                value.dim = {width: 1680, height: 890};
            }
            out = (
                <div className="viewport-screen">
                    <div className="row form-control-static">
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                            <label htmlFor='viewport'>Viewport Dimensions: </label>
                        </div>
                        <div id='viewport' className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                            <input type="text" name="dimx" className="dim input-sm" onChange={this.dimWidthChange} value={value.dim.width}></input>
                            <input type="text" name="dimx" className="dim input-sm" onChange={this.dimHeightChange} value={value.dim.height}></input>
                            <button className="btn btn-sm btn-default" onClick={this.getViewport}>Get</button>
                        </div>
                    </div>
                </div>
            )
        }
        return out;
    };
    addAssertions = (e) => {
        e.preventDefault();
        var index = e.target.attributes['data-index'].value,
            events = Object.assign([], this.state.events);
        events[index].assertions.push({
            node: '',
            assertType: 0,
            value: ''
        });
        this.setState({events: events});
    };
    eventAssertions = () => {
        var settings = this.props.settings,
            that = this;
        var listItems = this.state.events.map(function(value, key) {
            return (
                <div key={key}>
                    <div className='event-screen'>
                        <div className="row form-control-static" data-index={key}>
                            <EventForm settings={settings} index={key} event={value} remove={that.removeEvent.bind(that)}></EventForm>
                        </div>
                        {that.screens(key)}
                        <div className='screen-control'>
                            <button className="screen-event btn btn-sm btn-secondary" onClick={that.addEventScreen} data-index={key}>+ Add Screen</button>
                        </div>
                        {that.assertions(key)}
                        <div className='assertion-control'>
                            <button className="add-assert btn btn-sm btn-secondary" onClick={that.addAssertions} data-index={key}>+ Add Assertion</button>
                        </div>
                        <div className='assertion-control'>
                            <button className="add-assert btn btn-sm btn-secondary" onClick={that.addAssertions} data-index={key}>+ Add HTML Snapshot</button>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={that.addExtraEvent} data-index={key}>+ Add Event Here</button>
                </div>
            );
        });
        return listItems;
    };
    runAllEvents = (e) => {
        Utils.runEvents(this.state.events);
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
            return false;
        }
        return true;
    };
    loadEvents = (e) => {
        var file = e.target.files[0],
            reader = new FileReader(),
            that = this;
        reader.onload = function(fc) {
            if (that.setDataAfterValidation(fc.target.result)) {
                that.file = file;
            }
        };
        reader.readAsText(file);
    };
    refreshState = () => {
        var events = JSON.parse(JSON.stringify(this.state.events));
        this.setState( {"events": events });
    };
    downloadButton = () => {
        var dataStr = 'data:application/json;charset=utf-8,' + escape(JSON.stringify(this.state.events, null, 4)),
            // tcStr = 'data:application/javascript;charset=utf-8,' + '',
            out = (
                <React.Fragment>
                <a href={dataStr} download="config" onClick={this.refreshState} className="save-events-sess btn btn-sm btn-primary" title="Save configuration to a file">Save</a>
                {/* <a href={tcStr} download="testcase" onClick={this.copyAction} className="save-events-sess btn btn-sm btn-primary" title="Save testcases to a file">Save TC</a> */}
                </React.Fragment>
            );
        return out;
    };
    showMessage = () => {
        var out = '',
            that = this;
        if (this.state.msg) {
            out = (
                <div className="alert alert-info message">
                    <strong>Info!</strong> {this.state.msg}
                </div>
            );
            setTimeout(function () {
                that.setState({msg: ""});
            }, 5000)
        }
        return out;
    };
    onGrab = (e) => {
        const { eventType } = e;
        let evalue = '';
        if (eventType.toLowerCase().startsWith('key')) {
            evalue = String.fromCharCode(e.keyCode);
        }
        this.state.events.push({
            URL: '',
            node: e.targetSelector,
            event: Utils.getEventIndex(eventType),
            evalue: evalue,
            keyCode: e.keyCode,
            eventOptions: e,
            timer: 0.3,
            screens: [],
            assertions: []
        });
        const nEvents = [...this.state.events];
        this.setState({events: nEvents});
    };
    render = () => {
        return (
            <div>
                <h4>Add TestCases:</h4>
                <form>
                    {this.showMessage()}
                    <div className="row form-control-static">
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                            <label htmlFor="loadEvents">Load Testcases:</label>
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                            <input type="file" id="loadEvents" className="btn btn-sm btn-primary" onChange={this.loadEvents}></input>
                        </div>
                    </div>
                    {this.getViewportForm(this.state.events[0], 0)}
                    <EventGrabber  onGrab={this.onGrab} />
                    <div className="form-control-static">
                        {this.eventAssertions()}
                    </div>
                    <div className="form-control-static">
                        <button className="run-events btn btn-sm btn-default" onClick={this.runAllEvents}>Run All Events</button>
                    </div>
                    <div className="form-control-static center">
                        <input type="submit" className="btn btn-sm btn-primary" onClick={this.copyAction} value="Copy Testcases"></input>
                        {this.downloadButton()}
                    </div>
                </form>
            </div>
        );
    };
}