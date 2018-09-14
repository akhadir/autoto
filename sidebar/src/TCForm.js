import React, { Component } from 'react';
import EventForm from './EventForm';
import ScreenForm from './ScreenForm';

export default class TCForm extends Component {
    constructor(props) {
        super(props);
        this.settings = props.settings;
        this.data = props.data;
        if (!this.data || !this.data.events) {
            this.events = [{
                node: 'document',
                event: 0,
                evalue: '',
                timer: this.settings.eventTimer,
                screens: []
            }];
        }
    };
    addExtraEvent = (e) => {
        this.events.push({
            node: '',
            event: 0,
            evalue: '',
            timer: this.settings.eventTimer,
            screens: []
        });
        e.preventDefault();
        this.forceUpdate();
    }
    addEventScreen = (e) => {
        var index = e.target.attributes['data-index'].value;
        this.events[index].screens.push({
            node: '',
            image: ''
        });
        e.preventDefault();
        this.forceUpdate();
    };
    screens = (index) => {
        var settings = this.settigs,
        listItems = this.events[index].screens.map(function(value, key) {
            return (
                <div className="row form-control-static"  key={key} data-index={index}>
                <ScreenForm settings={settings} index={key} pindex={index}></ScreenForm>
                </div>
            );
        });
        return listItems;
    };
    eventScreens = () => {
        var settings = this.settigs,
            that = this;
        var listItems = this.events.map(function(value, key) {
            return (
                <div className='event-screen' key={key}>
                    <div className="row form-control-static" data-index={key}>
                        <EventForm settings={settings} index={key} event={value}></EventForm>
                    </div>
                    {that.screens(key)}
                    <div className='screen-control'>
                        <button className="screen-event btn btn-sm btn-secondary" onClick={that.addEventScreen} data-index={key}>+ Add Screen</button>
                    </div>
                </div>
            );
        });
        return listItems;
    }
    render = () => {
        return (
            <React.Fragment>
                <h4>Add TestCases</h4>
                <form>
                    <div className="row form-control-static">
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                            <label htmlFor="loadEvents">Load Saved Events: </label>
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                            <select id="loadEvents" className="input-sm">
                                <option value="0">Select</option>
                                {/* <option value="{{evs.name}}" ng-repeat="(eindex, evs) in eventSessions track by $index"  ng-if="evs">{{evs.name}}</option> */}
                            </select>
                        </div>
                        </div>
                        <div className="form-control-static">
                        {this.eventScreens()}
                        </div>
                        <div className="form-control-static">
                            <button onClick={this.addExtraEvent} className="add-event btn btn-sm btn-default">+ Add Event</button>
                            <button className="run-events btn btn-sm btn-default">Run All Events</button>
                        </div>
                        <div className="row form-control-static">
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                                <label htmlFor="saveEvents">Save Event Session: </label>
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                                <input id="saveEvents" className="input-sm save-evt-sess-name" placeholder="Event Session Name" ng-model="currEventSessName"></input>
                                <button className="save-events-sess btn btn-sm btn-primary" disabled="disabled" title="Save this current event list">Save</button>
                            </div>
                        </div>
                        <div className="form-control-static">
                            <input type="submit" className="btn btn-primary" value="Generate"></input>
                            <input type="submit" className="hide btn btn-primary place-top col-xs-offset-9 col-sm-offset-8 col-md-offset-8 col-lg-offset-7" value="Generate"></input>
                        </div>
                </form>
            </React.Fragment>
        );
    };
}