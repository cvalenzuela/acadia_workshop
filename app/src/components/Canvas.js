import React, {Component} from 'react';
import * as ms from '@magenta/sketch';
import { Stage, Graphics } from '@inlet/react-pixi';
import { withContext } from './Provider';
import { randomColor } from '../utils'

import '../styles/Canvas.css';

import * as data from './../data/generated.json';
import { setTimeout } from 'timers';

let x = 0;
let y = 0;

class Canvas extends Component {
  state = {
    data,
    model: new ms.SketchRNN("http://localhost:3000/model.json"),
    modelLoaded: false,
    rnnState: null,
    dx: 0,
    dy: 0,
    penDown: 0,
    penUp: 0,
    penEnd: 0
  } 

  componentWillMount() {
    const { model } = this.state;
    const { context } = this.props;
    x = 300;
    y = 200;

    model.initialize()
      .then(() =>  {
        model.setPixelFactor(context.pixelFactor);
        const [dx, dy, penDown, penUp, penEnd] = model.zeroInput();
        const rnnState = model.zeroState();
        context.onModelLoad(true);
        this.setState({ 
          dx,
          dy,
          penDown,
          penUp,
          penEnd,
          rnnState,
          modelLoaded: true 
        })
      })
  }
  
  drawLines (g, clear = false) {
    let { data, model, dx, dy, penDown, penUp, penEnd, rnnState, modelLoaded } = this.state;  
    const { context } = this.props;
    
    if (context.clearCanvas) {
      g.clear();
      return 
    }

    if (!context.shouldGenerate) {
      g.clear();
      for(let i = 0; i < data.lines.length; i++) {
        let x = 0;
        let y = 0;
        let color = `0x${data.colors[i]}`;
        if (context.colorType === 'Custom') {
          color = context.color;
        } else if (context.colorType === 'Random') {
          color = randomColor();
        }
        g.lineStyle(context.strokeWeight, color , context.opacity, 0);
        g.moveTo((data.lines[i][0][0]/100)*context.canvasWidth, (data.lines[0][1]/100)*context.canvasHeight);
        for(let j = 0; j < data.lines[i].length - 1; j++) {    
          const dx = (data.lines[i][j][0]/100)*context.canvasWidth;
          const dy = (data.lines[i][j][1]/100)*context.canvasHeight;
          const pen_down = data.lines[i][j][2];
          if (pen_down === 0) {
            g.lineTo(x+dx, y+dy);
          }
          x += dx;
          y += dy;
        }
      }
    } else if(context.shouldGenerate && modelLoaded) {
      model.setPixelFactor(context.pixelFactor);
      rnnState = model.update([dx, dy, penDown, penUp, penEnd], rnnState);
      const pdf = model.getPDF(rnnState, context.temperature);
      const sample = model.sample(pdf);
      g.lineStyle(context.strokeWeight, context.color , context.opacity, 0);
      g.moveTo(x, y);
      g.lineTo(x+sample[0], y+sample[1]);
      x = x+sample[0];
      y = y+sample[1];
      if (x > window.innerWidth || x < 0 || y > window.innerHeight || y < 0 ) { 
        x = window.innerWidth/2;
        y = window.innerHeight/2;
      }
      setTimeout(() => this.drawLines(g), 50);
    }
  }

  render() {
    const { context } = this.props;
  
    return (
      <Stage 
        width={context.canvasWidth} 
        height={context.canvasHeight} 
        options={{ 
          antialias: true
        }}
        onMouseDown={() => this.setState({ isDrawing: true })}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        <Graphics draw={g => this.drawLines(g)} /> 
      </Stage>
    );
  }
}

export default withContext(Canvas);
