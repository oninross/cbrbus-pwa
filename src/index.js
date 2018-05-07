import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, browserHistory} from 'react-router';

import {Search} from './app/routes/search/search';
import {Nearby} from './app/routes/nearby/nearby';
import {Bookmarks} from './app/routes/bookmarks/bookmarks';
import {About} from './app/routes/about/about';
import {Share} from './app/routes/share/share';

import './index.scss';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/search" component={Search}/>
    <Route path="/nearby" component={Nearby}/>
    <Route path="/bookmarks" component={Bookmarks}/>
    <Route path="/about" component={About}/>
    <Route path="/share" component={Share}/>
  </Router>,
  document.getElementById('root')
);
