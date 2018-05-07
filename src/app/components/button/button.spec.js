import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Button from './button';

describe('Button component', () => {
  it('should render default text', () => {
    const button = TestUtils.renderIntoDocument(<Button/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(button, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
