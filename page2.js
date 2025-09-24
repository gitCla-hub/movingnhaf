// ================== PAGE 2 ==================
let page2 = function (p) {
  let particles = [];
  let words = [];
  let inputWords = [];
  let wordIndex = 0;
  let lastSpawnPos = null;
  let colorControl;
  let showMessage = false;
  let messageText =
    "Home wears many faces at once, unfolding horizontally; every move adds another layer to its being.";

  p.canvas;
  let messageRect = { x: 0, y: 0, w: 0, h: 0, padding: 20 };
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  
  let resetButton;

  p.setInputWords = function (rawWords) {
    inputWords = rawWords || [];
    words = [];
    wordIndex = 0;
    lastSpawnPos = null;
  };
  
  p.toggleMessage = () => { showMessage = !showMessage; };

  p.saveCanvas = (canvas, filename, extension) => p.save(canvas, filename, extension);

  p.reset = function() {
    words = [];
    wordIndex = 0;
    lastSpawnPos = null;
    p.clear();
    p.setup();
    p.loop();
  };

  // ====== SETUP ======
  p.setup = function () {
    p.canvas = p.createCanvas(p.windowWidth, p.windowHeight).parent("c2");
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont("Cormorant");
    p.textStyle(p.ITALIC);
    colorControl = window.globalColorControl;

    initializeParticles();

    messageRect.w = p.width / 3;
    messageRect.x = (p.width - messageRect.w) / 2;
    
    resetButton = p.createButton('RESET');
    resetButton.parent('c2');
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
  };

  // ====== FUNCTION TO INITIALIZE PARTICLES ======
  function initializeParticles() {
    particles = [];
    const spacing = 15;
    for (let i = 0; i < p.width; i += spacing) {
      for (let j = 0; j < p.height; j += spacing) {
        particles.push({
          x: i,
          y: j,
          originalX: i,
          originalY: j,
          size: p.random(4, 6),
        });
      }
    }
  }

  // ====== DRAW ======
  p.draw = function () {
    if (!colorControl) return;

    const colors = colorControl.getParticleColors().map((c) => p.color(c));
    const bgColor = p.color(colorControl.getBackgroundColor());
    const textColor = p.color(colorControl.getTextColor());

    const highlightColor = colors.length > 0 ? p.color(colors[0]) : p.color(255);

    p.background(p.red(bgColor), p.green(bgColor), p.blue(bgColor), 20);

    const buttonBgColor = p.color(colors.length > 2 ? colors[2] : colors[0] || 255); 
    const buttonTextColor = p.color(bgColor);
    resetButton.style('background-color', buttonBgColor.toString());
    resetButton.style('color', buttonTextColor.toString());

    for (let i = 0; i < particles.length; i++) {
      let pp = particles[i];
      pp.clr = colors[i % colors.length];

      p.fill(pp.clr);
      p.noStroke();
      p.ellipse(pp.x, pp.y, pp.size);

      let dx = pp.x - p.mouseX;
      let dy = pp.y - p.mouseY;
      let dist = p.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        let angle = p.atan2(dy, dx);
        let force = p.map(dist, 0, 200, 10, 0);
        pp.x += p.cos(angle) * force;
        pp.y += p.sin(angle) * force;
      }

      pp.x += (pp.originalX - pp.x) * 0.02;
      pp.y += (pp.originalY - pp.y) * 0.02;
    }

    p.textSize(30);
    p.rectMode(p.CENTER); 
    const speed = p.dist(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
    for (let i = words.length - 1; i >= 0; i--) {
      let w = words[i];

      let fadeAmount = speed < 0.1 ? 1.2 : p.map(speed, 0, 50, 0.5, 6);
      w.alpha -= fadeAmount;
      w.alpha = p.max(0, w.alpha);

      p.noStroke();
      p.fill(p.red(highlightColor), p.green(highlightColor), p.blue(highlightColor), w.alpha);
      p.rect(w.pos.x, w.pos.y, p.textWidth(w.text) + 6, p.textAscent() + p.textDescent() + 3);

      p.fill(p.red(bgColor), p.green(bgColor), p.blue(bgColor), w.alpha);
      p.text(w.text, w.pos.x, w.pos.y);
      
      if (w.alpha <= 0) words.splice(i, 1);
    }

    p.push(); 
    p.rectMode(p.CORNER); 
    p.textAlign(p.LEFT, p.TOP);

    if (showMessage) {
      if (isDragging) {
        messageRect.x = p.mouseX + dragOffset.x;
        messageRect.y = p.mouseY + dragOffset.y;
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
    p.text("move your mouse to reveal the words", p.width / 2, p.height - 30);
    p.pop();
  };

  p.mouseMoved = function () {
    if (inputWords.length === 0) return;
    if (
      !lastSpawnPos ||
      p.dist(p.mouseX, p.mouseY, lastSpawnPos.x, lastSpawnPos.y) > 100
    ) {
      words.push({
        text: inputWords[wordIndex],
        pos: p.createVector(p.mouseX, p.mouseY),
        alpha: 255,
      });
      wordIndex = (wordIndex + 1) % inputWords.length;
      lastSpawnPos = p.createVector(p.mouseX, p.mouseY);
    }
  };

  p.mousePressed = function () {
    if (showMessage && p.mouseX > messageRect.x && p.mouseX < messageRect.x + messageRect.w && p.mouseY > messageRect.y && p.mouseY < messageRect.y + messageRect.h) {
      isDragging = true;
      dragOffset.x = messageRect.x - p.mouseX;
      dragOffset.y = messageRect.y - p.mouseY;
      return; 
    }
  };

  p.mouseReleased = function() {
    isDragging = false;
  };

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

    initializeParticles();

    messageRect.w = p.width / 3;
    messageRect.x = (p.width - messageRect.w) / 2;
    
    if (resetButton) {
      resetButton.position(p.width / 2 - resetButton.width / 2, 0);
    }
  }
};

window.page2P5 = new p5(page2, "c2");