import React, { Component } from 'react';
import Utils from './Utils';
export default class ScreenForm extends Component {
    state = {screen: null};
    constructor(props) {
        super(props);
        this.settings = props.settings;
        this.key = props.index;
        this.parentKey = props.pindex;
        this.remove = props.remove;
        this.state.screen = props.screen;
    };
    removeScreen = (e) => {
        this.remove(this.parentKey, this.key);
        e.preventDefault();
    };
    componentDidUpdate = (prevProps) => {
        if (prevProps !== this.props) {
            this.setState({screen: this.props.screen});
        }
    };
    selectorChange = (e) => {
        var that = this;
        Utils.getSelector(function (val) {
            that.selectorUpdate = true;
            var screen = {node: val, image: that.state.screen.image};
            that.setState({screen: screen});
            that.props.screen.node = screen.node;
        });
    };
    nodeChange = (e) => {
        if (!this.selectorUpdate) {
            var screen = {node: e.target.value, image: this.state.screen.image};
            this.setState({screen: screen});
            this.props.screen.node = screen.node;
        }
        this.selectorUpdate = false;
    }
    getImage = (image) => {
        var img = null;
        if (image) {
            img = (
                <img src={image} alt="Screen shot" width="100" height="100"></img>
            );
        } 
        return img;
    };
  
    takeScreenShot = (e) => {
        var that = this,
            screenNode = this.state.screen.node;
        Utils.getScreenShot(screenNode, function (data) {
            var screen = {node: screenNode, image: data};
            that.setState({screen: screen});
            that.props.screen.image = data;
        });
        e.preventDefault();
    };
    render = () => {
        var screen = this.state.screen,
            node = screen.node,
            image = screen.image;
        return (
            <React.Fragment>
                <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                    <label htmlFor={`sbAddEventScreen${this.key}${this.parentKey}`}>Add a Screen: </label>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                    <input name="node" title="CSS Selector of Element" placeholder="Element" className="screen-node input-sm" id={`sbAddEventScreen${this.key}${this.parentKey}`} onChange={this.nodeChange.bind(this)} onClick={this.selectorChange} value={node}></input>
                    {this.getImage(image)}
                    <button className="btn btn-sm btn-primary" data-index={this.key} onClick={this.takeScreenShot}>Take Screen</button>
                    <button className="btn btn-sm btn-primary" data-index={this.key} onClick={this.removeScreen}>Remove Screen</button>
                </div>
            </React.Fragment>
        );
    };
}