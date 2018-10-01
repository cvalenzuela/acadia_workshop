import React, { Component } from 'react';
const AppContext = React.createContext()

class AppProvider extends Component {
  state = {
    debugMode: true,
    changeDebugMode: (s) => this.setState({debugMode: s}),
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    strokeWeight: 0.3,
    changeStrokeWeight: (s) => this.setState({strokeWeight: s}),
    opacity: 0.4,
    changeOpacity: (s) => this.setState({opacity: s}),
    fileToLoad: './../data/smal.json',
    colorType: 'Default',
    changeColorType: (t) => this.setState({colorType: t}),
    color: '0x562bc9',
    changeColor: (c) => this.setState({color: c}),
    temperature: 0.1,
    changeTemperature: (t) => this.setState({temperature: t}),
    clearCanvas: false,
    shouldClearCanvas: (v) => this.setState({clearCanvas: v}),
    modelLoaded: false,
    shouldGenerate: false,
    updateGenerate: (s) => this.setState({shouldGenerate: s}),
    onModelLoad: (s) => this.setState({modelLoaded: s}),
    pixelFactor: 10,
    setPixelFactor: (v) => this.setState({pixelFactor: v})
  }
  
  render() {
    return (
    <AppContext.Provider value={this.state}>
      {this.props.children}
    </AppContext.Provider>)
  }
}

const withContext = (ReactComponent) => (
  props => (
    <AppContext.Consumer>
      {context => <ReactComponent {...props} context={context} />}
    </AppContext.Consumer>
  )
);

export {
  AppContext,
  AppProvider,
  withContext
};