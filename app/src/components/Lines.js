import React, {Component} from 'react';
import { Graphics } from '@inlet/react-pixi';
import { withContext } from './Provider';

class GeneratedLines extends Component {
  state = {
    data
  }

  drawLines = (g) => {
    const { data } = this.state;  
    const { ctx } = this.props;
    g.clear();

    for(let i = 0; i < data.lines.length; i++) {
      let x = 0;
      let y = 0;

      let color = `0x${data.colors[i]}`;
      if (ctx.colorType === 'Custom') {
        color = ctx.color;
      } else if (ctx.colorType === 'Random') {
        color = randomColor();
      }

      g.lineStyle(ctx.strokeWeight, color , ctx.opacity, 0);
      g.moveTo((data.lines[i][0][0]/100)*ctx.canvasWidth, (data.lines[0][1]/100)*ctx.canvasHeight);
      for(let j = 0; j < data.lines[i].length - 1; j++) {    
        const dx = (data.lines[i][j][0]/100)*ctx.canvasWidth;
        const dy = (data.lines[i][j][1]/100)*ctx.canvasHeight;
        const pen_down = data.lines[i][j][2];
        if (pen_down === 0) {
          g.lineTo(x+dx, y+dy);
        }
        x += dx;
        y += dy;
      }
    }
  }

  render() {
    const { context } = this.props;

    return (
      <Graphics draw={g => this.drawLines(g)}  />
    );
  }
}

export default withContext(GeneratedLines);
