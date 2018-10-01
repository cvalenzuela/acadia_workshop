import React, { Component } from 'react';
import { AppContext } from './Provider';
import GUI from './GUI';
import Canvas from './Canvas';
import Sketch from './Sketch';
import '../styles/App.css';

class App extends Component {

  handleKeyPress = (e) => {
    const { debugMode, changeDebugMode } = this.props.context;
    if(e.key === 'd') {
      changeDebugMode(!debugMode);
    }
  }

  render() {
    const { context } = this.props;

    return (
      <div 
        className="App" 
        tabIndex="0" 
        onKeyDown={this.handleKeyPress}
      >
        <Canvas />
        {false && <Sketch />}
        {context.debugMode ? <GUI /> : null}
      </div>
    );
  }
}

export default props => (
  <AppContext.Consumer>
    {context => <App {...props} context={context} />}
  </AppContext.Consumer>
);
