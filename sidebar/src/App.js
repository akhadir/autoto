import React, { Component } from 'react';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import Settings from './Settings';
import TCForm from './TCForm';
class App extends Component {
  constructor(props) {
    super(props);
    this.state =  {settingsClosed: true};
    this.settings = {eventTimer: 10};
    this.data = {};
  };
  closeSettings = () => {
    this.setState({ settingsClosed: true});
  };
  openSettings = () => {
    this.setState({ settingsClosed: false});
    this.settingsComp.state.closedState = false;
  };
  saveSettings = () => {
    this.settings = this.settingsComp.state;
  };
  render() {
    return (
      <div className="App">
        <div className={`container settings ${this.state.settingsClosed? 'hide' : ''}`}>
          <Settings ref={(settings) => {this.settingsComp = settings;}} closeAction={this.closeSettings} saveAction={this.saveSettings}></Settings>
        </div>
        <div className={`container testcase ${!this.state.settingsClosed? 'hide' : ''}`}>
          <a className="settings-btn" onClick={this.openSettings}><span className="glyphicon glyphicon-cog"></span></a>
          <TCForm settings={this.settings} data={this.data}></TCForm>
        </div>
      </div>
    );
  }
}

export default App;
