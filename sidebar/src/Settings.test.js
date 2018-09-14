import React from 'react';
import Settings from './Settings';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

it('renders without errors', function() {
    const wrapper = shallow(<Settings />);
    expect(wrapper).toBeTruthy();
    expect(wrapper.state().closedState).toBe(true);
});

it('hide itself when close button clicked', () => {
    var closeHandlerCalled = false,
        closeHandler = function () {
            closeHandlerCalled = true;
        };
    const wrapper = mount(<Settings closeAction={closeHandler}/>);
    wrapper
        .find('.settings-cls-btn')
        .last()
        .simulate('click');
    expect(wrapper.state().closedState).toBe(true);
    expect(closeHandlerCalled).toBe(true);
});

it('timer defaultValue', () => {
    const wrapper = mount(<Settings />);
    wrapper
        .find('#stETimer')
        .last()
        .simulate('change');
    expect(wrapper.state().eventTimer).toBe(3);
});

it('save called', () => {
    var closeHandlerCalled = false,
        closeHandler = function () {
            closeHandlerCalled = true;
        },
        saveHandlerCalled = false,
        saveHandler = function () {
            saveHandlerCalled = true;
        };
    const wrapper = mount(<Settings closeAction={closeHandler} saveAction={saveHandler}/>);
    wrapper
        .find('.save-pref-prop')
        .last()
        .simulate('click');
        expect(closeHandlerCalled).toBe(true);
        expect(saveHandlerCalled).toBe(true);
    });