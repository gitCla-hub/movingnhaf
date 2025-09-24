let page3 = function(p) {
  let nodes = [],
    particles = [];
  let m = 5,
    n = 4,
    minMN = 1,
    maxMN = 6,
    margin = 50;
  let w1, w2, h1, h2, scl = 1;
  let colors = [],
    colorControl;
  let showMessage = false;
  let messageText = "Displacement isn't an ending, but a new beginning for your roots. A broken connection doesn't erase your sense of belonging; it creates a new path to redefine and regenerate it.";

  let draggingNode = null,
    dragOffset = null;
  let lastPatternChange = 0;
  let canvas;

  let messageRect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    padding: 20
  };
  let isDraggingMessage = false;
  let messageDragOffset = {
    x: 0,
    y: 0
  };

  p.saveCanvas = (filename, extension) => p.save(filename + "." + extension);
  p.toggleMessage = () => {
    showMessage = !showMessage;
  };

  p.setInputWords = function(rawWords) {
    if (!rawWords || rawWords.length === 0) return;
    const centerX = p.width || 500,
      centerY = p.height || 500;
    for (let w of rawWords) {
      let newNode = new DraggableNode(centerX / 2 + p.random(-50, 50), centerY / 2 + p.random(-50, 50), w);
      newNode.highlight = true;
      nodes.push(newNode);
    }
  };

  // ====== SETUP ======
  p.setup = function() {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight).parent("wrap3");
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont("Cormorant");
    p.textStyle(p.ITALIC);

    colorControl = window.globalColorControl;
    if (colorControl) colors = colorControl.getParticleColors().map(c => p.color(c));
    else colors = [p.color("#B3E8D7"), p.color("#B9ECEF"), p.color("#CB95D8"), p.color("#D8D8D8")];

    p.background(255);
    p.frameRate(60);
    lastPatternChange = p.millis();

    messageRect.w = p.width / 3;
    messageRect.x = (p.width - messageRect.w) / 2;
  };

  // ====== DRAW ======
  p.draw = function() {
    if (!colorControl) return;
    colors = colorControl.getParticleColors().map(c => p.color(c));
    let highlightColor = colors.length > 0 ? p.color(colors[0]) : p.color(150);

    let bgColor = p.color(colorControl.getBackgroundColor());
    let textColor = p.color(colorControl.getTextColor());
    p.background(p.red(bgColor), p.green(bgColor), p.blue(bgColor), 20);

    if (p.millis() - lastPatternChange > 10000) {
      m = p.floor(p.random(minMN, maxMN + 1));
      n = p.floor(p.random(minMN, maxMN + 1));
      lastPatternChange = p.millis();
    }

    w1 = margin;
    w2 = p.width - margin;
    h1 = margin;
    h2 = p.height - margin;

    for (let pt of particles) {
      pt.update();
      pt.display(colors);
    }
    particles = particles.filter(pt => !pt.dead);

    p.textSize(30);
    p.rectMode(p.CENTER);
    for (let node of nodes) {
      node.update();
      if (node.highlight) {
        p.noStroke();
        p.fill(highlightColor);
        p.rect(node.pos.x, node.pos.y, p.textWidth(node.word) + 6, p.textAscent() + p.textDescent() + 3);
        p.fill(bgColor);
      } else {
        p.fill(textColor);
      }
      p.text(node.word, node.pos.x, node.pos.y);
    }

    p.push();
    p.rectMode(p.CORNER);
    p.textAlign(p.LEFT, p.TOP);

    if (showMessage) {
      if (isDraggingMessage) {
        messageRect.x = p.mouseX + messageDragOffset.x;
        messageRect.y = p.mouseY + messageDragOffset.y;
      } else {
        p.textSize(20);
        const textHeight = p.textHeight(messageText, messageRect.w - messageRect.padding * 2);
        messageRect.h = textHeight + messageRect.padding * 2;
        messageRect.y = (p.height - messageRect.h) / 2;
      }

      const messageBgColor = colors.length > 1 ? p.color(colors[1]) : p.color(100);
      const messageTextColor = bgColor;

      p.fill(messageBgColor.levels[0], messageBgColor.levels[1], messageBgColor.levels[2], 180);
      p.noStroke();
      p.rect(messageRect.x, messageRect.y, messageRect.w, messageRect.h);

      p.fill(messageTextColor);
      p.textSize(20);
      p.text(messageText, messageRect.x + messageRect.padding, messageRect.y + messageRect.padding, messageRect.w - messageRect.padding * 2);
    }
    p.pop();

    p.push();
    p.textFont("Cormorant");
    p.textSize(24);
    p.textAlign(p.CENTER, p.CENTER);

    let particleColor = colors.length > 1 ? colors[2] : textColor;
    p.fill(particleColor);
    p.noStroke();

    p.text("drag the words to reveal the rhizomes", p.width / 2, p.height - 30);
    p.pop();
  };

  p.mousePressed = function() {
    if (showMessage && p.mouseX > messageRect.x && p.mouseX < messageRect.x + messageRect.w && p.mouseY > messageRect.y && p.mouseY < messageRect.y + messageRect.h) {
      isDraggingMessage = true;
      messageDragOffset.x = messageRect.x - p.mouseX;
      messageDragOffset.y = messageRect.y - p.mouseY;
      return;
    }

    for (let node of nodes) {
      if (node.isMouseOver(p.mouseX, p.mouseY)) {
        draggingNode = node;
        dragOffset = p.createVector(p.mouseX - node.pos.x, p.mouseY - node.pos.y);
        break;
      }
    }
  };

  p.mouseReleased = function() {
    draggingNode = null;
    dragOffset = null;
    isDraggingMessage = false;
  };

  p.mouseDragged = function() {
    if (isDraggingMessage) {
      messageRect.x = p.mouseX + messageDragOffset.x;
      messageRect.y = p.mouseY + messageDragOffset.y;
      return;
    }

    if (draggingNode) {
      draggingNode.pos.x = p.mouseX - dragOffset.x;
      draggingNode.pos.y = p.mouseY - dragOffset.y;

      for (let i = 0; i < 5; i++) {
        let angle = p.random(p.TWO_PI),
          radius = p.random(50, 150);
        let px = draggingNode.pos.x + p.cos(angle) * radius,
          py = draggingNode.pos.y + p.sin(angle) * radius;
        particles.push(new Particle(px, py, draggingNode.word));
      }
    }
  };

  // ====== PARTICLE ======
  class Particle {
    constructor(x, y, word = "") {
      this.position = p.createVector(x || w1 + p.random(w2 - w1), y || h1 + p.random(h2 - h1));
      this.velocity = p.createVector();
      this.size = p.random(2, 4);
      this.colorIndex = p.floor(p.random(colors.length));
      this.maxSpeed = 0.4;
      this.direction = 1;
      this.useOffset = p.random() < 0.5;
      this.word = word;
      this.birthTime = p.millis();
      this.lifetime = 10000;
      this.dead = false;
    }
    followPattern() {
      let x = p.map(this.position.x, w1, w2, -1, 1) * scl;
      let y = p.map(this.position.y, h1, h2, -1, 1) * scl;
      let eps = 0.01;
      let f = this.useOffset ? chladniOffset : chladni;
      let dx = (f(x + eps, y) - f(x - eps, y)) / (2 * eps);
      let dy = (f(x, y + eps) - f(x, y - eps)) / (2 * eps);
      let grad = p.createVector(dx, dy),
        tangent = p.createVector(-grad.y, grad.x);
      if (tangent.mag() < 0.001) this.direction *= -1;
      let center = p.createVector(p.width / 2, p.height / 2);
      let outward = p5.Vector.sub(this.position, center);
      if (tangent.dot(outward) < 0) tangent.mult(-1);
      tangent.setMag(this.maxSpeed * this.direction);
      return tangent;
    }
    update() {
      if (this.dead) return;
      if (p.millis() - this.birthTime > this.lifetime) {
        this.dead = true;
        return;
      }
      this.velocity = this.followPattern();
      this.position.add(this.velocity);
    }
    display(colors) {
      if (this.dead) return;
      let c = colors[this.colorIndex % colors.length];
      p.stroke(c);
      p.strokeWeight(this.size);
      p.point(this.position.x, this.position.y);
    }
  }

  class DraggableNode {
    constructor(x, y, word) {
      this.pos = p.createVector(x, y);
      this.word = word;
      this.size = 30;
      this.highlight = false;
    }
    update() {}
    isMouseOver(mx, my) {
      return p.dist(mx, my, this.pos.x, this.pos.y) < this.size;
    }
  }

  // ====== CHLADNI FUNCTIONS ======
  function chladni(x, y) {
    let L = 1;
    let base = p.cos(n * p.PI * x / L) * p.cos(m * p.PI * y / L) - p.cos(m * p.PI * x / L) * p.cos(n * p.PI * y / L);
    let r = p.sqrt(x * x + y * y),
      ring = p.sin((m + n) * p.PI * r),
      offset = 0.05;
    let base2 = p.cos(n * p.PI * (x + offset) / L) * p.cos(m * p.PI * (y + offset) / L) - p.cos(m * p.PI * (x + offset) / L) * p.cos(n * p.PI * (y + offset) / L);
    let base3 = p.cos(n * p.PI * (x - offset) / L) * p.cos(m * p.PI * (y - offset) / L) - p.cos(m * p.PI * (x - offset) / L) * p.cos(n * p.PI * (y - offset) / L);
    return base + 0.3 * ring + 0.5 * (base2 + base3);
  }

  function chladniOffset(x, y, pxOff = 10) {
    let ox = p.map(pxOff, 0, p.width, 0, 2),
      oy = p.map(pxOff, 0, p.height, 0, 2);
    return chladni(x + ox, y + oy);
  }

  p.textHeight = function(text, maxWidth) {
    let words = text.split(' ');
    let currentLine = '';
    let h = 0;

    for (let i = 0; i < words.length; i++) {
      let testLine = currentLine + words[i] + ' ';
      let testWidth = p.textWidth(testLine);
      if (testWidth > maxWidth && i > 0) {
        h += p.textAscent() + p.textDescent() + 5;
        currentLine = words[i] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    h += p.textAscent() + p.textDescent() + 5;
    return h;
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);

    messageRect.w = p.width / 3;
    messageRect.x = (p.width - messageRect.w) / 2;
  }
};

window.page3P5 = new p5(page3, "c3");