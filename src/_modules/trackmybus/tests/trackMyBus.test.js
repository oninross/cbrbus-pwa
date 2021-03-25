'use strict';

import TrackMyBus from '../trackmybus';

describe('TrackMyBus View', function() {

  beforeEach(() => {
    this.trackMyBus = new TrackMyBus();
  });

  it('Should run a few assertions', () => {
    expect(this.trackMyBus).toBeDefined();
  });

});
