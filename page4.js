// ================== PAGE 4 ==================
let page4 = function (p) {
  let nodes = [];
  let streams = [];
  let colorControl;
  let showMessage = false;
  let showInstructions = true;
  let messageText =
    "Home is not a place you find, but a map you draw. Your path is a continuous journey, with every connection and new experience adding a unique line and forging a new sense of belonging.";
  let canvas;
  let isDragging = false;
  let draggedNode = null;
  let offsetX, offsetY;

  let resetButton;

  // ====== SETUP ======
  p.setup = function () {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight).parent("c4");
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont("Cormorant");
    p.textStyle(p.ITALIC);
    colorControl = window.globalColorControl;

    resetButton = p.createButton('RESET');
    resetButton.parent('wrap4'); 
    resetButton.style('position', 'absolute');
    resetButton.style('z-index', '1000');
    resetButton.style('cursor', 'pointer');
    resetButton.style('padding', '8px 12px');
    resetButton.style('border-radius', '0px');
    resetButton.style('font-family', 'Cormorant');
    resetButton.style('border', 'none');
    resetButton.style('font-size', '16px');
    resetButton.position(p.width / 2 - resetButton.width / 2, 0);

    resetButton.mousePressed(() => p.reset());

    p.setInputWords(window.rawInputWords);
  };

  // ====== DRAW ======
  p.draw = function () {
    if (!colorControl) return;

    const colors = colorControl.getParticleColors().map((c) => p.color(c));
    const bgColor = p.color(colorControl.getBackgroundColor());
    const textColor = p.color(colorControl.getTextColor());
    p.background(p.red(bgColor), p.green(bgColor), p.blue(bgColor), 20);

    const buttonBgColor = p.color(colors.length > 2 ? colors[2] : colors[0] || 255);
    const buttonTextColor = p.color(bgColor);
    resetButton.style('background-color', buttonBgColor.toString());
    resetButton.style('color', buttonTextColor.toString());

    if (window.currentBlendMode === 'NORMAL') {
      p.blendMode(p.BLEND);
    } else if (window.currentBlendMode === 'OVERLAY') {
      p.blendMode(p.OVERLAY);
    } else if (window.currentBlendMode === 'BURN') {
      p.blendMode(p.BURN);
    } else if (window.currentBlendMode === 'GREYSCALE') {
      p.filter(p.GRAY);
    }

    for (let stream of streams) {
      stream.update();
      stream.display(colors);
    }
    
    p.blendMode(p.BLEND);

    p.noStroke();
    p.textSize(30);
    p.rectMode(p.CENTER);
    for (let n of nodes) {
      if (!n.isBeingDragged) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -300 || n.x > p.width + 300) n.vx *= -1;
        if (n.y < -300 || n.y > p.height + 300) n.vy *= -1;
      }
      
      if (n.highlight) {
        const highlightColor = p.color(colors[0]);
        p.fill(highlightColor);
        p.rect(p.round(n.x), p.round(n.y), p.textWidth(n.word) + 6, p.textAscent() + p.textDescent() + 3);
        p.fill(bgColor);
        p.text(n.word, p.round(n.x), p.round(n.y));
      } else {
        p.fill(textColor);
        p.text(n.word, p.round(n.x), p.round(n.y));
      }
    }

    p.push();
    p.rectMode(p.CORNER);
    p.textAlign(p.LEFT, p.TOP);
    if (showMessage) {
      p.fill(0, 180);
      p.noStroke();
      p.rect(50, 50, p.width - 100, 150, 10);
      p.fill(255);
      p.textSize(20);
      p.text(messageText, 60, 60, p.width - 120, 130);
    }
    p.pop();

    if (showInstructions) {
      p.push();
      p.textFont("Cormorant");
      p.textSize(24);
      p.textAlign(p.CENTER, p.CENTER);
      let particleColor = colors.length > 1 ? colors[2] : textColor;
      p.fill(particleColor);
      p.noStroke();
      p.text(
        "click on the words to create new connections",
        p.width / 2,
        p.height - 30
      );
      p.pop();
    }
  };

  p.setInputWords = function (rawWords) {
    if (!rawWords || rawWords.length === 0) return;
    nodes = []; 
    streams = []; 
    let words = [];
    for (let w of rawWords) words.push(w, w);
    while (words.length < 10) {
      for (let w of rawWords) {
        words.push(w);
        if (words.length >= 10) break;
      }
    }
    shuffleArray(words);
    addNodes(words);
  };
  
  p.reset = function() {
    nodes = [];
    streams = [];
    p.clear();
    p.setup();
    p.loop();
  };

  function addNodes(words) {
    let tries = 0,
      maxTries = 20000;
    for (let i = 0; i < words.length; i++) {
      let w = words[i],
        x,
        y,
        valid = false;
      while (!valid && tries < maxTries) {
        x = p.random(-200, p.width + 200);
        y = p.random(-200, p.height + 200);
        valid = true;
        for (let n of nodes) {
          if (p.dist(x, y, n.x, n.y) < 20) {
            valid = false;
            break;
          }
        }
        tries++;
      }
      let newNode = {
        x,
        y,
        word: w,
        vx: p.random(-0.2, 0.2),
        vy: p.random(-0.2, 0.2),
        highlight: true,
        isBeingDragged: false,
      };
      nodes.push(newNode);
    }

    nodes.forEach(n => {
      if (n.word.toLowerCase() !== "home" && !words.includes(n.word)) {
        n.highlight = false;
      }
    });
  }

  p.mousePressed = function () {
    for (let n of nodes) {
      if (p.dist(p.mouseX, p.mouseY, n.x, n.y) < 20) {
        isDragging = true;
        draggedNode = n;
        draggedNode.isBeingDragged = true;
        offsetX = p.mouseX - draggedNode.x;
        offsetY = p.mouseY - draggedNode.y;

        let nearestNode = null;
        let minDist = Infinity;
        for (let other of nodes) {
            if (other !== n) {
                const d = p.dist(n.x, n.y, other.x, other.y);
                if (d < minDist) {
                    minDist = d;
                    nearestNode = other;
                }
            }
        }
        if (nearestNode) {
            streams.push(new ParticleStream(n, nearestNode));
        }
        return;
      }
    }
  };
  
  p.mouseDragged = function() {
      if (isDragging && draggedNode) {
          draggedNode.x = p.mouseX - offsetX;
          draggedNode.y = p.mouseY - offsetY;
      }
  };
  
  p.mouseReleased = function() {
      if (isDragging) {
          draggedNode.isBeingDragged = false;
          draggedNode = null;
          isDragging = false;
      }
  };

  class ParticleStream {
    constructor(startNode, endNode) {
        this.start = startNode;
        this.end = endNode;
        this.particles = [];
        this.particleCount = p.floor(p.random(20, 51));
        
        for(let i = 0; i < this.particleCount; i++) {
            this.particles.push(new FlowParticle(this.start, this.end));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    display(colors) {
        for (let particle of this.particles) {
            particle.display(colors);
        }
    }
  }

  class FlowParticle {
    constructor(startNode, endNode) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.pos = p.createVector(startNode.x, startNode.y);
        this.t = p.random(1);
        this.size = p.random(2, 6);
        this.colorIndex = p.floor(p.random(4));
        this.lifetime = 10000; // 10 giây
        this.startTime = p.millis();
        this.isCurved = p.random() > 0.5; // 50% chance to be curved
        
        const dist = p.dist(startNode.x, startNode.y, endNode.x, endNode.y);
        const baseSpeed = 0.005; // Tốc độ cơ bản
        this.speed = baseSpeed + (dist / 10000) * 0.01; // Tốc độ càng nhanh khi khoảng cách càng xa

        if (this.isCurved) {
            this.ctrl = p.createVector(
                p.random(startNode.x, endNode.x),
                p.random(startNode.y, endNode.y)
            );
        }
    }

    update() {
        this.t += this.speed;
        
        if (this.isCurved) {
            this.pos.x = p.bezierPoint(this.startNode.x, this.ctrl.x, this.ctrl.x, this.endNode.x, this.t);
            this.pos.y = p.bezierPoint(this.startNode.y, this.ctrl.y, this.ctrl.y, this.endNode.y, this.t);
        } else {
            this.pos = p.createVector(this.startNode.x, this.startNode.y).lerp(p.createVector(this.endNode.x, this.endNode.y), this.t);
        }

        if (this.t >= 1) {
            this.t = 1;
            this.speed = -this.speed; 
        } else if (this.t <= 0) {
            this.t = 0;
            this.speed = -this.speed;
        }
    }

    isDead() {
        return p.millis() - this.startTime > this.lifetime;
    }

    display(colors) {
        const c = colors[this.colorIndex % colors.length];
        p.stroke(c);
        p.strokeWeight(this.size);
        p.point(this.pos.x, this.pos.y);
    }
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = p.floor(p.random(i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  p.toggleMessage = function () {
    showMessage = !showMessage;
  };

  p.setShowInstructions = function(val) {
    showInstructions = val;
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if (resetButton) {
      resetButton.position(p.width / 2 - resetButton.width / 2, 0);
    }
  };
};

window.page4P5 = new p5(page4, "c4");