import React, {PropTypes, Component} from 'react';
import {Link} from 'react-router';

import './navigation.scss';

export class Navigation extends Component {
  render() {
    return (
      <div>
        <header className="header">
          <nav className="navigation">
            <ul>
              <li>
                <Link to="/search/" activeClassName="active">
                  <span className="icon icon-search"/>
                  Search
                  </Link>
              </li>
              <li>
                <Link to="/nearby/" activeClassName="active">
                  <span className="icon icon-map"/>
                  Nearby
                      </Link>
              </li>
              <li>
                <Link to="/bookmarks/" activeClassName="active">
                  <span className="icon icon-bookmark"/>
                  Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/about/" activeClassName="active">
                  <span className="icon icon-about"/>
                  About
              </Link>
              </li>
              <li>
                <Link to="/share/" activeClassName="active">
                  <span className="icon icon-share"/>
                  Share
              </Link>
              </li>
            </ul>
          </nav>
        </header>
      </div>
    );
  }
}

Navigation.defaultProps = {
  text: 'Navigation component!'
};

Navigation.propTypes = {
  text: PropTypes.string
};
