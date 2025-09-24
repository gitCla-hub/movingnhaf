const landing = function(p) {
  let particles = [];
  const colors = ['#B3E8D7','#B9ECEF','#CB95D8','#898989'];

  p.setup = function() {
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent("landing-canvas");
    canvas.style('pointer-events', 'none');
    p.noStroke();
  }

  p.draw = function() {
    p.background(255, 255, 255, 20);

    if (p.mouseX >= 0 && p.mouseX <= p.width &&
        p.mouseY >= 0 && p.mouseY <= p.height) {

      for (let i = 0; i < 3; i++) {
        particles.push({
          x: p.mouseX + p.random(-2,2),  
          y: p.mouseY,                     
          vx: p.random(-0.5,0.5),         
          vy: p.random(1,3),              
          clr: p.color(p.random(colors)),
          alpha: 255,
          size: p.random(2,6)
        });
      }
    }

    for (let i = particles.length-1; i >= 0; i--) {
      let part = particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.alpha -= 2;

      p.fill(p.red(part.clr), p.green(part.clr), p.blue(part.clr), part.alpha);
      p.ellipse(part.x, part.y, part.size);

      if (part.alpha <= 0 || part.y > p.height + 10) particles.splice(i, 1);
    }
  }

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }
}

new p5(landing);
