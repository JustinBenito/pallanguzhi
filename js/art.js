/* Hand-built SVG illustrations. Painted botanicals are images in /assets. */
(function () {
  const PZ = (window.PZ = window.PZ || {});
  const INK = '#1E1714';
  const LINE = '#3B2418'; // softer sepia line for Paati

  /* ---------- shared defs ---------- */
  const DEFS = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <linearGradient id="pz-brass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#7A4A0C"/><stop offset=".25" stop-color="#D49A2A"/>
        <stop offset=".45" stop-color="#FFE7A0"/><stop offset=".62" stop-color="#E2AE46"/><stop offset="1" stop-color="#6E420A"/>
      </linearGradient>
      <radialGradient id="pz-gold-dot" cx=".38" cy=".32" r=".7">
        <stop offset="0" stop-color="#FFF4C8"/><stop offset=".45" stop-color="#E2AE46"/><stop offset="1" stop-color="#7A4A0C"/>
      </radialGradient>

      <!-- Paati paints -->
      <radialGradient id="pa-skin" cx=".42" cy=".36" r=".72">
        <stop offset="0" stop-color="#EBB48C"/><stop offset=".65" stop-color="#DC9C72"/><stop offset="1" stop-color="#BF7D54"/>
      </radialGradient>
      <linearGradient id="pa-skin-arm" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#B8744C"/><stop offset=".5" stop-color="#E2A57C"/><stop offset="1" stop-color="#B06E48"/>
      </linearGradient>
      <linearGradient id="pa-hair" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F1EEE8"/><stop offset=".6" stop-color="#DAD4CA"/><stop offset="1" stop-color="#B9B1A4"/>
      </linearGradient>
      <radialGradient id="pa-bun" cx=".4" cy=".35" r=".7">
        <stop offset="0" stop-color="#EEE9E0"/><stop offset="1" stop-color="#ADA598"/>
      </radialGradient>
      <linearGradient id="pa-blouse" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4A5A9C"/><stop offset=".55" stop-color="#36447E"/><stop offset="1" stop-color="#232C58"/>
      </linearGradient>
      <linearGradient id="pa-saree" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFCF3"/><stop offset=".45" stop-color="#F6EEDC"/><stop offset="1" stop-color="#D9CBAE"/>
      </linearGradient>
      <linearGradient id="pa-tumbler" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8C5E1C"/><stop offset=".22" stop-color="#E9C46E"/><stop offset=".35" stop-color="#FFF0BD"/>
        <stop offset=".55" stop-color="#D7A443"/><stop offset="1" stop-color="#6E4510"/>
      </linearGradient>
      <radialGradient id="pa-blush" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#E86A55" stop-opacity=".4"/><stop offset="1" stop-color="#E86A55" stop-opacity="0"/>
      </radialGradient>
      <filter id="pa-paint" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="9" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 .22 .74  0 0 0 .22 .7  0 0 0 .22 .66  0 0 0 0 1" result="g"/>
        <feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/>
        <feBlend in="SourceGraphic" in2="gi" mode="multiply" result="m"/>
        <feComposite in="m" in2="SourceGraphic" operator="in"/>
      </filter>

      <!-- lamp paints -->
      <linearGradient id="lp-shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3A2C24"/><stop offset=".3" stop-color="#2A1F1A"/><stop offset=".75" stop-color="#18110E"/><stop offset="1" stop-color="#0E0907"/>
      </linearGradient>
      <radialGradient id="lp-under" cx=".5" cy=".3" r=".7">
        <stop offset="0" stop-color="#FFF6D6"/><stop offset=".55" stop-color="#F6C86E"/><stop offset="1" stop-color="#B9782A"/>
      </radialGradient>
      <linearGradient id="lp-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFE3A3" stop-opacity=".34"/><stop offset=".6" stop-color="#FFD58A" stop-opacity=".08"/><stop offset="1" stop-color="#FFD58A" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="pz-glow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset=".45" stop-color="#FFB547" stop-opacity=".16"/>
        <stop offset="1" stop-color="#FFB547" stop-opacity="0"/>
      </radialGradient>

      <!-- board icon -->
      <linearGradient id="bi-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8A4022"/><stop offset=".45" stop-color="#6A2D16"/><stop offset="1" stop-color="#46190B"/>
      </linearGradient>
      <radialGradient id="bi-pit" cx=".5" cy=".38" r=".6">
        <stop offset="0" stop-color="#140602"/><stop offset=".7" stop-color="#2E1208"/><stop offset="1" stop-color="#4E2010"/>
      </radialGradient>
      <radialGradient id="bi-seed" cx=".35" cy=".3" r=".7">
        <stop offset="0" stop-color="#FF9B7C"/><stop offset=".4" stop-color="#D8321F"/><stop offset="1" stop-color="#5C0805"/>
      </radialGradient>
      <filter id="pz-frame-grain">
        <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="2"/>
        <feColorMatrix values="0 0 0 0 .35  0 0 0 0 .2  0 0 0 0 .05  0 0 0 .32 0"/>
        <feComposite in2="SourceGraphic" operator="in"/>
      </filter>
    </defs>
  </svg>`;

  /* ---------- Sheila Paati ---------- */
  // jasmine buds strung along the bun, lying tangent to the curve like a real malli saram
  function malli(cx, cy, r, a0, a1, n) {
    let s = '';
    for (let row = 0; row < 2; row++) {
      const rr = r + row * 5;
      for (let i = 0; i < n - row; i++) {
        const a = a0 + ((a1 - a0) * (i + row * 0.5)) / (n - 1);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        const deg = (a * 180) / Math.PI + 90 + (i % 2 ? 12 : -12);
        s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(0)})">
          <path d="M-5.5 0 C-4 -3 3 -3.2 6 0 C3 3.2 -4 3 -5.5 0Z" fill="#FFFEF7" stroke="#9C8E74" stroke-width=".7"/>
          <path d="M-2 -1 C0 -1.8 3 -1.6 4.5 -.4" stroke="#E6DFC9" stroke-width="1" fill="none"/>
          <path d="M-5.5 0 l-2.2 -.8 M-5.5 0 l-2.2 .8" stroke="#7D9A5A" stroke-width="1"/></g>`;
      }
    }
    return s;
  }

  // point on a cubic bezier, for stringing coins and pearls along a curve
  function bez(p0, p1, p2, p3, t) {
    const m = 1 - t;
    return [0, 1].map((k) => m * m * m * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t * t * t * p3[k]);
  }
  function strung(p0, p1, p2, p3, n, fn) {
    let s = '';
    for (let i = 0; i < n; i++) s += fn(bez(p0, p1, p2, p3, (i + 0.5) / n), i);
    return s;
  }

  function jimikki(x, y) {
    return `<g class="p-jimikki" style="transform-origin:${x}px ${y}px">
      <circle cx="${x}" cy="${y}" r="3.8" fill="url(#pz-gold-dot)" stroke="#5A3608" stroke-width="1"/><circle cx="${x}" cy="${y}" r="1.6" fill="#C2271C"/>
      <path d="M${x} ${y + 3.5} V${y + 6}" stroke="#B8862E" stroke-width="1.4"/>
      <path d="M${x - 7.5} ${y + 15} C${x - 7.5} ${y + 7} ${x - 3} ${y + 5.5} ${x} ${y + 5.5} C${x + 3} ${y + 5.5} ${x + 7.5} ${y + 7} ${x + 7.5} ${y + 15} Z" fill="url(#pz-brass)" stroke="#5A3608" stroke-width="1.1"/>
      <path d="M${x - 6} ${y + 11} H${x + 6}" stroke="#7A4A0C" stroke-width=".8"/>
      <circle cx="${x}" cy="${y + 9}" r="1.3" fill="#C2271C"/>
      ${[-6, -3, 0, 3, 6].map((d) => `<circle cx="${x + d}" cy="${y + 17}" r="1.35" fill="#FFF8EC" stroke="#A89A80" stroke-width=".5"/>`).join('')}
    </g>`;
  }

  function paati() {
    const coin = ([x, y], i) =>
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 2 ? 2.6 : 3.1}" fill="url(#pz-gold-dot)" stroke="#5A3608" stroke-width=".8"/>` +
      (i % 3 === 1 ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.1" fill="#C2271C"/>` : '');
    const pearl = ([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="#FFF8EC" stroke="#A89A80" stroke-width=".4"/>`;
    // bangles wrap the wrist: back arc thin + dark, front arc thick + bright, tilted to the forearm
    const bangle = (y, col, hi) => `<g transform="translate(74 ${y}) rotate(20)">
      <path d="M-11.5 0 A11.5 3.4 0 0 1 11.5 0" stroke="#3A2210" stroke-width="2" fill="none" opacity=".55"/>
      <path d="M-11.5 0 A11.5 3.4 0 0 0 11.5 0" stroke="${col}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M-7 2.4 A11.5 3.4 0 0 0 3 3.3" stroke="${hi}" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>`;

    return `
<svg class="paati" viewBox="0 0 300 340" aria-label="Sheila Paati">
 <g class="p-root" filter="url(#pa-paint)">
  <g class="p-breathe">
   <!-- bun with a double malli saram and a red rose -->
   <g class="p-bun">
     <ellipse cx="203" cy="80" rx="25" ry="23" fill="url(#pa-bun)" stroke="${LINE}" stroke-width="2.2"/>
     <path d="M186 74 C194 62 212 60 222 70 M184 86 C194 76 214 76 224 86 M190 94 C198 88 212 88 218 94" stroke="#9A9184" stroke-width="1.3" fill="none" stroke-linecap="round"/>
     ${malli(203, 80, 25, -0.5, 2.3, 13)}
     <g transform="translate(226 66)"><circle r="6.5" fill="#B4232B" stroke="#5A0E12" stroke-width="1"/><path d="M-3 -1 C-1 -4 3 -3 3 0 C3 3 -1 4 -2 1 C-3 -1 0 -2 1 0" stroke="#6E1016" stroke-width="1" fill="none"/>
       <path d="M4 5 C8 7 10 10 9 13 C6 12 4 9 4 5Z" fill="#4F7A3C"/></g>
   </g>

   <!-- body sits higher so the neck reads short and soft -->
   <g class="p-body" transform="translate(0 -19)">
     <path d="M131 166 C132 180 130 192 126 204 L174 204 C170 192 168 180 169 166 Z" fill="url(#pa-skin)"/>
     <path d="M131 166 C132 180 130 192 126 204 M169 166 C168 180 170 192 174 204" stroke="${LINE}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
     <path d="M150 184 C158 184 164 180 168 174 L169 200 C160 202 154 198 150 184Z" fill="#9A532E" opacity=".35"/>
     <path d="M138 192 C144 195 156 195 162 192" stroke="${LINE}" stroke-width="1" opacity=".4" fill="none"/>

     <!-- indigo silk blouse -->
     <path d="M34 352 C36 292 52 260 82 244 C102 234 118 226 127 200 C134 216 166 216 173 200 C182 226 198 234 218 244 C248 260 262 292 266 352 Z" fill="url(#pa-blouse)" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round"/>
     <path d="M58 270 C64 263 74 258 84 256 M46 304 C50 292 58 282 66 276" stroke="#151B3A" stroke-width="1.4" opacity=".55" fill="none" stroke-linecap="round"/>
     <path d="M127 200 C134 216 166 216 173 200" stroke="#E2AE46" stroke-width="2.2" fill="none"/>

     <!-- cream silk pallu with copper-gold border -->
     <path d="M173 200 C180 222 198 234 222 246 C250 262 262 298 266 352 L86 352 C112 318 138 284 154 256 C164 238 170 220 173 200 Z" fill="url(#pa-saree)" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round"/>
     <g fill="none" stroke-linecap="round">
       <path d="M184 226 C196 262 206 300 210 352" stroke="#B3A07E" stroke-width="1.6" opacity=".7"/>
       <path d="M198 236 C214 270 226 304 230 352" stroke="#B3A07E" stroke-width="1.4" opacity=".6"/>
       <path d="M214 244 C232 276 244 306 248 352" stroke="#B3A07E" stroke-width="1.2" opacity=".55"/>
       <path d="M190 232 C202 266 212 302 216 352" stroke="#FFFFFF" stroke-width="2.2" opacity=".7"/>
       <path d="M226 252 C246 270 258 300 260 340" stroke="#8C7856" stroke-width="12" opacity=".16"/>
       <path d="M162 300 C176 290 196 288 214 296" stroke="#B3A07E" stroke-width="1.2" opacity=".5"/>
     </g>
     <g class="p-zari">
       <path d="M98 352 C124 316 150 282 164 254 C172 238 177 222 179 206" stroke="${LINE}" stroke-width="17" fill="none"/>
       <path d="M98 352 C124 316 150 282 164 254 C172 238 177 222 179 206" stroke="#A3562A" stroke-width="14" fill="none"/>
       <path d="M98 352 C124 316 150 282 164 254 C172 238 177 222 179 206" stroke="#E6B85A" stroke-width="1.6" fill="none" transform="translate(-5 -1.5)"/>
       <path d="M98 352 C124 316 150 282 164 254 C172 238 177 222 179 206" stroke="#E6B85A" stroke-width="1.6" fill="none" transform="translate(5 2)"/>
       <path d="M98 352 C124 316 150 282 164 254 C172 238 177 222 179 206" stroke="#F3D489" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round" fill="none"/>
       <path d="M98 352 C124 316 150 282 164 254 C172 238 177 222 179 206" stroke="#6E2E12" stroke-width="1" stroke-dasharray="4 3" fill="none" transform="translate(2.2 .8)" opacity=".7"/>
     </g>

     <!-- kasu malai choker + long haaram with a ruby pendant -->
     ${strung([126, 204], [132, 226], [168, 226], [174, 204], 16, pearl)}
     <path d="M128 202 C134 218 166 218 172 202" stroke="#8C5E1C" stroke-width="1" fill="none"/>
     ${strung([128, 202], [134, 218], [166, 218], [172, 202], 11, coin)}
     <path d="M124 206 C128 262 172 262 176 206" stroke="#7A4A0C" stroke-width="3" fill="none"/>
     <path d="M124 206 C128 262 172 262 176 206" stroke="#F1CF7A" stroke-width="1.6" stroke-dasharray="2.4 1.4" fill="none"/>
     <g transform="translate(150 250)">
       <path d="M0 -6 C7 -6 10 0 10 5 C10 12 4 16 0 18 C-4 16 -10 12 -10 5 C-10 0 -7 -6 0 -6Z" fill="url(#pz-brass)" stroke="#5A3608" stroke-width="1.2"/>
       <ellipse cy="5" rx="5" ry="6" fill="#B01E26" stroke="#5A0E12" stroke-width="1"/><ellipse cx="-1.6" cy="2.6" rx="1.4" ry="2" fill="#FF8E8E" opacity=".8"/>
       ${[-8, -4, 0, 4, 8].map((d) => `<circle cx="${d}" cy="${19 - Math.abs(d) * 0.4}" r="1.5" fill="#FFF8EC" stroke="#A89A80" stroke-width=".4"/>`).join('')}
     </g>

     <!-- coffee arm -->
     <g class="p-coffee">
       <g class="p-steam" fill="none" stroke="#FFF6E2" stroke-width="2.2" stroke-linecap="round" opacity=".8">
         <path d="M80 214 c-7 -9 7 -16 0 -27 c-7 -11 5 -16 2 -25"/>
         <path d="M90 210 c-7 -9 7 -16 0 -27 c-5 -9 5 -14 2 -21"/>
         <path d="M99 214 c-6 -8 6 -15 0 -25"/>
       </g>
       <path d="M28 352 C32 324 42 302 54 290 L82 300 C72 314 66 330 64 352 Z" fill="url(#pa-blouse)" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
       <path d="M40 318 C48 314 58 314 68 318" stroke="#E2AE46" stroke-width="2.2" fill="none"/>
       <path d="M46 352 C50 322 58 302 66 288 L86 288 C80 304 74 326 72 352 Z" fill="url(#pa-skin-arm)" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
       <!-- tumbler -->
       <path d="M70 226 L104 226 L99 286 L75 286 Z" fill="url(#pa-tumbler)" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
       <ellipse cx="87" cy="226" rx="17.5" ry="4.6" fill="#E9C46E" stroke="${LINE}" stroke-width="2.2"/>
       <ellipse cx="87" cy="226.6" rx="13.5" ry="3" fill="#A87A4E"/>
       <ellipse cx="85" cy="226" rx="7" ry="1.2" fill="#E8C9A3" opacity=".8"/>
       <path d="M74 236 L100 236 M75 244 L100 244" stroke="#7A4A0C" stroke-width="1" opacity=".55"/>
       <path d="M79 230 L77 282" stroke="#FFF6D6" stroke-width="2.4" opacity=".7" stroke-linecap="round"/>
       <!-- hand -->
       <path d="M64 290 C60 276 64 262 74 258 L80 296 Z" fill="url(#pa-skin-arm)" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>
       <g fill="url(#pa-skin-arm)" stroke="${LINE}" stroke-width="2" stroke-linejoin="round">
         <path d="M70 254 C80 250 96 251 102 254 C106 256 106 262 101 263 C94 263 80 262 72 263 Z"/>
         <path d="M70 263 C80 260 96 261 103 264 C107 266 106 272 101 272 C94 272 80 271 72 272 Z"/>
         <path d="M70 272 C80 270 95 270 101 273 C105 275 104 281 99 281 C92 281 80 280 72 281 Z"/>
         <path d="M70 281 C80 279 92 280 97 282 C101 284 100 289 96 289 C90 289 80 289 72 289 Z"/>
       </g>
       <path d="M98 256 l2 -1 M99 265 l2 -1 M97 274 l2 -1" stroke="#B88A6A" stroke-width="1.2" stroke-linecap="round"/>
       <path d="M66 258 C62 248 66 238 74 240 C78 242 78 250 76 256" fill="url(#pa-skin-arm)" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
       <circle cx="72" cy="244" r="2.4" fill="url(#pz-gold-dot)" stroke="#5A3608" stroke-width=".7"/>
       <!-- wrist bangles: gold, red glass, gold, green glass -->
       ${bangle(294, '#E2AE46', '#FFF1C0')}${bangle(299.5, '#B01E26', '#FF8E8E')}${bangle(305, '#E2AE46', '#FFF1C0')}${bangle(310.5, '#2F7A4A', '#9BE0B0')}
     </g>
   </g>

   <!-- head -->
   <g class="p-head">
     <g fill="url(#pa-skin)" stroke="${LINE}" stroke-width="2.2">
       <path d="M104 116 C93 112 91 132 97 142 C100 148 105 148 107 144"/>
       <path d="M196 116 C207 112 209 132 203 142 C200 148 195 148 193 144"/>
     </g>
     <path d="M97 124 C95 130 96 136 99 140 M203 124 C205 130 204 136 201 140" stroke="${LINE}" stroke-width="1.2" opacity=".5" fill="none"/>
     <path d="M150 64 C181 64 198 90 198 121 C198 148 191 168 177 180 C168 188 160 191 150 191 C140 191 132 188 123 180 C109 168 102 148 102 121 C102 90 119 64 150 64 Z" fill="url(#pa-skin)" stroke="${LINE}" stroke-width="2.6"/>
     <path d="M182 92 C195 112 195 150 180 173 C174 180 167 186 160 189 C175 172 184 150 184 124 C184 110 184 100 182 92Z" fill="#9A532E" opacity=".28"/>
     <path d="M118 94 C126 88 140 86 150 86 C138 90 128 96 122 104Z" fill="#FFE0C4" opacity=".35"/>
     <ellipse class="p-cheek" cx="119" cy="148" rx="15" ry="11" fill="url(#pa-blush)"/>
     <ellipse class="p-cheek" cx="181" cy="148" rx="15" ry="11" fill="url(#pa-blush)"/>
     <!-- hair -->
     <path d="M96 128 C90 84 116 56 150 56 C184 56 210 84 204 128 C200 110 192 98 180 92 C170 87 160 86 150 88 C140 86 130 87 120 92 C108 98 100 110 96 128 Z" fill="url(#pa-hair)" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
     <g stroke="#9A9184" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".9">
       <path d="M146 60 C130 64 112 78 104 104"/><path d="M144 66 C128 72 114 86 108 106"/><path d="M140 74 C126 80 116 92 112 104"/>
       <path d="M154 60 C170 64 188 78 196 104"/><path d="M156 66 C172 72 186 86 192 106"/><path d="M160 74 C174 80 184 92 188 104"/>
     </g>
     <path d="M150 57 C149 66 150 78 150 88" stroke="#C2271C" stroke-width="2.6" stroke-linecap="round"/>
     <!-- vibhuti + kumkum -->
     <path d="M136 97 C144 95 156 95 164 97 M138 100.5 C145 99 155 99 162 100.5" stroke="#F4EEE2" stroke-width="1.6" opacity=".8" fill="none" stroke-linecap="round"/>
     <circle cx="150" cy="105" r="4.8" fill="#C2271C"/>
     <circle cx="148.8" cy="103.8" r="1.2" fill="#F07A5E" opacity=".8"/>
     <!-- brows -->
     <g class="p-brows" stroke="#C9C1B4" stroke-width="2.8" stroke-linecap="round" fill="none">
       <path class="b-l" d="M115 103 C121 99 130 98 138 101"/><path class="b-r" d="M162 101 C170 98 179 99 185 103"/>
     </g>
     <!-- eye sets -->
     <g class="p-eyes">
       <g class="e e-normal"><g class="blink">
         <path d="M119 116 C123 111 133 111 137 116" stroke="${LINE}" stroke-width="2" fill="none" stroke-linecap="round"/>
         <path d="M163 116 C167 111 177 111 181 116" stroke="${LINE}" stroke-width="2" fill="none" stroke-linecap="round"/>
         <ellipse cx="128" cy="118.5" rx="3.9" ry="4.3" fill="#1A0E08"/><ellipse cx="172" cy="118.5" rx="3.9" ry="4.3" fill="#1A0E08"/>
         <circle cx="129.5" cy="117" r="1.3" fill="#fff"/><circle cx="173.5" cy="117" r="1.3" fill="#fff"/>
         <circle cx="126.8" cy="120" r=".6" fill="#fff" opacity=".7"/><circle cx="170.8" cy="120" r=".6" fill="#fff" opacity=".7"/>
       </g></g>
       <g class="e e-happy" stroke="#1A0E08" stroke-width="2.6" fill="none" stroke-linecap="round">
         <path d="M119 121 C123 112 133 112 137 121"/><path d="M163 121 C167 112 177 112 181 121"/>
         <path d="M117 125 l-3 2 M183 125 l3 2" stroke-width="1.4" opacity=".6"/>
       </g>
       <g class="e e-think">
         <path d="M119 115 C123 110 133 110 137 115 M163 115 C167 110 177 110 181 115" stroke="${LINE}" stroke-width="2" fill="none" stroke-linecap="round"/>
         <ellipse cx="124.5" cy="114" rx="3.6" ry="4" fill="#1A0E08"/><ellipse cx="168.5" cy="114" rx="3.6" ry="4" fill="#1A0E08"/>
         <circle cx="125.6" cy="112.6" r="1" fill="#fff"/><circle cx="169.6" cy="112.6" r="1" fill="#fff"/>
       </g>
       <g class="e e-wide">
         <ellipse cx="128" cy="118" rx="6.4" ry="7" fill="#FFF8EC" stroke="${LINE}" stroke-width="1.6"/><ellipse cx="172" cy="118" rx="6.4" ry="7" fill="#FFF8EC" stroke="${LINE}" stroke-width="1.6"/>
         <circle cx="128" cy="118" r="2.7" fill="#1A0E08"/><circle cx="172" cy="118" r="2.7" fill="#1A0E08"/>
         <circle cx="129" cy="117" r=".9" fill="#fff"/><circle cx="173" cy="117" r=".9" fill="#fff"/>
       </g>
       <g class="e e-smug" stroke="#1A0E08" stroke-width="2.3" fill="none" stroke-linecap="round">
         <path d="M120 118 C125 116 131 116 136 118"/><path d="M164 117 C169 114 175 114 180 117"/>
         <path d="M122 119.5 C126 122 130 122 134 119.5" stroke-width="1.2" opacity=".6"/>
         <ellipse cx="172" cy="119.4" rx="3" ry="2" fill="#1A0E08" stroke="none"/>
       </g>
     </g>
     <!-- age lines -->
     <g stroke="#2E1A10" stroke-width="1.1" opacity=".45" fill="none" stroke-linecap="round">
       <path d="M121 129 C126 132 132 132 136 129"/><path d="M164 129 C168 132 174 132 179 129"/>
       <path d="M108 116 l-4 -2 M108 121 l-5 0 M192 116 l4 -2 M192 121 l5 0"/>
       <path d="M136 146 C130 154 131 164 136 170"/><path d="M164 146 C170 154 169 164 164 170"/>
       <path d="M142 183 C147 185 153 185 158 183"/>
     </g>
     <!-- nose + mookuthi with a ruby -->
     <path d="M148 118 C147 128 144 136 141 142" stroke="${LINE}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".75"/>
     <path d="M140 143 C142 149 147 149 150 147 C153 149 158 149 160 143" stroke="${LINE}" stroke-width="2" fill="none" stroke-linecap="round"/>
     <path d="M144 146 C146 147 148 147 149 146 M151 146 C152 147 154 147 156 146" stroke="#2E1408" stroke-width="1.6" stroke-linecap="round"/>
     <g class="p-mookuthi">
       ${[0, 1, 2, 3, 4, 5].map((k) => `<circle cx="${(159 + Math.cos(k * 1.047) * 2.6).toFixed(1)}" cy="${(143 + Math.sin(k * 1.047) * 2.6).toFixed(1)}" r="1.3" fill="url(#pz-gold-dot)"/>`).join('')}
       <circle cx="159" cy="143" r="1.7" fill="#C2271C"/><circle cx="158.4" cy="142.4" r=".6" fill="#fff"/>
     </g>
     <!-- mouths -->
     <g class="p-mouth">
       <g class="m m-smile"><path d="M136 160 C142 167 158 167 164 160" stroke="#24120A" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M142 166 C147 168 153 168 158 166" stroke="#7A3424" stroke-width="1.3" fill="none" opacity=".7"/></g>
       <path class="m m-talk" d="M139 158 C145 156 155 156 161 158 C160 168 155 171 150 171 C145 171 140 168 139 158Z" fill="#4A120C" stroke="${LINE}" stroke-width="2"/>
       <g class="m m-laugh"><path d="M131 155 C141 158 159 158 169 155 C167 174 159 181 150 181 C141 181 133 174 131 155Z" fill="#4A120C" stroke="${LINE}" stroke-width="2"/>
         <path d="M135 157 C145 160 155 160 165 157 L164 162 C155 163 145 163 136 162Z" fill="#FFF7E8"/><path d="M142 175 C146 171 154 171 158 175" stroke="#C4472F" stroke-width="4" fill="none" stroke-linecap="round"/></g>
       <path class="m m-smug" d="M138 163 C146 167 156 165 165 155" stroke="#24120A" stroke-width="2.4" fill="none" stroke-linecap="round"/>
       <g class="m m-o"><ellipse cx="150" cy="164" rx="5.4" ry="7" fill="#4A120C" stroke="${LINE}" stroke-width="2"/></g>
     </g>
     <!-- specs -->
     <g class="p-specs">
       <rect x="111" y="105" width="35" height="27" rx="10" fill="#FFF7E8" fill-opacity=".12" stroke="#2E1A10" stroke-width="2.4"/>
       <rect x="154" y="105" width="35" height="27" rx="10" fill="#FFF7E8" fill-opacity=".12" stroke="#2E1A10" stroke-width="2.4"/>
       <path d="M146 115 C148 112 152 112 154 115 M111 113 L100 117 M189 113 L200 117" stroke="#2E1A10" stroke-width="2.2" fill="none" stroke-linecap="round"/>
       <path d="M117 110 l7 -2 M160 110 l7 -2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>
     </g>
     ${jimikki(100, 148)}${jimikki(200, 148)}
     <!-- emotion accents -->
     <g class="p-fx">
       <g class="fx fx-happy" stroke="#FFE7A0" stroke-width="2.6" stroke-linecap="round" fill="none">
         <path d="M86 84 l-10 -8"/><path d="M80 100 l-13 -3"/><path d="M214 84 l10 -8"/><path d="M220 100 l13 -3"/>
       </g>
       <g class="fx fx-shock">
         <path d="M210 98 C214 106 218 110 214 115 C210 118 205 115 206 110 C206 106 208 102 210 98Z" fill="#BFE3F2" stroke="#2E5A70" stroke-width="1.2"/>
         <g stroke="#FFE7A0" stroke-width="3" stroke-linecap="round"><path d="M150 30 v12"/><path d="M128 36 l5 9"/><path d="M172 36 l-5 9"/></g>
       </g>
       <g class="fx fx-think" fill="#FFF7E8" stroke="${LINE}" stroke-width="1.2">
         <circle cx="214" cy="54" r="3"/><circle cx="224" cy="40" r="4.5"/><circle cx="238" cy="24" r="6.5"/>
       </g>
       <g class="fx fx-smug" fill="#FFE7A0">
         <path d="M196 96 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2z"/><path d="M210 112 l1.2 -3.6 l1.2 3.6 l3.6 1.2 l-3.6 1.2 l-1.2 3.6 l-1.2 -3.6 l-3.6 -1.2z"/>
       </g>
       <g class="fx fx-sad">
         <path d="M120 134 C122 140 124 143 121 146 C118 148 115 145 116 142 C117 139 118 137 120 134Z" fill="#BFE3F2" stroke="#2E5A70" stroke-width="1"/>
       </g>
     </g>
   </g>
  </g>
 </g>
</svg>`;
  }

  /* ---------- woodcut dome pendant lamp, layered ---------- */
  function lamp(drop = 60) {
    const d = drop, top = d + 14, rim = d + 70;
    let engr = '';
    for (let k = 0; k < 9; k++) {
      const y = top + 8 + k * 6.2;
      const w = 22 + Math.sqrt(k + 1) * 9.6;
      engr += `<path d="M${80 - w} ${y.toFixed(1)} Q80 ${(y - 3.5).toFixed(1)} ${80 + w} ${y.toFixed(1)}" stroke="${k % 3 ? '#E7A33A' : '#000'}" stroke-opacity="${k % 3 ? 0.16 : 0.5}" stroke-width="${k % 3 ? 1 : 1.6}" fill="none"/>`;
    }
    return `
<svg class="lamp" viewBox="0 0 160 ${rim + 200}" aria-hidden="true">
  <path class="lamp-cone" d="M34 ${rim} L-40 ${rim + 200} L200 ${rim + 200} L126 ${rim}Z" fill="url(#lp-cone)"/>
  <ellipse class="lamp-glow" cx="80" cy="${rim + 18}" rx="86" ry="56" fill="url(#pz-glow)"/>
  <rect x="68" y="0" width="24" height="7" rx="2" fill="url(#pz-brass)" stroke="${INK}" stroke-width="1.6"/>
  <g class="lamp-swing" style="transform-origin:80px 6px">
    <path d="M79 6 C77 ${d * 0.3} 81 ${d * 0.6} 79 ${d}" stroke="${INK}" stroke-width="2.6" fill="none"/>
    <path d="M81 6 C83 ${d * 0.3} 79 ${d * 0.6} 81 ${d}" stroke="#5A4232" stroke-width="1.1" fill="none" stroke-dasharray="3 3"/>
    <rect x="72" y="${d - 2}" width="16" height="9" rx="2" fill="url(#pz-brass)" stroke="${INK}" stroke-width="1.6"/>
    <path d="M70 ${d + 7} L90 ${d + 7} L94 ${top + 2} L66 ${top + 2}Z" fill="url(#pz-brass)" stroke="${INK}" stroke-width="1.6"/>
    <path d="M71 ${d + 10} L89 ${d + 10}" stroke="#6E420A" stroke-width="1"/>
    <path d="M24 ${rim} C24 ${top + 18} 48 ${top} 80 ${top} C112 ${top} 136 ${top + 18} 136 ${rim} Z" fill="url(#lp-shade)" stroke="${INK}" stroke-width="2.4"/>
    <clipPath id="lp-clip-${d}"><path d="M24 ${rim} C24 ${top + 18} 48 ${top} 80 ${top} C112 ${top} 136 ${top + 18} 136 ${rim} Z"/></clipPath>
    <g clip-path="url(#lp-clip-${d})">${engr}
      <path d="M36 ${rim - 4} C36 ${top + 26} 52 ${top + 10} 70 ${top + 6}" stroke="#FFF1C4" stroke-opacity=".22" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>
    <ellipse cx="80" cy="${rim}" rx="56" ry="9" fill="url(#lp-under)" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="80" cy="${rim}" rx="56" ry="9" fill="none" stroke="url(#pz-brass)" stroke-width="3"/>
    <ellipse class="lamp-bulb" cx="80" cy="${rim + 3}" rx="13" ry="7" fill="#FFF8E0"/>
  </g>
</svg>`;
  }

  /* ---------- wavy stamp frame with dots in the valleys ---------- */
  function frame(W = 1280, H = 720, inset = 24, A = 5.5, P = 44) {
    const pts = [];
    const dots = [];
    const side = (x0, y0, x1, y1, ox, oy) => {
      const len = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.max(2, Math.round(len / P));
      const p = len / n;
      const ux = (x1 - x0) / len, uy = (y1 - y0) / len;
      for (let t = 0; t < len; t += 1.5) {
        const w = Math.cos((2 * Math.PI * t) / p) * A;
        pts.push([x0 + ux * t + ox * w, y0 + uy * t + oy * w]);
      }
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) * p;
        dots.push([x0 + ux * t + ox * (A + 5), y0 + uy * t + oy * (A + 5)]);
      }
    };
    const a = inset, b = W - inset, c = H - inset;
    side(a, a, b, a, 0, -1);
    side(b, a, b, c, 1, 0);
    side(b, c, a, c, 0, 1);
    side(a, c, a, a, -1, 0);
    const wave = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
    const outer = `M0 0H${W}V${H}H0Z`;
    return `<svg class="frame" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <path d="${outer} ${wave}" fill-rule="evenodd" fill="#E7A33A"/>
      <path d="${outer} ${wave}" fill-rule="evenodd" fill="#E7A33A" filter="url(#pz-frame-grain)"/>
      <path d="${wave}" fill="none" stroke="#4A2616" stroke-width="3.2" stroke-linejoin="round"/>
      <g fill="#4A2616">${dots.map((d) => `<circle cx="${d[0].toFixed(1)}" cy="${d[1].toFixed(1)}" r="4.3"/>`).join('')}</g>
    </svg>`;
  }

  /* ---------- a proper little carved board for the "Learn" card ---------- */
  function boardIcon() {
    let pits = '';
    const seedsIn = [3, 1, 2, 0, 2, 3, 1, 2, 0, 1, 3, 2, 1, 2];
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 7; c++) {
        const x = 48 + c * 17.4 + (c > 3 ? 4 : 0), y = r ? 60 : 34;
        pits += `<circle cx="${x}" cy="${y}" r="7.6" fill="#7B3A1E"/><circle cx="${x}" cy="${y}" r="6.6" fill="url(#bi-pit)"/>
                 <path d="M${x - 5.6} ${y + 2.6} A6.6 6.6 0 0 0 ${x + 5.6} ${y + 2.6}" stroke="#FFC9A0" stroke-opacity=".22" stroke-width="1" fill="none"/>`;
        const n = seedsIn[r * 7 + c];
        for (let k = 0; k < n; k++) {
          const a = k * 2.4 + c, rr = n > 1 ? 2.3 : 0;
          pits += `<circle cx="${(x + Math.cos(a) * rr).toFixed(1)}" cy="${(y + Math.sin(a) * rr).toFixed(1)}" r="1.9" fill="url(#bi-seed)"/>`;
        }
      }
    let grain = '';
    for (let k = 0; k < 9; k++) {
      const y = 16 + k * 7.6;
      grain += `<path d="M10 ${y} C50 ${y - 3 + (k % 3)} 90 ${y + 3} 130 ${y - 1} S180 ${y + 2} 196 ${y}" stroke="#2A0E04" stroke-opacity="${0.16 + (k % 2) * 0.08}" stroke-width="${k % 3 ? 0.8 : 1.4}" fill="none"/>`;
    }
    return `<svg viewBox="0 0 206 94" class="board-icon" aria-hidden="true">
      <ellipse cx="103" cy="86" rx="92" ry="6" fill="#1E1714" opacity=".22"/>
      <path d="M8 47 C8 22 20 10 40 10 L166 10 C186 10 198 22 198 47 C198 72 186 84 166 84 L40 84 C20 84 8 72 8 47Z" fill="#3A160B"/>
      <path d="M8 44 C8 19 20 7 40 7 L166 7 C186 7 198 19 198 44 C198 69 186 81 166 81 L40 81 C20 81 8 69 8 44Z" fill="url(#bi-wood)" stroke="#1E1714" stroke-width="2.4"/>
      <clipPath id="bi-clip"><path d="M8 44 C8 19 20 7 40 7 L166 7 C186 7 198 19 198 44 C198 69 186 81 166 81 L40 81 C20 81 8 69 8 44Z"/></clipPath>
      <g clip-path="url(#bi-clip)">${grain}<path d="M10 14 C60 9 140 9 196 14" stroke="#FFC9A0" stroke-opacity=".28" stroke-width="2" fill="none"/></g>
      <path d="M15 44 C15 24 25 13 41 13 L165 13 C181 13 191 24 191 44 C191 64 181 75 165 75 L41 75 C25 75 15 64 15 44Z" fill="none" stroke="#FFC9A0" stroke-opacity=".18" stroke-width="1"/>
      <ellipse cx="27" cy="44" rx="9.5" ry="24" fill="#7B3A1E"/><ellipse cx="27" cy="44" rx="8.4" ry="22.6" fill="url(#bi-pit)"/>
      <ellipse cx="179" cy="44" rx="9.5" ry="24" fill="#7B3A1E"/><ellipse cx="179" cy="44" rx="8.4" ry="22.6" fill="url(#bi-pit)"/>
      <circle cx="25" cy="38" r="1.9" fill="url(#bi-seed)"/><circle cx="28" cy="46" r="1.9" fill="url(#bi-seed)"/><circle cx="180" cy="42" r="1.9" fill="url(#bi-seed)"/><circle cx="177" cy="50" r="1.9" fill="url(#bi-seed)"/><circle cx="181" cy="53" r="1.9" fill="url(#bi-seed)"/>
      <rect x="99" y="7" width="8" height="74" fill="url(#pz-brass)" stroke="#1E1714" stroke-width="1.4"/>
      <path d="M103 9 V79" stroke="#6E420A" stroke-width=".8"/>
      <circle cx="103" cy="20" r="2" fill="url(#pz-gold-dot)" stroke="#1E1714" stroke-width=".8"/><circle cx="103" cy="68" r="2" fill="url(#pz-gold-dot)" stroke="#1E1714" stroke-width=".8"/>
      ${pits}
      <path d="M44 47 H96 M110 47 H160" stroke="#E2AE46" stroke-opacity=".55" stroke-width="1"/>
      <g fill="url(#pz-gold-dot)" stroke="#1E1714" stroke-width=".8"><circle cx="20" cy="17" r="2.6"/><circle cx="186" cy="17" r="2.6"/><circle cx="20" cy="71" r="2.6"/><circle cx="186" cy="71" r="2.6"/></g>
    </svg>`;
  }

  /* small kolam rosette for ornament corners */
  function kolam(size = 80, color = '#C8902E') {
    let dots = '';
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++) if (Math.abs(i) + Math.abs(j) <= 2) dots += `<circle cx="${50 + i * 14}" cy="${50 + j * 14}" r="1.8"/>`;
    return `<svg class="kolam" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <g fill="${color}">${dots}</g>
      <g fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round">
        <path d="M50 22 C64 36 64 36 78 50 C64 64 64 64 50 78 C36 64 36 64 22 50 C36 36 36 36 50 22Z"/>
        <circle cx="50" cy="50" r="9"/>
        <path d="M50 36 C58 42 58 42 64 50 C58 58 58 58 50 64 C42 58 42 58 36 50 C42 42 42 42 50 36Z"/>
      </g></svg>`;
  }

  Object.assign(PZ, { art: { DEFS, paati, lamp, frame, boardIcon, kolam } });
})();
