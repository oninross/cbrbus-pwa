import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Search from './search';

describe('Search component', () => {
  it('should render default text', () => {
    const search = TestUtils.renderIntoDocument(<Search/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(search, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
