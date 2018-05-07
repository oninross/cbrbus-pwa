import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Card from './card';

describe('Card component', () => {
  it('should render default text', () => {
    const card = TestUtils.renderIntoDocument(<Card/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(card, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
