import React, {PropTypes, Component} from 'react';

import {TweenMax, Expo} from 'gsap/src/uncompressed/TweenMax';
import 'gsap/src/uncompressed/plugins/ScrollToPlugin';
export class Accordion extends Component {
  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const accordion = e.currentTarget.parentNode;

    // Vanilla JS of $(el).toggleClass();
    if (accordion.classList.value.indexOf('active') > -1) {
      accordion.classList.remove('active');
    } else {
      accordion.classList.add('active');
    }

    TweenMax.to(window, 1, {
      scrollTo: parseInt(accordion.offsetTop, 10),
      ease: Expo.easeOut,
      delay: 0.5
    });
  }

  render() {
    const isNew = this.props.isNew;

    if (isNew === true) {
      return (
        <button className="accordion__header" onClick={this.handleClick}>
          {this.props.text}
          <sup>BETA</sup>
          <div className="accordion__btn">
            <span className="sr-only">Toggle accordion</span>
          </div>
        </button>
      );
    }
    return (
      <button className="accordion__header" onClick={this.handleClick}>
        {this.props.text}
        <div className="accordion__btn">
          <span className="sr-only">Toggle accordion</span>
        </div>
      </button>
    );
  }
}

Accordion.defaultProps = {
  text: 'My brand new component!',
  isNew: false
};

Accordion.propTypes = {
  text: PropTypes.string,
  isNew: PropTypes.bool
};
