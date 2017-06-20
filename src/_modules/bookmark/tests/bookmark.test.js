'use strict';

import Bookmark from '../bookmark';

describe('Bookmark View', function() {

  beforeEach(() => {
    this.bookmark = new Bookmark();
  });

  it('Should run a few assertions', () => {
    expect(this.bookmark).toBeDefined();
  });

});
