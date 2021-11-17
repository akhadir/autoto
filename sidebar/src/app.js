import React, { Component } from 'react';
import './app.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import Settings from './settings';
import TCForm from './tc-form';
import CopyForm from './copy-form';

class App extends Component {
    state = {formState: 0};
    settings = {};
    data = {};
    settingsComp;
    setState;
    constructor(props) {
        super(props);
        this.settings = {eventTimer: 10};
        this.data = {};
    };
    closeSettings = () => {
        this.setState({ formState: 0});
    };
    openSettings = () => {
        this.setState({ formState: 1});
        this.settingsComp.state.closedState = false;
    };
    saveSettings = () => {
        this.setState({ formState: 0});
        this.settings = this.settingsComp.state;
    };
    backAction = (e) => {
        this.setState({ formState: 0});
        e.preventDefault();
    };
    showCopyForm = (data) => {
        this.data = data;
        this.setState({ formState: 2});
    };
    
    getCopyForm = () => {
      var out = '';
      if (this.state.formState === 2) {
          out = (
            <React.Fragment>
              <a className="back-btn" onClick={this.backAction}><span className="glyphicon glyphicon-arrow-left"></span></a>
              <CopyForm settings={this.settings} data={this.data}></CopyForm>
            </React.Fragment>
          );
      }
      return out;
    };
    render() {
      return (
        <div className="App">
          <div className={`container settings ${this.state.formState !== 1 ? 'hide' : ''}`}>
            <Settings ref={(settings) => {this.settingsComp = settings;}} closeAction={this.closeSettings} saveAction={this.saveSettings}></Settings>
          </div>
          <div className={`container testcase ${this.state.formState !== 0 ? 'hide' : ''}`}>
            <a className="settings-btn" onClick={this.openSettings}><span className="glyphicon glyphicon-cog"></span></a>
            <TCForm settings={this.settings} copyAction={this.showCopyForm} data={this.data}></TCForm>
          </div>
          <div className={`container testcase ${this.state.formState !== 2 ? 'hide' : ''}`}>
            {this.getCopyForm()}
          </div>
        </div>
      );
    }
}
export default App;
