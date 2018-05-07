import React from 'react';
import TestUtils from 'react-addons-test-utils';
import SortByTime from './sortByTime';

describe('SortByTime component', () => {
  it('should render default text', () => {
    const sortByTime = TestUtils.renderIntoDocument(<SortByTime/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(sortByTime, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
