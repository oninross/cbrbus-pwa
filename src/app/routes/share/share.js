import React, {PropTypes, Component} from 'react';

export class Share extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Share.defaultProps = {
  text: 'Share route'
};

Share.propTypes = {
  text: PropTypes.string
};
