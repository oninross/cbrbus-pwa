'use strict';

import BusStop from '../busstop';

describe('BusStop View', function() {

  beforeEach(() => {
    this.busStop = new BusStop();
  });

  it('Should run a few assertions', () => {
    expect(this.busStop).toBeDefined();
  });

});
