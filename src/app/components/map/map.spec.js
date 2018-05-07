import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Map from './map';

describe('Map component', () => {
  it('should render default text', () => {
    const map = TestUtils.renderIntoDocument(<Map/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(map, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
