import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Share from './share';

describe('Share component', () => {
  it('should render default text', () => {
    const share = TestUtils.renderIntoDocument(<Share/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(share, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
