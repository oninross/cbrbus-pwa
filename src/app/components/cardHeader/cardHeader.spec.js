import React from 'react';
import TestUtils from 'react-addons-test-utils';
import CardHeader from './cardHeader';

describe('CardHeader component', () => {
  it('should render default text', () => {
    const cardHeader = TestUtils.renderIntoDocument(<CardHeader/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(cardHeader, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
