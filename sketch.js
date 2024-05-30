let numCircles = 30;
let circles = [];
let ripples = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < numCircles; i++) {
    let circle = createNonOverlappingCircle();
    if (circle != null) {
      circles.push(circle);
    }
  }
}

function draw() {
  background(220);
  for (let i = 0; i < circles.length; i++) {
    circles[i].display();
  }

  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].display();
    if (ripples[i].isFinished()) {
      ripples.splice(i, 1); // Remove finished ripples
    }
  }
}

function createNonOverlappingCircle() {
  let newCircle = null;

  let diameter = random(150, 200);
  let circleColor = color(random(255), random(255), random(255));
  let numSmallCircles = int(random(30, 50));
  let smallCircleColor = color(random(255), random(255), random(255));
  let numLayers = 5;
  let tempCircle = new Circle(random(width), random(height), diameter, circleColor, numSmallCircles, smallCircleColor, numLayers);

  let maxTries = 1000;
  for (let i = 0; i < maxTries; i++) {
    if (checkOverlap(tempCircle)) {
      tempCircle.x = random(width);
      tempCircle.y = random(height);
    } else {
      newCircle = tempCircle;
      break;
    }
  }

  return newCircle;
}

function checkOverlap(newCircle) {
  for (let i = 0; i < circles.length; i++) {
    let d = dist(newCircle.x, newCircle.y, circles[i].x, circles[i].y);
    if (d < (newCircle.diameter / 2 + circles[i].diameter / 2)) {
      return true;
    }
  }
  return false;
}

class Circle {
  constructor(x, y, diameter, circleColor, numSmallCircles, smallCircleColor, numLayers) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.circleColor = circleColor;
    this.numSmallCircles = numSmallCircles;
    this.smallCircleColor = smallCircleColor;
    this.numLayers = numLayers;
  }

  display() {
    fill(this.circleColor);
    noStroke();
    ellipse(this.x, this.y, this.diameter);

    for (let i = 0; i < 8; i++) {
      stroke(0);
      ellipse(this.x, this.y, this.diameter * 0.5 - (i * 10));
    }

    for (let l = 1; l <= this.numLayers; l++) {
      let layerRadius = this.diameter / 2 * (1 - l / (this.numLayers + 5));
      for (let i = 0; i < this.numSmallCircles; i++) {
        let angle = (TWO_PI / this.numSmallCircles * i);
        let sx = this.x + cos(angle) * layerRadius;
        let sy = this.y + sin(angle) * layerRadius;
        fill(this.smallCircleColor);
        ellipse(sx, sy, 10);
      }
    }
  }

  interactWithRipple(ripple) {
    let d = dist(this.x, this.y, ripple.x, ripple.y);
    if (d < ripple.diameter / 2) {
      this.circleColor = ripple.color; // Change color when ripple interacts
    }
  }
}

class Ripple {
  constructor(x, y, maxDiameter, speed, color) {
    this.x = x;
    this.y = y;
    this.diameter = 0;
    this.maxDiameter = maxDiameter;
    this.speed = speed;
    this.alpha = 255;
    this.color = color;
  }

  update() {
    this.diameter += this.speed;
    this.alpha -= 2;
  }

  display() {
    noFill();
    stroke(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
    ellipse(this.x, this.y, this.diameter);
  }

  isFinished() {
    return this.alpha <= 0;
  }
}

let rippleColor = color(0);

function keyPressed() {
  if (key === 'R') {
    let circle = createNonOverlappingCircle();
    if (circle != null) {
      circles.push(circle);
    }
  } else if (key === '1') {
    rippleColor = color(255, 0, 0); // Red
  } else if (key === '2') {
    rippleColor = color(0, 255, 0); // Green
  } else if (key === '3') {
    rippleColor = color(0, 0, 255); // Blue
  }
}

function mousePressed() {
  for (let i = 0; i < circles.length; i++) {
    let d = dist(mouseX, mouseY, circles[i].x, circles[i].y);
    if (d < circles[i].diameter / 2) {
      let colors = [color(255, 0, 0), color(0, 255, 0), color(0, 0, 255)];
      for (let j = 0; j < 3; j++) {
        let ripple = new Ripple(circles[i].x, circles[i].y, circles[i].diameter * 2, random(1, 5), colors[j]);
        ripples.push(ripple);
      }
    }
  }
}

function mouseDragged() {
  let ripple = new Ripple(mouseX, mouseY, 200, 2, color(random(255), random(255), random(255)));
  ripples.push(ripple);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
