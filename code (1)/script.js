
// --- Module 1: Word Processing & API ---
(function() {
  const groups = {
    wrap1: ["family", "mother", "father", "brother", "sister", "home", "parent", "child", "kids", "wife", "husband", "grandmother", "grandfather", "grandparents", "cousin", "uncle", "aunt", "son", "daughter", "baby", "relative", "kin", "ancestor", "descendant", "household", "anna", "john", "mary", "lan", "minh", "tom", "susan", "david", "sophia", "peter", "linh", "move", "warm", "ngoc", "rest", "heal", "sleep", "myself", "me", "i"],
    wrap2: ["structure", "house", "building", "roof", "wall", "architecture", "apartment", "flat", "villa", "cottage", "tower", "skyscraper", "room", "hall", "door", "window", "floor", "ceiling", "kitchen", "bathroom", "garden", "yard", "garage", "bridge", "pillar", "foundation", "balcony", "corridor", "stairs", "gate"],
    wrap3: ["memory", "nostalgia", "childhood", "past", "history", "story", "recollection", "remembrance", "experience", "tradition", "diary", "timeline", "record", "heritage", "legend", "myth", "archive", "moment", "event", "incident", "yesterday", "old", "antique", "ancestry", "roots", "origin", "culture"],
    wrap4: ["dream", "future", "desire", "imagination", "hope", "vision", "goal", "plan", "ambition", "wish", "fantasy", "inspiration", "tomorrow", "possibility", "destiny", "prospect", "target", "aspiration", "innovation", "progress", "change", "moving", "changing", "growth", "potential", "journey", "path", "direction"]
  };

  function normalizeWord(word) {
    word = word.toLowerCase();
    if (word.endsWith("ing")) {
      let stem = word.slice(0, -3);
      return stem.endsWith("v") ? stem + "e" : stem;
    }
    if (word.endsWith("ied")) return word.slice(0, -3) + "y";
    if (word.endsWith("ed")) {
      let stem = word.slice(0, -2);
      return stem.endsWith("p") ? stem + "e" : stem;
    }
    if (word.endsWith("ies")) return word.slice(0, -3) + "y";
    if (word.endsWith("es")) return word.slice(0, -2);
    if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
    return word;
  }

  async function getSynonyms(word) {
    try {
      const res = await fetch(`https://api.datamuse.com/words?rel_syn=${word}`);
      const data = await res.json();
      return data.map(d => d.word.toLowerCase());
    } catch (err) {
      console.error("Synonym fetch error:", err);
      return [];
    }
  }

  window.findPageForWords = async function(words) {
    for (let w of words) {
      let nWord = normalizeWord(w);
      for (let g in groups) {
        if (groups[g].includes(nWord)) return g;
      }
      const syns = await getSynonyms(nWord);
      for (let g in groups) {
        if (groups[g].some(base => syns.includes(base))) return g;
      }
    }
    return null;
  };
})();

// --- Module 2: Page & UI Control ---
(function() {
  let currentPage = "home";
  const input = document.getElementById("typeinput");
  const addBtn = document.getElementById("addBtn");
  const navButtons = document.querySelectorAll(".nav button");
  const wrappers = document.querySelectorAll(".canvas-wrapper");
  const landingCanvas = document.getElementById("landing-canvas");
  const questDiv = document.querySelector(".quest");
  const colorContainer = document.getElementById("color-controls-container");
  window.currentBlendMode = 'lightmode';

  function pauseAll() {
    [window.landingP5, window.page1P5, window.page2P5, window.page3P5, window.page4P5].forEach(p5 => {
      if (p5) p5.noLoop();
    });
  }

  function hideAllPages() {
    wrappers.forEach(w => w.classList.remove("visible"));
    landingCanvas.style.display = "none";
    colorContainer.style.display = "none";
  }

  function showHome() {
    hideAllPages();
    pauseAll();
    landingCanvas.style.display = "block";
    if (window.landingP5) window.landingP5.loop();
    currentPage = "home";
    questDiv.style.display = "flex";
    if (addBtn) addBtn.style.display = "none";
  }

  async function handleWords(words, targetWrap = null) {
    if (!words || words.length === 0) return;

    if (!targetWrap) {
      const rand = Math.floor(Math.random() * 4) + 1;
      targetWrap = `wrap${rand}`;
    }

    input.value = "";
    const btn = document.querySelector(`.nav button[data-target='${targetWrap}']`);
    if (btn) btn.click();

    const p5Instances = {
      wrap1: window.page1P5,
      wrap2: window.page2P5,
      wrap3: window.page3P5,
      wrap4: window.page4P5
    };

    if (p5Instances[targetWrap]) {
      p5Instances[targetWrap].setInputWords(words);
    }
    
    if (Tone.context.state === "suspended") {
      await Tone.start();
    }
    if (window.synth) {
      window.isMuted = false;
      Tone.Transport.start();
      window.transpose += 1;
      window.createParts();
    }
  }

  function initSettings() {
    const blendModeSelect = document.getElementById("blend-mode-select");
    const body = document.body;
    
    if (blendModeSelect) {
      blendModeSelect.addEventListener("change", (e) => {
        window.currentBlendMode = e.target.value;
        if (window.globalColorControl) {
          window.globalColorControl.updateColorsForBlendMode(window.currentBlendMode);
        }
        
        if (window.currentBlendMode === 'darkmode') {
          body.classList.add("dark-mode");
        } else {
          body.classList.remove("dark-mode");
        }
      });
    }

    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        if (window.gainNode) {
          window.gainNode.gain.value = parseFloat(e.target.value);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    pauseAll();
    showHome();
    if (window.landingP5) window.landingP5.loop();
    initSettings(); 

    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        if (targetId === "home") {
          showHome();
        } else {
          hideAllPages();
          pauseAll();
          currentPage = targetId;
          document.getElementById(targetId).classList.add("visible");
          colorContainer.style.display = "flex";

          const p5Instances = {
            wrap1: window.page1P5,
            wrap2: window.page2P5,
            wrap3: window.page3P5,
            wrap4: window.page4P5
          };
          if (p5Instances[targetId]) {
            p5Instances[targetId].loop();
          }
          questDiv.style.display = "flex";
        }
      });
    });

    if (input) {
      input.addEventListener("keydown", async e => {
        if (e.key === "Enter" && currentPage === "home") {
          e.preventDefault();
          const words = input.value.trim().split(/\s+/);
          if (words.length === 0) return;
          let targetWrap = await window.findPageForWords(words);
          handleWords(words, targetWrap);
        }
      });
    }

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (currentPage !== "home") {
          const words = input.value.trim().split(/\s+/);
          if (words.length === 0) return;
          handleWords(words, currentPage);
        }
      });
    }

    const homeButton = document.querySelector(".btn-home");
    if (homeButton) {
      homeButton.addEventListener("click", showHome);
    }

    document.querySelectorAll(".close-btn").forEach(btn => btn.addEventListener("click", () => closeOverlay(btn.dataset.target)));
    document.querySelectorAll(".overlay").forEach(o => o.addEventListener("click", e => { if (e.target === o) closeOverlay(o.id); }));
  });

  function openOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.style.display = "flex";
  }

  function closeOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.style.display = "none";
  }

  document.querySelector(".btn-instructions")?.addEventListener("click", () => openOverlay("overlay-instructions"));
  document.querySelector(".btn-setting")?.addEventListener("click", () => openOverlay("overlay-setting"));
  document.querySelector(".about")?.addEventListener("click", () => openOverlay("overlay-about"));
})();


// --- Module 3: Color Control ---
class ColorControl {
  constructor(containerId, defaultColors) {
    this.container = document.getElementById(containerId);
    this.colorPickers = [];
    this.labels = ["particle 1", "particle 2", "particle 3", "particle 4", "background"];
    this.defaults = defaultColors;
    this.darkmodePalette = ["#64ff00", "#00e5ff", "#ff00cc", "#00ff73", "#000000"];
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.container.classList.add("color-control");
    for (let i = 0; i < this.labels.length; i++) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("color-item");
      const picker = document.createElement("input");
      picker.type = "color";
      picker.value = this.defaults[i];
      wrapper.appendChild(picker);
      this.colorPickers.push(picker);
      const lbl = document.createElement("div");
      lbl.innerText = this.labels[i];
      lbl.classList.add("color-label");
      wrapper.appendChild(lbl);
      this.container.appendChild(wrapper);
    }
    const resetBtn = document.createElement("button");
    resetBtn.innerText = "Reset Colors";
    resetBtn.classList.add("reset-color-btn");
    resetBtn.addEventListener("click", () => this.reset());
    this.container.appendChild(resetBtn);
  }

  getColors() { 
    const colors = this.colorPickers.map(p => p.value);
    colors[5] = colors[4];
    return colors;
  }
  
  getParticleColors() { 
    return this.colorPickers.slice(0, 4).map(p => p.value); 
  }
  
  getBackgroundColor() { 
    return this.colorPickers[4].value; 
  }
  
  getTextColor() { 
    return this.getBackgroundColor(); 
  }

  reset() { 
    this.colorPickers.forEach((p, i) => { 
      if (i < 5) {
        p.value = this.defaults[i]; 
        p.dispatchEvent(new Event('input')); 
      }
    }); 
  }

  updateColorsForBlendMode(mode) {
    let newColors;
    if (mode === 'darkmode') {
      newColors = this.darkmodePalette;
    } else {
      newColors = this.defaults;
    }

    this.colorPickers.forEach((p, i) => {
      if (i < 5) {
        p.value = newColors[i];
      }
    });
  }
}

window.globalColorControl = null;
document.addEventListener("DOMContentLoaded", () => {
  const defaultColors = ["#B3E8D7", "#B9ECEF", "#CB95D8", "#afafaf", "#FFFFFF"];
  window.globalColorControl = new ColorControl("color-controls-container", defaultColors);
  document.getElementById("color-controls-container").style.display = "none";
});

// --- Module 4: Global Event Handlers ---
(function() {
  const addBtn = document.getElementById("addBtn");

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    const pageMap = {
      'wrap1': 'page1P5',
      'wrap2': 'page2P5',
      'wrap3': 'page3P5',
      'wrap4': 'page4P5',
    };

    const visiblePage = document.querySelector(".canvas-wrapper.visible");
    let p5Instance = null;

    if (visiblePage) {
      const pageId = visiblePage.id;
      p5Instance = window[pageMap[pageId]];
    } else if (document.getElementById("landing-canvas").style.display === "block") {
      p5Instance = window.landingP5;
    }
    
    if (p5Instance) {
      if (e.key.toLowerCase() === "i" && p5Instance.toggleMessage) {
        p5Instance.toggleMessage();
      }
      if (e.key.toLowerCase() === "s" && p5Instance.canvas) {
        window.takeScreenshot();
      }
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (addBtn) addBtn.style.display = "none";
    const navButtons = document.querySelectorAll(".nav button");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        if (addBtn) {
          addBtn.style.display = targetId.startsWith("wrap") ? "inline-block" : "none";
        }
      });
    });
  });

  const quest = document.querySelector(".quest");
  if (quest) {
    let offsetX = 0,
      offsetY = 0,
      isDown = false;
    quest.addEventListener("mousedown", (e) => {
      isDown = true;
      offsetX = e.clientX - quest.offsetLeft;
      offsetY = e.clientY - quest.offsetTop;
      quest.style.position = "absolute";
      quest.style.zIndex = 1000;
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      quest.style.left = (e.clientX - offsetX) + "px";
      quest.style.top = (e.clientY - offsetY) + "px";
    });
    document.addEventListener("mouseup", () => {
      isDown = false;
    });
  }
})();

// --- Module 5: Music & Screenshot ---
(function() {
  window.midi;
  window.synth;
  window.parts = [];
  window.transpose = 0;
  window.isMuted = false;
  let audioUnlocked = false;
  window.gainNode = null; 

  window.loadMidiFile = async function(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    window.midi = new Midi(arrayBuffer);
    window.gainNode = new Tone.Gain(0.5).toDestination(); 
    window.synth = new Tone.PolySynth(Tone.Synth).connect(window.gainNode); 
    if (window.midi.header.tempos.length > 0) {
      Tone.Transport.bpm.value = window.midi.header.tempos[0].bpm;
    }
    const duration = window.midi.duration;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = duration;
    window.createParts();
  }

  window.createParts = function() {
    window.parts.forEach(p => p.dispose());
    window.parts = [];
    window.midi.tracks.forEach(track => {
      const part = new Tone.Part((time, note) => {
        const shiftedMidi = note.midi + window.transpose;
        const shiftedName = Tone.Frequency(shiftedMidi, "midi").toNote();
        if (!window.isMuted) {
          window.synth.triggerAttackRelease(shiftedName, note.duration, time);
        }
      }, track.notes).start(0);
      part.loop = false;
      window.parts.push(part);
    });
  }

  async function unlockAudio() {
    if (audioUnlocked) return;
    try {
      await Tone.start();
      await window.loadMidiFile("fifth.mid");
      Tone.Transport.start();
      audioUnlocked = true;
      console.log("Audio unlocked by user interaction. Press 'm' to mute/unmute.");
    } catch (e) {
      console.error("Failed to start audio context:", e);
    }
  }

  document.addEventListener("mousedown", unlockAudio, { once: true });
  document.addEventListener("keydown", async (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }
    if (e.key.toLowerCase() === "m") {
      if (!audioUnlocked) {
        await unlockAudio();
      }
      if (Tone.context.state === "running") {
        window.isMuted = !window.isMuted;
        if (window.gainNode) {
          const targetVolume = window.isMuted ? 0 : document.getElementById("volume-slider").value;
          window.gainNode.gain.rampTo(targetVolume, 0.1); 
        }
        console.log("Mute =", window.isMuted);
      }
    }
  });

  window.takeScreenshot = function() {
    const visiblePage = document.querySelector(".canvas-wrapper.visible");
    const filename = `screenshot-${new Date().toISOString()}.png`;
    
    const pageMap = {
      'wrap1': 'page1P5',
      'wrap2': 'page2P5',
      'wrap3': 'page3P5',
      'wrap4': 'page4P5',
    };
    let p5Instance = null;

    if (visiblePage) {
        const pageId = visiblePage.id;
        p5Instance = window[pageMap[pageId]];
    } else if (document.getElementById("landing-canvas").style.display === "block") {
        p5Instance = window.landingP5;
    }
    
    if (p5Instance && p5Instance.canvas && p5Instance.save) {
      p5Instance.save(filename);
      console.log(`Screenshot saved for ${p5Instance.canvas.parentElement.id}: ${filename}`);
    } else {
      console.log("No canvas found or save function is missing.");
    }
  };
})();
