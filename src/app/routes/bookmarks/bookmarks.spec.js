import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Bookmarks from './bookmarks';

describe('Bookmarks component', () => {
  it('should render default text', () => {
    const bookmarks = TestUtils.renderIntoDocument(<Bookmarks/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(bookmarks, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
