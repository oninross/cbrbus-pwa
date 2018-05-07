import React, {PropTypes, Component} from 'react';

export default class Share extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Share.defaultProps = {
  text: 'My brand new component!'
};

Share.propTypes = {
  text: PropTypes.string
};
