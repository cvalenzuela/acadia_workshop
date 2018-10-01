import React, {Component} from 'react';
import P5Wrapper from 'react-p5-wrapper';
import { withContext } from './Provider';

import sketch from '../utils/sketch';

class Sketch extends Component {
  render() {
    const { context } = this.props;
  
    return (
      <P5Wrapper sketch={sketch} />
    );
  }
}

export default withContext(Sketch);
