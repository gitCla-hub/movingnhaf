// ================== PAGE 1 ==================
let page1 = function (p) {
    let nodes = [];
    let vessels = [];
    let animatedParticles = [];
    let colorControl;
    let showMessage = false;
    let messageText =
        "Home threads through every memory and place, connecting even across distance; displacement only spreads its roots further.";

    p.canvas;
    let messageRect = { x: 0, y: 0, w: 0, h: 0, padding: 20 };
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    let speedMultiplier = 1;

    let resetButton;

    p.reset = function () {
        nodes.length = 0;
        vessels.length = 0;
        animatedParticles.length = 0;
        speedMultiplier = 1; 
        p.clear();
        p.setup();
        p.loop();
    };

    p.speedUp = function (factor = 1.2) {
        speedMultiplier *= factor;
        for (let n of nodes) {
            n.vx *= factor;
            n.vy *= factor;
        }
    };
    p.toggleMessage = () => { showMessage = !showMessage; };
    p.saveCanvas = (canvas, filename, extension) => p.save(canvas, filename, extension);

    // ====== SETUP ======
    p.setup = function () {
        p.canvas = p.createCanvas(p.windowWidth, p.windowHeight).parent("c1");

        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("Cormorant");
        p.textStyle(p.ITALIC);
        colorControl = window.globalColorControl;

        messageRect.w = p.width / 3;
        messageRect.x = (p.width - messageRect.w) / 2;

        resetButton = p.createButton('RESET');
        resetButton.parent('c1');
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
        
        for (let ps of animatedParticles) {
            for (let particle of ps) {
                particle.update();
                particle.display(colors);
            }
        }

        p.noStroke();
        p.textSize(30);
        p.rectMode(p.CENTER);
        for (let n of nodes) {
            n.x += n.vx * speedMultiplier;
            n.y += n.vy * speedMultiplier;
            if (n.x < -300 || n.x > p.width + 300) n.vx *= -1;
            if (n.y < -300 || n.y > p.height + 300) n.vy *= -1;

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
        p.text(
            "click on the words to create new connections",
            p.width / 2,
            p.height - 30
        );
        p.pop();
    };

    p.setInputWords = function (rawWords) {
        if (!rawWords || rawWords.length === 0) return;
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
                edges: 0,
                history: [],
                vx: p.random(-0.2, 0.2),
                vy: p.random(-0.2, 0.2),
                highlight: true,
            };
            nodes.push(newNode);
            if (nodes.length > 1)
                connectToNearestAnimatedMultiple(newNode, p.floor(p.random(2, 4)));
        }

        nodes.forEach(n => {
            if (n.word.toLowerCase() !== "home" && !words.includes(n.word)) {
                n.highlight = false;
            }
        });
    }

    p.mousePressed = function () {
        if (showMessage && p.mouseX > messageRect.x && p.mouseX < messageRect.x + messageRect.w && p.mouseY > messageRect.y && p.mouseY < messageRect.y + messageRect.h) {
            isDragging = true;
            dragOffset.x = messageRect.x - p.mouseX;
            dragOffset.y = messageRect.y - p.mouseY;
            return;
        }

        let foundSomething = false;

        for (let i = vessels.length - 1; i >= 0; i--) {
            const v = vessels[i];
            const d = pointLineDist(p.mouseX, p.mouseY, v.a.x, v.a.y, v.b.x, v.b.y);
            if (d < 10) {
                vessels.splice(i, 1);
                animatedParticles = animatedParticles.filter(
                    (ps) =>
                    !(
                        ps.length > 0 &&
                        ((ps[0].a === v.a && ps[0].b === v.b) ||
                            (ps[0].a === v.b && ps[0].b === v.a))
                    )
                );
                v.a.edges--;
                v.b.edges--;
                v.a.history = v.a.history.filter((h) => h !== v.b);
                v.b.history = v.b.history.filter((h) => h !== v.a);
                connectToNearestAnimatedMultiple(v.a, 1);
                connectToNearestAnimatedMultiple(v.b, 1);
                foundSomething = true;
                break;
            }
        }

        if (!foundSomething) {
            for (let n of nodes) {
                if (p.dist(p.mouseX, p.mouseY, n.x, n.y) < 20) {
                    nodes.forEach(other => {
                        if (other.word.toLowerCase() !== "home") {
                            other.highlight = false;
                        }
                    });
                    n.highlight = true;

                    vessels = vessels.filter((v) => v.a !== n && v.b !== n);
                    animatedParticles = animatedParticles.filter(
                        (ps) => ps.length > 0 && ps[0].a !== n && ps[0].b !== n
                    );
                    n.edges = 0;
                    n.history = [];
                    for (let other of nodes) {
                        if (other !== n) {
                            other.history = other.history.filter((h) => h !== n);
                            other.edges = other.history.length;
                        }
                    }
                    connectToNearestAnimatedMultiple(n, 3);
                    foundSomething = true;
                    break;
                }
            }
        }

        if (!foundSomething) {
            nodes.forEach(n => {
                if (n.word.toLowerCase() !== "home") {
                    n.highlight = false;
                }
            });
        }
    };

    p.mouseReleased = function () {
        isDragging = false;
    };

    class ParticleCurve {
        constructor(a, b, ctrl, delay = 0) {
            this.a = a;
            this.b = b;
            this.ctrl = ctrl;
            this.t = p.random();
            this.speed = (0.001 + p.random(0.0005, 0.0015)) * speedMultiplier;
            this.colorIndex = p.floor(p.random(4));
            this.size = p.random(2, 6);
        }
        update() {
            this.t += this.speed;
            if (this.t > 1) this.t = 0;
        }
        display(colors) {
            const x = p.bezierPoint(
                this.a.x,
                this.ctrl.x,
                this.ctrl.x,
                this.b.x,
                this.t
            );
            const y = p.bezierPoint(
                this.a.y,
                this.ctrl.y,
                this.ctrl.y,
                this.b.y,
                this.t
            );
            const c = colors[this.colorIndex % colors.length];
            p.stroke(c);
            p.strokeWeight(this.size);
            p.point(x, y);
        }
    }

    function spawnParticleLine(a, b, count = 20) {
        for (let ps of animatedParticles) {
            if (
                (ps[0].a === a && ps[0].b === b) ||
                (ps[0].a === b && ps[0].b === a)
            )
                return;
        }
        const ctrlBase = p.createVector(
            (a.x + b.x) / 2 + p.random(-100, 100),
            (a.y + b.y) / 2 + p.random(-100, 100)
        );
        const offsets = [0, 3, -3];
        for (let off of offsets) {
            const ctrl = p.createVector(ctrlBase.x + off, ctrlBase.y + off);
            const ps = [];
            for (let i = 0; i < count; i++)
                ps.push(new ParticleCurve(a, b, ctrl, i * 0.05));
            animatedParticles.push(ps);
        }
    }

    class Vessel {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
    }

    function connectToNearestAnimatedMultiple(node, nTargets = 1) {
        const candidates = nodes.filter(
            (o) =>
            o !== node && !node.history.includes(o) && node.edges < 6 && o.edges < 6
        );
        candidates.sort((a, b) => dist2(node, a) - dist2(node, b));
        for (let i = 0; i < p.min(nTargets, candidates.length); i++) {
            const target = candidates[i];
            const v = new Vessel(node, target);
            vessels.push(v);
            node.edges++;
            target.edges++;
            node.history.push(target);
            target.history.push(node);
            spawnParticleLine(node, target);
        }
    }

    function dist2(a, b) {
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }

    function pointLineDist(px, py, x1, y1, x2, y2) {
        const A = px - x1,
            B = py - y1,
            C = x2 - x1,
            D = y2 - y1;
        const dot = A * C + B * D,
            lenSq = C * C + D * D,
            param = lenSq !== 0 ? dot / lenSq : -1;
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = px - xx,
            dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = p.floor(p.random(i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    p.textHeight = function (text, maxWidth) {
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

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        messageRect.w = p.width / 3;
        messageRect.x = (p.width - messageRect.w) / 2;

        if (resetButton) {
            resetButton.position(p.width / 2 - resetButton.width / 2, 50);
        }
    };
};

window.page1P5 = new p5(page1, "c1");