import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Header from './header';

describe('Header component', () => {
  it('should render default text', () => {
    const header = TestUtils.renderIntoDocument(<Header/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(header, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
