// Hình vẽ SVG: linh vật Cú Thông Thái và cảnh nền
const NS = 'http://www.w3.org/2000/svg';
const svg = markup => {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstChild;
};

// Cú Thông Thái đội mũ tốt nghiệp, biết chớp mắt và vẫy cánh
export function owl(cls = '') {
  return svg(`
<svg class="owl ${cls}" viewBox="0 0 120 132" xmlns="${NS}" aria-hidden="true">
  <ellipse cx="60" cy="128" rx="30" ry="4" fill="rgba(0,0,0,.12)"/>
  <g class="owl-wing owl-wing-l"><ellipse cx="20" cy="88" rx="11" ry="24" fill="#6A3DB8" transform="rotate(18 20 88)"/></g>
  <g class="owl-wing owl-wing-r"><ellipse cx="100" cy="88" rx="11" ry="24" fill="#6A3DB8" transform="rotate(-18 100 88)"/></g>
  <ellipse cx="60" cy="82" rx="42" ry="44" fill="#8E5BD8"/>
  <ellipse cx="60" cy="98" rx="27" ry="26" fill="#EBDDFF"/>
  <path d="M48 92 q3 4 6 0 M60 92 q3 4 6 0 M54 102 q3 4 6 0 M66 102 q3 4 6 0 M48 112 q3 4 6 0 M60 112 q3 4 6 0" stroke="#B79CE8" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="41" cy="68" r="17" fill="#fff" stroke="#5A2EA6" stroke-width="3"/>
  <circle cx="79" cy="68" r="17" fill="#fff" stroke="#5A2EA6" stroke-width="3"/>
  <g class="owl-eyes">
    <circle cx="43" cy="70" r="8.5" fill="#2B2D42"/><circle cx="81" cy="70" r="8.5" fill="#2B2D42"/>
    <circle cx="46" cy="66.5" r="3" fill="#fff"/><circle cx="84" cy="66.5" r="3" fill="#fff"/>
  </g>
  <g class="owl-lids"><ellipse cx="41" cy="68" rx="18" ry="18" fill="#8E5BD8"/><ellipse cx="79" cy="68" rx="18" ry="18" fill="#8E5BD8"/></g>
  <circle cx="28" cy="86" r="5" fill="#FF8FAB" opacity=".55"/><circle cx="92" cy="86" r="5" fill="#FF8FAB" opacity=".55"/>
  <path d="M53 80 L67 80 L60 91 Z" fill="#FFB703" stroke="#E08E00" stroke-width="1.5" stroke-linejoin="round"/>
  <ellipse cx="48" cy="125" rx="8" ry="4" fill="#FFB703"/><ellipse cx="72" cy="125" rx="8" ry="4" fill="#FFB703"/>
  <g class="owl-cap">
    <rect x="38" y="30" width="44" height="14" rx="4" fill="#2B2D42"/>
    <polygon points="60,10 110,26 60,42 10,26" fill="#3A3D5C"/>
    <polygon points="60,10 110,26 60,30 10,26" fill="#4A4E73"/>
    <circle cx="60" cy="26" r="3.5" fill="#FFD166"/>
    <path class="owl-tassel" d="M60 26 Q88 30 98 34 L98 50" stroke="#FFD166" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="98" cy="53" r="4.5" fill="#FFD166"/>
  </g>
</svg>`);
}

// Cảnh nền: mặt trời, mây trôi, đồi, các hình nhỏ bay lơ lửng
export function scene() {
  const s = document.createElement('div');
  s.className = 'scene';
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `
    <div class="sun"></div>
    <div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div><div class="cloud c4"></div>
    ${['⭐', '🎈', '✨', '💖', '🌈', '⭐', '🫧', '✨'].map((e, i) => `<span class="floaty f${i + 1}">${e}</span>`).join('')}
    <svg class="hills" viewBox="0 0 1440 260" preserveAspectRatio="none" xmlns="${NS}">
      <path d="M0 150 C 200 60 380 70 560 140 S 900 220 1100 120 S 1360 60 1440 110 V260 H0 Z" fill="#B8F2C9"/>
      <path d="M0 200 C 240 120 420 150 640 200 S 1000 250 1240 170 S 1400 150 1440 170 V260 H0 Z" fill="#8EE3A8"/>
      <g fill="#6BCB8B"><circle cx="180" cy="196" r="16"/><circle cx="200" cy="190" r="20"/><circle cx="222" cy="198" r="14"/>
        <circle cx="1180" cy="168" r="18"/><circle cx="1204" cy="160" r="22"/><circle cx="1228" cy="170" r="15"/></g>
      <g fill="#FF8FAB"><circle cx="420" cy="214" r="5"/><circle cx="460" cy="222" r="5"/><circle cx="880" cy="232" r="5"/><circle cx="1320" cy="190" r="5"/></g>
      <g fill="#FFD166"><circle cx="440" cy="226" r="5"/><circle cx="900" cy="220" r="5"/><circle cx="1300" cy="200" r="5"/></g>
    </svg>`;
  return s;
}
