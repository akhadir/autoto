import React, { Component } from 'react';
import Utils from './Utils';
export default class AssertionForm extends Component {
    state = {assertion: null};
    setState: any;
    settings: any;
    key: number;
    parentKey: number;
    props: any;
    selectorUpdate: boolean;
    assertTypeUpdate: boolean;
    constructor(props) {
        super(props);
        this.settings = props.settings;
        this.key = props.index;
        this.parentKey = props.pindex;
        this.state.assertion = props.assertion;
    };
    getAssertionDropdown = (assertType: string): any => {
        var options = Utils.getAssertionList(),
                
        optionsHTML = options.map(function(value, key) {
            return (<option value={key}>{value}</option>);
        });
        return (
            <select className="input-sm" value={assertType} onChange={this.assertTypeChange}>
            {optionsHTML}
            </select>
        );        
    };
    removeAssertion = (e) => {
        this.props.remove(this.parentKey, this.key);
        e.preventDefault();
    };
    componentDidUpdate = (prevProps) => {
        if (prevProps !== this.props) {
            this.setState({assertion: this.props.assertion});
        }
    };
    selectorChange = (e) => {
        e.preventDefault();
        var that = this;
        Utils.getSelector(function (val) {
            that.selectorUpdate = true;
            var assertion = {node: val, value: '', assertType: 0};
            that.setState({assertion: assertion});
            that.props.assertion.node = assertion.node;
            that.props.assertion.value = assertion.value;
            that.props.assertion.assertType = assertion.assertType;
        });
    };
    nodeChange = (e) => {
        e.preventDefault();
        if (!this.selectorUpdate) {
            var assertion = {node: e.target.value, value: '', assertType: 0};
            this.setState({assertion: assertion});
            this.props.assertion.node = assertion.node;
            this.props.assertion.value = assertion.value;
            this.props.assertion.assertType = assertion.assertType;
        }
        this.selectorUpdate = false;
    };
    assertTypeChange = (e) => {
        e.preventDefault();
        var that = this,
            type = parseInt(e.target.value, 10),
            node = this.state.assertion.node;
        switch (type) {
            case 2:
                Utils.getInnerText(node, set);
            break;
            case 1:
                node = node.replace(/:nth\(\d+\)$/, '');
                Utils.getNodeCount(node, set);
                break;
            case 0:
                set(this.state.assertion.value);
                break;
            default:
                break;
        }
        function set(value) {
            value += '';
            that.assertTypeUpdate = true;
            var assertion = {node: node, value: value, assertType: type};
            that.setState({assertion: assertion});
            that.props.assertion.assertType = assertion.assertType;
            that.props.assertion.value = assertion.value;
            that.props.assertion.node = assertion.node;
        }
    };
    valueChange = (e) => {
        e.preventDefault();
        if (!this.assertTypeUpdate) {
            var assertion = {node: this.state.assertion.node, assertType: this.state.assertion.assertType, value: e.target.value};
            this.setState({assertion: assertion});
            this.props.assertion.value = assertion.value;
        }
        this.assertTypeUpdate = false;
    };
    
    render = () => {
        var assertion = this.state.assertion,
            node = assertion.node,
            assertType = assertion.assertType,
            value = assertion.value;
        return (
            <React.Fragment>
                <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                    <label htmlFor={`sbAddAssertion${this.key}${this.parentKey}`}>Add Assertion: </label>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8"  id={`sbAddAssertion${this.key}${this.parentKey}`}>
                    <div className="node-sel">
                        <input name="node" title="CSS Selector of Element" placeholder="Element" className="assertion-node input-sm" onChange={this.nodeChange.bind(this)} value={node}></input>
                        <button onClick={this.selectorChange} className="btn btn-secondary btn-sm glyphicon glyphicon-import"></button>
                    </div>
                    {this.getAssertionDropdown(assertType)}
                    <input name="value" title="Value" placeholder="Value (can be auto-generated)" className="assertion-node input-sm" onChange={this.valueChange.bind(this)} value={value}></input>
                    <button className="btn btn-sm btn-primary" data-index={this.key} onClick={this.removeAssertion}>Remove Assertion</button>
                </div>
            </React.Fragment>
        );
    };
}