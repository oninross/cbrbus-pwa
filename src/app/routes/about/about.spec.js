import React from 'react';
import TestUtils from 'react-addons-test-utils';
import About from './about';

describe('About component', () => {
  it('should render default text', () => {
    const about = TestUtils.renderIntoDocument(<About/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(about, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
