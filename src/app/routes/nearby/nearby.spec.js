import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Nearby from './nearby';

describe('Nearby component', () => {
  it('should render default text', () => {
    const nearby = TestUtils.renderIntoDocument(<Nearby/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(nearby, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
