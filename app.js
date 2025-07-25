// app.js
const btnContainer = document.getElementById('buttons');
const refreshBtn   = document.getElementById('refresh');
const themeInput   = document.getElementById('theme');
const l1Select     = document.getElementById('l1');
const tlSelect     = document.getElementById('tl');

let seen = new Set();

function showError(message) {
  btnContainer.innerHTML = `<p style="color:red; font-size:1rem;">⚠️ ${message}</p>`;
}

async function fetchWords(theme = '', l1 = '', tl = '') {
  if (!l1 || !tl || l1 === tl) return [];

  const endpoint = `/.netlify/functions/getWords?theme=${encodeURIComponent(theme)}&l1=${encodeURIComponent(l1)}&tl=${encodeURIComponent(tl)}`;
  const res      = await fetch(endpoint);
  const words    = await res.json();
  return words.filter(w => !seen.has(w.tl.toLowerCase()));
}

function render(words) {
  btnContainer.innerHTML = '';

  if (!words || words.length === 0) {
    btnContainer.innerHTML = '<p style="color:red; font-size:1rem;">⚠️ No words found. Try a different theme or language pair.</p>';
    return;
  }

  words.forEach(({ tl, l1 }) => {
    const btn = document.createElement('button');
    btn.className = 'word';
    btn.textContent = tl;
    btn.dataset.tl = tl;
    btn.dataset.l1 = l1;
    btn.onclick = () => toggle(btn);
    btn.onmouseenter = () => hoverSwap(btn, true);
    btn.onmouseleave = () => hoverSwap(btn, false);
    btnContainer.appendChild(btn);
    seen.add(tl.toLowerCase());
  });
}

function toggle(btn) {
  btn.textContent = btn.textContent === btn.dataset.tl ? btn.dataset.l1 : btn.dataset.tl;
}

function hoverSwap(btn, entering) {
  if (window.matchMedia('(hover: hover)').matches) {
    btn.textContent = entering ? btn.dataset.l1 : btn.dataset.tl;
  }
}

async function populate() {
  const theme = themeInput.value.trim();
  const l1    = l1Select.value.trim();
  const tl    = tlSelect.value.trim();

  if (!l1 || !tl) {
    showError("Please select both L1 (Native) and TL (Target) languages.");
    return;
  }

  if (l1 === tl) {
    showError("L1 and TL must be different. Please choose two different languages.");
    return;
  }

  const words = await fetchWords(theme, l1, tl);
  render(words);
}

refreshBtn.addEventListener('click', () => {
  seen.clear();         // 🧽 reset word cache for each request
  populate();           // 🧠 fetch words based on current input
});

