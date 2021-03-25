'use strict';

import Accordion from '../accordion';

describe('Accordion View', function() {

  beforeEach(() => {
    this.accordion = new Accordion();
  });

  it('Should run a few assertions', () => {
    expect(this.accordion).toBeDefined();
  });

});
