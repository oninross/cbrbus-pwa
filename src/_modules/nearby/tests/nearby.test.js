'use strict';

import Nearby from '../nearby';

describe('Nearby View', function() {

  beforeEach(() => {
    this.nearby = new Nearby();
  });

  it('Should run a few assertions', () => {
    expect(this.nearby).toBeDefined();
  });

});
