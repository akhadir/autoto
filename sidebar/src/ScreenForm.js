import React, { Component } from 'react';

export default class ScreenForm extends Component {
    constructor(props) {
        super(props);
        this.settings = props.settings;
        this.value = props.screen;
        this.key = props.index;
        this.parentKey = props.pindex;
        console.log(props)
    };
        
    controlButtons = () => {
        var buttons = (
            <div class='event-controls'>
                
            </div>
        );
        return buttons;
    }
    selectorChange = (e) => {
        this.value.screenNode = e.target.value;
    };
    getImage = (image) => {
        var img = null;
        if (image) {
            img = (
                <img src={image} alt="Screen shot"></img>
            );
        } 
        return img;
    }
    render = () => {
        return (
            <React.Fragment>
                <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                    <label htmlFor={`sbAddScreen${this.key}`}>Add a Screen: </label>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                    <input name="node" title="CSS Selector of Element" placeholder="Element" className="screen-node input-sm" id={`sbAddEventScreen${this.key}${this.parentKey}`} onChange={this.selectorChange} defaultValue=''></input>
                    {this.getImage(this.image)}
                    <button className="run-event btn btn-sm btn-primary" data-index={this.key}>Take Screen</button>
                </div>
            </React.Fragment>
        );
    };
}