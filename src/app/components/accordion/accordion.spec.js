import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Accordion from './accordion';

describe('Accordion component', () => {
  it('should render default text', () => {
    const accordion = TestUtils.renderIntoDocument(<Accordion/>);
    const h2 = TestUtils.findRenderedDOMComponentWithTag(accordion, 'h2');
    expect(h2.textContent).toEqual('My brand new component!');
  });
});
