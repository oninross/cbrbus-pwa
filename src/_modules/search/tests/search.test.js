'use strict';

import Search from '../search';

describe('Search View', function() {

  beforeEach(() => {
    this.search = new Search();
  });

  it('Should run a few assertions', () => {
    expect(this.search).toBeDefined();
  });

});
