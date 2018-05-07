import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Navigation from './navigation';

describe('Navigation component', () => {
  it('should render default text', () => {
    const navigation = TestUtils.renderIntoDocument(<Navigation/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(navigation, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
