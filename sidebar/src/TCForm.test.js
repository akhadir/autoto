import React from 'react';
import TCForm from './TCForm';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

it('renders without errors', function() {
    const wrapper = shallow(<TCForm />);
    expect(wrapper).toBeTruthy();
    expect(wrapper.state().closedState).toBe(true);
});


