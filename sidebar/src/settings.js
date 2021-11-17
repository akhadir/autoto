import React, { Component } from 'react';

export default class Settings extends Component {
    state = { closedState: true, eventTimer: undefined };
    close = () => {
        this.setState({ closedState: true });
        this.props.closeAction();
    };
    save = () => {
        this.props.saveAction();
        this.props.closeAction();
    };
    eventTimerChange = (e) => {
        this.setState({ eventTimer: parseInt(e.currentTarget.value, 10) });
    };
    render() {
        return (
            <React.Fragment>
                <a className="settings-cls-btn" onClick={this.close}><span className="glyphicon glyphicon-remove-circle"></span></a>
                <h4>Settings</h4>
                <div ng-controller="Settings">
                    <div className="property event-timer">
                        <label htmlFor="stETimer"><h5>Event Timer:</h5></label>
                        <input type="number" id="stETimer" className="input-sm" defaultValue="3" onChange={this.eventTimerChange} value={this.eventTimer}></input>
                    </div>
                    <button className="btn btn-primary save-pref-prop btn-sm" title="Save Preferences" onClick={this.save}>Save</button>
                </div>
            </React.Fragment>
        );
    }
}
