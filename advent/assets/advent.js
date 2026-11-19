// Behaviour of the advent calendar and the day pages. Plain script, no build step.
(function () {
  'use strict';

  // The key of the door memory in localStorage. Only this script uses it.
  const KEY = 'advent-2026-opened';
  // The length of the door turn in advent.css, in ms.
  const TURN_MS = 600;
  // Longer than the shake animation in advent.css (400 ms). The timer removes
  // the class even when no animation runs, as under reduced motion.
  const SHAKE_MS = 500;
  // How long the message of a locked door stays on the screen, in ms: long enough
  // to read one short line, short enough that it does not cover the calendar.
  const MESSAGE_MS = 4000;
  // How often the countdown and the end check run, in ms.
  const TICK_MS = 1000;
  const SNOWFLAKES = 60;
  const REDUCE = '(prefers-reduced-motion: reduce)';

  // The timer that hides the message of a locked door; a new message restarts it.
  let messageTimer = null;

  function warn(message, error) {
    if (typeof console !== 'undefined') {
      // Some calls pass no error; a bare undefined would print as a stray word.
      const details = error === undefined ? [] : [error];
      console.warn('advent: ' + message, ...details);
    }
  }

  // Run one feature so that its failure does not stop the others.
  function run(name, feature) {
    try {
      feature();
    } catch (error) {
      warn(name + ' did not start', error);
    }
  }

  function all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function reducedMotion() {
    return typeof window.matchMedia === 'function' && window.matchMedia(REDUCE).matches;
  }

  // The day numbers in memory. A corrupt store counts as empty. A store that
  // cannot be read gives null, so that a write does not replace it.
  function readOpened() {
    const opened = new Set();
    let raw;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch (error) {
      warn('storage cannot be read, door memory is off', error);
      return null;
    }
    if (raw === null) {
      return opened;
    }
    let list;
    try {
      list = JSON.parse(raw);
    } catch (error) {
      warn('door memory is not JSON, ignored', error);
      return opened;
    }
    if (!Array.isArray(list)) {
      warn('door memory is not an array, ignored');
      return opened;
    }
    for (const entry of list) {
      if (typeof entry === 'number' && Number.isInteger(entry)) {
        opened.add(entry);
      }
    }
    return opened;
  }

  function remember(day) {
    const opened = readOpened();
    if (opened === null) {
      return;
    }
    opened.add(day);
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...opened]));
    } catch (error) {
      warn('cannot store the opened door', error);
    }
  }

  // The end instant from body[data-end], or null when there is none.
  function endInstant() {
    const body = document.body;
    if (!body || body.dataset.end === undefined) {
      return null;
    }
    const end = Date.parse(body.dataset.end);
    if (Number.isNaN(end)) {
      warn('data-end is not a date, ignored');
      return null;
    }
    return end;
  }

  // Mark as open the published doors in memory, and all of them after the end.
  function showOpenDoors() {
    const end = endInstant();
    const ended = end !== null && Date.now() >= end;
    const opened = readOpened() || new Set();
    for (const door of all('.door:not(.is-locked)')) {
      if (ended || opened.has(Number(door.dataset.day))) {
        door.classList.add('is-open');
      }
    }
  }

  // Open the doors when the end passes while the page stays open.
  function watchEnd() {
    const end = endInstant();
    if (end === null || Date.now() >= end) {
      return;
    }
    const timer = window.setInterval(function () {
      if (Date.now() >= end) {
        window.clearInterval(timer);
        showOpenDoors();
      }
    }, TICK_MS);
  }

  // A day page remembers its own day.
  function rememberDay() {
    const body = document.body;
    if (!body || !body.classList.contains('advent-day')) {
      return;
    }
    const day = Number(body.dataset.day);
    if (!Number.isInteger(day)) {
      warn('data-day is not a day number, not remembered');
      return;
    }
    remember(day);
  }

  function startCountdown() {
    const section = document.getElementById('countdown');
    if (!section) {
      return;
    }
    const launch = Date.parse(section.dataset.launch);
    if (Number.isNaN(launch)) {
      warn('data-launch is not a date, countdown not started');
      return;
    }
    const clock = section.querySelector('.countdown-clock');
    const late = section.querySelector('.countdown-late');
    const cells = {};
    for (const cell of all('[data-unit]')) {
      cells[cell.dataset.unit] = cell;
    }

    function show(name, value) {
      if (cells[name]) {
        cells[name].textContent = String(value).padStart(2, '0');
      }
    }

    function tick() {
      const left = Math.floor((launch - Date.now()) / 1000);
      if (left <= 0) {
        window.clearInterval(timer);
        if (clock) {
          clock.hidden = true;
        }
        if (late) {
          late.hidden = false;
        }
        return;
      }
      show('days', Math.floor(left / 86400));
      show('hours', Math.floor((left % 86400) / 3600));
      show('minutes', Math.floor((left % 3600) / 60));
      show('seconds', left % 60);
    }

    const timer = window.setInterval(tick, TICK_MS);
    tick();
  }

  // Shake a locked door and say when it opens.
  function shake(door) {
    door.classList.add('is-shaking');
    window.setTimeout(function () {
      door.classList.remove('is-shaking');
    }, SHAKE_MS);
    const message = document.getElementById('door-message');
    if (message) {
      message.textContent = 'Opens on December ' + door.dataset.day;
      message.hidden = false;
      window.clearTimeout(messageTimer);
      messageTimer = window.setTimeout(function () {
        message.hidden = true;
      }, MESSAGE_MS);
    }
  }

  // Turn a published door, remember it, then go to its page.
  function openDoor(door, event) {
    const day = Number(door.dataset.day);
    remember(day);
    // A modified or middle click opens a new tab; let the browser do it.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    // Already open, or no motion: the link goes at once.
    if (door.classList.contains('is-open') || reducedMotion()) {
      return;
    }
    event.preventDefault();
    if (door.classList.contains('is-opening')) {
      return;
    }
    door.classList.add('is-opening');
    const href = door.href;
    window.setTimeout(function () {
      window.location.assign(href);
    }, TURN_MS);
  }

  function bindDoors() {
    for (const door of all('.door')) {
      if (door.classList.contains('is-locked')) {
        door.addEventListener('click', function () {
          shake(door);
        });
        // A locked door is a button for the keyboard: Enter and Space press it.
        door.addEventListener('keydown', function (event) {
          // A held key repeats, and a shortcut with Ctrl, Alt or Cmd is not a press.
          if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) {
            return;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            // Space would otherwise scroll the page.
            event.preventDefault();
            shake(door);
          }
        });
        door.addEventListener('animationend', function (event) {
          if (event.target === door) {
            door.classList.remove('is-shaking');
          }
        });
      } else {
        door.addEventListener('click', function (event) {
          openDoor(door, event);
        });
      }
    }
  }

  // Typeset each formula. Without KaTeX the TeX source stays on the page.
  function typeset() {
    const katex = window.katex;
    if (!katex) {
      return;
    }
    for (const element of all('span.math.inline, div.math.block')) {
      const tex = element.textContent;
      try {
        katex.render(tex, element, {
          displayMode: element.classList.contains('block'),
          throwOnError: false,
        });
      } catch (error) {
        element.textContent = tex;
        warn('a formula did not typeset, its source is shown', error);
      }
    }
  }

  function startSnow() {
    const canvas = document.getElementById('snow');
    if (!canvas || reducedMotion()) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    const ratio = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    function size() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    size();
    const flakes = [];
    for (let index = 0; index < SNOWFLAKES; index += 1) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2,
        speed: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function frame() {
      context.clearRect(0, 0, width, height);
      if (reducedMotion()) {
        return;
      }
      context.fillStyle = 'rgba(255, 255, 255, 0.9)';
      for (const flake of flakes) {
        flake.y += flake.speed;
        flake.phase += 0.01;
        flake.x += Math.sin(flake.phase) * 0.3;
        if (flake.y > height) {
          flake.y = -flake.radius;
          flake.x = Math.random() * width;
        }
        if (flake.x < 0 || flake.x > width) {
          flake.x = Math.random() * width;
        }
        context.beginPath();
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        context.fill();
      }
      window.requestAnimationFrame(frame);
    }

    window.addEventListener('resize', size);
    window.requestAnimationFrame(frame);
  }

  // Replace the preview of a scene with the scene in a sandboxed frame.
  function loadScene(button) {
    const scene = button.closest('.scene');
    if (!scene || scene.dataset.src === undefined) {
      warn('scene button has no scene file, not loaded');
      return;
    }
    const frame = document.createElement('iframe');
    frame.className = 'scene-frame';
    frame.setAttribute('sandbox', 'allow-scripts');
    // The frame takes the accessible name of the preview it replaces.
    const preview = scene.querySelector('.scene-preview');
    frame.setAttribute('title', preview ? preview.alt : '3D scene');
    frame.setAttribute('src', scene.dataset.src);
    scene.textContent = '';
    scene.appendChild(frame);
  }

  function bindScenes() {
    for (const button of all('.scene-load')) {
      button.addEventListener('click', function () {
        loadScene(button);
      });
    }
  }

  // A page restored from the back-forward cache keeps its turning doors.
  function restore() {
    for (const door of all('.is-opening')) {
      door.classList.remove('is-opening');
    }
    showOpenDoors();
  }

  run('day memory', rememberDay);
  run('door memory', showOpenDoors);
  run('doors', bindDoors);
  run('countdown', startCountdown);
  run('end check', watchEnd);
  run('snow', startSnow);
  run('formulas', typeset);
  run('scenes', bindScenes);
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      run('restored page', restore);
    }
  });
})();
