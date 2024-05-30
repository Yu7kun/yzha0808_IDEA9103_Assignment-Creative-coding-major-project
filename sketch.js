let numCircles = 30; // Initial number of circles
let center = null; // The center of the ripples
let circles = []; // Array to store circle objects
let d = 0; // Diameter of ripples
let speed = 5; // Speed of ripple expansion
let rippleColors = []; // Array to store ripple colors
let speedButton; // Button to increase ripple speed

function setup() {
  angleMode(DEGREES); // Set angle mode to degrees
  createCanvas(windowWidth, windowHeight); // Create canvas
  for (let i = 0; i < numCircles; i++) {
    createNonOverlappingCircle(random(width), random(height)); // Create initial non-overlapping circles
  }
  
  // Initialize ripple colors
  for (let i = 0; i < 10; i++) {
    rippleColors.push(color(random(255), random(255), random(255), 150)); // Generate random colors with transparency
  }

  // Create button to increase ripple speed
  speedButton = createButton('Increase Ripple Speed');
  speedButton.position(10, 10);
  speedButton.mousePressed(increaseRippleSpeed); // Call increaseRippleSpeed function when button is pressed
}

function draw() {
  background(220); // Set background color
  for (const circle of circles) {
    circle.display(); // Display circle
    circle.update(); // Update circle's position and state
  }

  if (center != null) {
    // If a center is defined, draw ripples
    noFill(); // No fill color
    d += speed; // Expand the diameter of the ripples
    // Display ripples
    let ripplesExist = false;
    for (let i = 0; i < 10; i++) {
      let s = d - i * 50; // Calculate ripple size
      if (s > 0) {
        let alpha = map(s, 0, width, 255, 0); // Calculate alpha for fade-out effect
        if (alpha > 0) {
          rippleColors[i].setAlpha(alpha); // Set alpha for fading effect
          stroke(rippleColors[i]); // Set ripple color
          strokeWeight(2); // Set stroke weight

          beginShape();
          for (let angle = 0; angle < 360; angle += 10) {
            let offset = map(noise(s, angle * 0.1, frameCount * 0.02), 0, 1, -10, 10); // Use Perlin noise for smooth variation
            let x = center.x + (s + offset) * cos(angle);
            let y = center.y + (s + offset) * sin(angle);
            vertex(x, y); // Record vertex
          }
          endShape(CLOSE);
          ripplesExist = true;
        }
      }
    }
    // Gradually slow down ripple expansion
    speed *= 0.99;
    // Stop expanding ripples when they are fully faded out
    if (!ripplesExist) {
      center = null;
      d = 0;
      speed = 5;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Resize canvas when window is resized
}

// Reference: p5.js documentation: https://p5js.org/reference/#/p5/random
function createNonOverlappingCircle(x, y) {
  let diameter = random(130, 200); // Diameter of the main circle
  let circleColor = color(random(255), random(255), random(255)); // Color of the main circle
  let numSmallCircles = round(random(30, 50)); // Number of small circles
  let smallCircleColor = color(random(255), random(255), random(255)); // Color of small circles
  let numLayers = 5; // Number of layers of small circles
  let tempCircle = new Circle(x, y, diameter, circleColor, numSmallCircles, smallCircleColor, numLayers); // Create circle object
  circles.push(tempCircle); // Add to circles array
}

// Class for generating circles
class Circle {
  constructor(x, y, diameter, circleColor, numSmallCircles, smallCircleColor, numLayers) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.circleColor = circleColor;
    this.numSmallCircles = numSmallCircles;
    this.smallCircleColor = smallCircleColor;
    this.numLayers = numLayers;
    this.active = false; // Circle is active or not
    this.life = true; // Circle exists or not
    this.ss = 0.1; // Initial scale
  }

  display() {
    if (this.life) {
      push();
      translate(this.x, this.y); // Translate to the circle's position
      scale(this.ss); // Apply scaling
      translate(-this.x, -this.y); // Translate back to the original position
      // Draw the main circle
      fill(this.circleColor);
      noStroke();
      circle(this.x, this.y, this.diameter);

      // Draw the center disk
      for (let i = 0; i < 8; i++) {
        stroke(0);
        ellipse(this.x, this.y, this.diameter * 0.5 - (i * 10));
      }

      // Draw layers of small circles
      for (let l = 1; l <= this.numLayers; l++) {
        let layerRadius = this.diameter / 2 * (1 - l / (this.numLayers + 5)); // Calculate radius of each layer
        for (let i = 0; i < this.numSmallCircles; i++) {
          let angle = (360 / this.numSmallCircles * i); // Calculate angle
          let sx = this.x + cos(angle) * (layerRadius); // Calculate x position of small circle
          let sy = this.y + sin(angle) * (layerRadius); // Calculate y position of small circle
          fill(this.smallCircleColor);
          ellipse(sx, sy, 10); // Draw small circle
        }
      }
      pop();
    }
  }

  update() {
    let pos = createVector(this.x, this.y); // Create vector for the circle's position

    if (center != null && pos.dist(center) <= d / 2) {
      this.active = true;
      // Move the circle if it intersects with the ripple
      let force = p5.Vector.sub(pos, center);
      force.normalize();
      force.mult(5); // Adjust the speed of the movement
      this.x += force.x;
      this.y += force.y;

      // Reference: Usage of Perlin noise: https://p5js.org/examples/math-noise-wave.html
      if (pos.dist(center) <= d / 2) {
        this.circleColor = color(random(255), random(255), random(255)); // Change color
      }
    }

    if (this.ss < 1) {
      this.ss += 0.1; // Increase scale
    }
  }
}

// Reference: p5.js documentation mousePressed example: https://p5js.org/reference/#/p5/mousePressed
function mouseDragged() {
  // Generate circle when mouse is dragged
  if (frameCount % 4 == 0) {
    createNonOverlappingCircle(mouseX, mouseY);
  }
}

function doubleClicked() {
  center = createVector(mouseX, mouseY); // Set new center position on double click
  d = 0; // Reset ripple diameter
  speed = 5; // Reset ripple speed
}

// Function to increase ripple speed
// Reference: MDN documentation: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
function increaseRippleSpeed() {
  speed += 2; // Increase speed by 2
}
