import * as ms from '@magenta/sketch';

export default function sketch (p) { 
  var model;
  var dx, dy; // offsets of the pen strokes, in pixels
  var pen_down, pen_up, pen_end; // keep track of whether pen is touching paper
  var x, y; // absolute coordinates on the screen of where the pen is
  var prev_pen = [1, 0, 0]; // group all p0, p1, p2 together
  var rnn_state; // store the hidden states of rnn's neurons
  var pdf; // store all the parameters of a mixture-density distribution
  var temperature = 0.1; // controls the amount of uncertainty of the model
  var line_color;
  var modelLoaded = false;
  var screen_width, screen_height;
  var initPosX = [100, 400, 600, 900]
  var initPosY= [100, 200, 400, 600]
  var colors = [[41, 195, 84, 80], [41, 145, 184, 90]]

  model = new ms.SketchRNN("http://localhost:3000/model.json");

  var clear_screen = function() {
    //p.background(0);
    p.strokeWeight(0.8);
  };

  var restart = function() {
    // initialize pen's states to zero.
    [dx, dy, pen_down, pen_up, pen_end] = model.zeroInput(); // the pen's states

    // zero out the rnn's initial states
    rnn_state = model.zeroState();

    clear_screen();
  }

  Promise.all([model.initialize()]).then(function() {
    model.setPixelFactor(8.0);
    restart();
    modelLoaded = true;    
  });

  p.setup = function() {
    screen_width = p.windowWidth; //window.innerWidth
    screen_height = p.windowHeight; //window.innerHeight
    x = p.random(initPosX);
    y = p.random(initPosY)
    p.createCanvas(screen_width, screen_height);
    p.frameRate(60);
    p.background(0);
    p.stroke(p.random(colors));
  };


  p.myCustomRedrawAccordingToNewPropsHandler = function (props) {
  };

  p.draw = function() {
    if (!modelLoaded) {
      return;
    }
    // see if we finished drawing
    if (x > p.windowWidth || x < 0 || y > p.windowHeight || y < 0 ) { // prev_pen[2] == 1
      //p.noLoop(); // stop drawing
      //return
      restart();
      p.stroke(p.random(colors));
      x = p.random(initPosX);
      y = p.random(initPosY)
    }

    // using the previous pen states, and hidden state, get next hidden state
    // the below line takes the most CPU power, especially for large models.
    rnn_state = model.update([dx, dy, pen_down, pen_up, pen_end], rnn_state);

    // get the parameters of the probability distribution (pdf) from hidden state
    pdf = model.getPDF(rnn_state, temperature);

    // sample the next pen's states from our probability distribution
    [dx, dy, pen_down, pen_up, pen_end] = model.sample(pdf);

    // only draw on the paper if the pen is touching the paper
    if (true) { // prev_pen[0] == 1
      p.line(x, y, x+dx, y+dy); // draw line connecting prev point to current point.
    }

    // update the absolute coordinates from the offsets
    x += dx;
    y += dy;

    // update the previous pen's state to the current one we just sampled
    prev_pen = [pen_down, pen_up, pen_end];
  };
};