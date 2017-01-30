'use strict';

import Leaflet from '../leaflet';

describe('Leaflet View', function() {

  beforeEach(() => {
    this.leaflet = new Leaflet();
  });

  it('Should run a few assertions', () => {
    expect(this.leaflet).toBeDefined();
  });

});
