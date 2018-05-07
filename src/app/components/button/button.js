import React, {PropTypes, Component} from 'react';

import './button.scss';

export class Button extends Component {
  render() {
    return (
      <div>
        <a href={this.props.link} target={this.props.target} className={this.props.class} rel={this.props.rel}>{this.props.text}</a>
      </div>
    );
  }
}

Button.defaultProps = {
  text: 'Button text',
  link: '#',
  target: '_self',
  class: '',
  rel: 'noopener noreferrer'
};

Button.propTypes = {
  text: PropTypes.string,
  link: PropTypes.string,
  target: PropTypes.string,
  class: PropTypes.string,
  rel: PropTypes.string
};
