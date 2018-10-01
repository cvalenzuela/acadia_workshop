import React, { Component } from 'react';
import * as dg from 'dis-gui';
import { withContext } from './Provider';
import { rgbToHex } from '../utils/';


class GUI extends Component {
  render() {
    const { context } = this.props
    return (
      <div className='GUI'>
        <dg.GUI>
          <dg.Folder label='Canvas' expanded={true}>
            <dg.Button 
              label='File'
            />
            <dg.Number 
              label='Weight' 
              value={context.strokeWeight} 
              min={0} 
              max={4}
              step={0.1}
              onChange={(v) => context.changeStrokeWeight(v)}
            />
            <dg.Number 
              label='Opacity' 
              value={context.opacity} 
              min={0} 
              max={1}
              step={0.01}
              onChange={(v) => context.changeOpacity(v)}
            />
            <dg.Select 
              label='Select' 
              options={['Default', 'Custom', 'Random']}            
              onChange={(t) => context.changeColorType(t)}
            />
            <dg.Color 
              label='Color' 
              expanded={true} 
              red={86} 
              green={43} 
              blue={201}
              onChange={(c) => context.changeColor(rgbToHex(c.red, c.green, c.blue))}
            />
            <dg.Button 
              label='Draw'
              onClick={() => context.shouldClearCanvas(false)}
            />
            <dg.Button 
              label='Clear Canvas'
              onClick={() => context.shouldClearCanvas(true)}
            />
          </dg.Folder>
          <dg.Folder label='Model' expanded={true}>
            <dg.Checkbox 
              label='Generate' 
              checked={context.shouldGenerate}
              onChange={(v) => context.updateGenerate(v)}
            />
            <dg.Text 
              label='Text' 
              value={context.modelLoaded ? 'Model Loaded' : 'Loading Model...'}
            />
            <dg.Button 
              label='Change Model'
            />
            <dg.Number 
              label='Temperature' 
              value={context.temperature} 
              min={0} 
              max={1}
              step={0.1}
              onChange={(t) => context.changeTemperature(t)}
              />
              <dg.Number 
                label='Pixel Factor' 
                value={context.pixelFactor} 
                min={0} 
                max={20}
                step={0.1}
                onChange={(v) => context.setPixelFactor(v)}
            />
          </dg.Folder>
        </dg.GUI>
      </div>
    );
  }
}

export default withContext(GUI);
