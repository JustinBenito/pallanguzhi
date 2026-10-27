#!/usr/bin/env python3
"""
Builds the static SEO pages for Pallanguzhi: articles, hub, Tamil page, sitemap, robots, OG images.

  python3 scripts/build_pages.py            # pages + sitemap + robots
  python3 scripts/build_pages.py --og       # also re-render OG images (needs a local server on :5173
                                            # and a headless Chromium; see CHROME below)

Edit content here, re-run, commit the generated .html files.
"""
import html, json, os, subprocess, sys, urllib.parse
from datetime import date

SITE = "https://pallanguzhi.vercel.app"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = date.today().isoformat()
PUBLISHED = "2026-10-27"
AUTHOR = "Justin Benito"
CHROME = os.path.expanduser(
    "~/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell")
FONTS = ("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,400..900,100,1"
         "&family=Jost:wght@400;500;600;700&family=Arima:wght@500;700&display=swap")

# ---------------------------------------------------------------- diagrams
def pit_xy(i):
    col = i if i < 7 else 13 - i
    return 130 + col * 63, 152 if i < 7 else 78

def board(pits, hl=None, arrows=(), caption="", alt="", top="Opponent’s row", bottom="Your row"):
    """Inline SVG board diagram. pits: 14 counts (index 0-6 = your row L→R, 7-13 = opponent R→L)."""
    hl = hl or {}
    ring = {"hl": "#F4C46A", "cap": "#7FD48B", "pasu": "#FF9C6E", "empty": "#F3E6CC"}
    out = [f'<svg viewBox="0 0 640 250" role="img" aria-label="{html.escape(alt or caption)}">',
           '<defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a361b"/><stop offset="1" stop-color="#46190b"/></linearGradient>'
           '<radialGradient id="p" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#150602"/><stop offset=".7" stop-color="#2c1108"/><stop offset="1" stop-color="#4c1f0f"/></radialGradient>'
           '<radialGradient id="s" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#ff9b7c"/><stop offset=".4" stop-color="#d8321f"/><stop offset="1" stop-color="#5c0805"/></radialGradient>'
           '<marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="#F4C46A"/></marker></defs>',
           '<rect width="640" height="250" fill="#2a201b"/>',
           '<rect x="22" y="26" width="596" height="178" rx="60" fill="#2a0e05"/>',
           '<rect x="22" y="20" width="596" height="178" rx="60" fill="url(#w)" stroke="#1e1714" stroke-width="3"/>',
           '<ellipse cx="62" cy="115" rx="24" ry="68" fill="url(#p)"/><ellipse cx="578" cy="115" rx="24" ry="68" fill="url(#p)"/>',
           f'<text x="320" y="16" text-anchor="middle" font-family="Jost,sans-serif" font-size="12" letter-spacing="2" fill="#f3e6cc" opacity=".7">{html.escape(top.upper())} ← SOWING</text>',
           f'<text x="320" y="225" text-anchor="middle" font-family="Jost,sans-serif" font-size="12" letter-spacing="2" fill="#f3e6cc" opacity=".7">{html.escape(bottom.upper())} · SOWING →</text>']
    for i, n in enumerate(pits):
        x, y = pit_xy(i)
        c = ring.get(hl.get(i))
        if c:
            out.append(f'<circle cx="{x}" cy="{y}" r="31" fill="none" stroke="{c}" stroke-width="4"/>')
        out.append(f'<circle cx="{x}" cy="{y}" r="25" fill="url(#p)" stroke="#000" stroke-opacity=".3" stroke-width="2"/>')
        k = int(n) if str(n).isdigit() else 0
        for j in range(min(k, 8)):
            import math
            a, r = j * 2.4 + i, (0 if j == 0 else 5 + j * 1.1)
            out.append(f'<circle cx="{x + math.cos(a) * r:.1f}" cy="{y + math.sin(a) * r * .9:.1f}" r="4" fill="url(#s)"/>')
        if n != "":
            by = y - 30 if i >= 7 else y + 30
            out.append(f'<circle cx="{x + 20}" cy="{by}" r="11" fill="{"#e2ac44" if k else "#6b3a22"}" stroke="#1e1714" stroke-width="1.6"/>'
                       f'<text x="{x + 20}" y="{by + 4.5}" text-anchor="middle" font-family="Jost,sans-serif" font-weight="700" font-size="13" fill="{"#1e1714" if k else "#d9b98c"}">{n}</text>')
    for a, b, bend in arrows:
        (x1, y1), (x2, y2) = pit_xy(a), pit_xy(b)
        off1 = 28 if a < 7 else -28
        off2 = 28 if b < 7 else -28
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + (bend if a < 7 and b < 7 else -bend)
        out.append(f'<path d="M{x1} {y1 + off1} Q{mx} {my + off1} {x2} {y2 + off2}" stroke="#F4C46A" stroke-width="2.6" fill="none" stroke-dasharray="5 5" marker-end="url(#ah)"/>')
    out.append('</svg>')
    cap = f"<figcaption>{caption}</figcaption>" if caption else ""
    return f'<figure>{"".join(out)}{cap}</figure>'

def img(src, alt, caption="", w=1280, h=720, eager=False):
    cap = f"<figcaption>{caption}</figcaption>" if caption else ""
    return (f'<figure><img src="{src}" alt="{html.escape(alt)}" width="{w}" height="{h}" '
            f'loading="{"eager" if eager else "lazy"}" decoding="async" />{cap}</figure>')

def cta(text="Learn by playing. Sheila Paati teaches you the rules in two minutes, then tries to beat you.", h="Play Pallanguzhi now, free"):
    return f'''<aside class="cta">
  <img src="/assets/img/sheila-paati.webp" alt="Sheila Paati, the grandmother you play Pallanguzhi against" width="96" height="96" loading="lazy" />
  <div><h3>{h}</h3><p>{text}</p>
  <a class="play-btn" href="/#play">▶ Play vs Sheila Paati</a> &nbsp; <a class="play-btn" href="/#learn" style="background:var(--paper);color:var(--ink)!important">Interactive tutorial</a></div>
</aside>'''

def note(t):
    return f'<div class="note"><p>{t}</p></div>'

def faq_html(faqs):
    return "\n".join(f"<details><summary>{html.escape(q)}</summary><p>{a}</p></details>" for q, a in faqs)

# ---------------------------------------------------------------- content
START = [5] * 14

PAGES = []

PAGES.append(dict(
    slug="how-to-play-pallanguzhi", lang="en", kicker="How to play", nav="How to play",
    title="How to Play Pallanguzhi: Rules, Setup & Scoring (with Diagrams)",
    h1="How to Play Pallanguzhi",
    ta="பல்லாங்குழி விளையாடுவது எப்படி",
    og_title="How to Play Pallanguzhi: Rules & Scoring",
    og_sub="Setup, sowing, relays, captures and pasu, explained with diagrams.",
    description="Learn how to play Pallanguzhi (pallankuzhi), the Tamil mancala game: board setup, sowing, relay moves, captures, the pasu rule and how to win, with clear diagrams.",
    lede="Pallanguzhi is a two-player Tamil mancala game played with 14 pits and a handful of seeds. The rules fit on a postcard, but the game rewards careful counting. Here is everything you need to play your first game in five minutes.",
    alt_lang="ta/pallanguzhi",
    body=lambda: f"""
<nav class="toc" aria-label="Contents"><b>In this guide</b><ol>
<li><a href="#what">What is Pallanguzhi?</a></li><li><a href="#setup">Setting up the board</a></li>
<li><a href="#sowing">Sowing seeds</a></li><li><a href="#relay">Keep going: the relay</a></li>
<li><a href="#capture">Capturing seeds</a></li><li><a href="#pasu">Pasu: the cow rule</a></li>
<li><a href="#end">Ending the game and scoring</a></li><li><a href="#variations">Common variations</a></li>
<li><a href="#faq">FAQ</a></li></ol></nav>

<h2 id="what">What is Pallanguzhi?<span class="ta">பல்லாங்குழி என்றால் என்ன?</span></h2>
<p><strong>Pallanguzhi</strong> (Tamil: <span class="ta">பல்லாங்குழி</span>, also spelled <em>pallankuzhi</em>, <em>pallanguli</em> or <em>pallankuli</em>) is a traditional South Indian board game from Tamil Nadu. It belongs to the <strong>mancala</strong> family of “count and capture” games, where players move seeds around a board of pits and try to collect more seeds than their opponent. The name is usually explained as <em>pala</em> (many) + <em>kuzhi</em> (pit): the game of many pits.</p>
<p>You need two players, a board with <strong>two rows of seven pits</strong>, and <strong>70 seeds</strong> (5 per pit). Traditional players use red <em>manjadi</em> seeds, tamarind seeds (<em>puliyankottai</em>) or cowrie shells (<em>sozhi</em>).</p>
{img("/assets/img/pallanguzhi-game-board.webp", "A Pallanguzhi board with two rows of seven pits, five red manjadi seeds in each pit", "A Pallanguzhi board at the start of a game: 14 kuzhis, 5 seeds each. This is the board you play on in our free online version.", eager=True)}

<h2 id="setup">1. Setting up the board<span class="ta">பலகையை அமைத்தல்</span></h2>
<p>Place the board between the two players. Each player owns the <strong>row of seven pits nearest to them</strong>. Put <strong>5 seeds in every pit</strong>, 70 in total. Captured seeds are kept in a pile beside you, or in the two large store pits at the ends if your board has them.</p>
{board(START, caption="Starting position: 5 seeds in each of the 14 kuzhis.", alt="Pallanguzhi starting position with 5 seeds in every pit")}

<h2 id="sowing">2. Sowing: how a move works<span class="ta">விதைத்தல்</span></h2>
<p>On your turn, choose any <strong>non-empty pit on your own row</strong> and scoop up all of its seeds. Then drop them <strong>one at a time</strong> into the following pits, moving <strong>anticlockwise</strong>: left to right along your row, then right to left along your opponent’s row, and back round to yours.</p>
{board([0,0,3,1,1,1,0, 2,2,2,2,2,2,2], {2:"hl",3:"hl",4:"hl",5:"hl"}, [(2,3,16),(3,4,16),(4,5,16)], "Sowing 3 seeds from the third pit: one each into the next three pits.", "Diagram of sowing three seeds anticlockwise")}
{note("<strong>Tip:</strong> before you pick a pit, count where your last seed will land. That landing spot decides everything that happens next.")}

<h2 id="relay">3. Keep going: the relay<span class="ta">தொடர்ந்து ஆடுதல்</span></h2>
<p>When your last seed drops, look at the <strong>very next pit</strong>. If it contains seeds, <strong>scoop all of them up</strong> and keep sowing from the pit after it. This can chain several times, and a single turn can wind all the way around the board. It is the most exciting part of the game.</p>
{board([0,1,1,4,0,0,0, 2,2,2,2,2,2,2], {2:"hl",3:"hl"}, [(2,3,14),(3,6,24)], "Your last seed lands in the third pit. The next pit holds 4, so you scoop them and carry on.", "Diagram of a relay move in Pallanguzhi")}

<h2 id="capture">4. Capturing seeds<span class="ta">கைப்பற்றுதல்</span></h2>
<p>If the pit right after your last seed is <strong>empty</strong>, your sowing stops. You then <strong>capture every seed in the pit beyond the empty one</strong> and add them to your store. Your turn is over.</p>
<p>If both the next pit and the one after it are empty, you capture nothing and your turn simply ends.</p>
{board([0,0,0,0,0,1,1, 0,7,2,2,2,2,2], {6:"hl",7:"empty",8:"cap"}, [(6,8,40)], "Last seed lands, the next pit is empty, so you capture the 7 seeds just beyond it.", "Diagram of a capture in Pallanguzhi")}

<h2 id="pasu">5. Pasu: the cow rule<span class="ta">பசு</span></h2>
<p>While you are sowing, if any pit reaches <strong>exactly four seeds</strong>, those four are a <strong>pasu</strong> (<span class="ta">பசு</span>, “cow”). They are removed straight away and go to <strong>the player who owns that row</strong>, even if it’s your opponent’s row and your move. So a careless sow can hand your opponent free seeds.</p>
{board([0,0,3,1,3,0,0, 2,1,2,1,2,1,2], {4:"pasu"}, [(2,3,14),(3,4,14)], "Sowing past a pit holding 3 turns it into 4: a pasu for the owner of that row.", "Diagram of the pasu rule in Pallanguzhi")}

<h2 id="end">6. Ending the game and scoring<span class="ta">ஆட்டம் முடிவு</span></h2>
<p>The round ends when it’s a player’s turn and <strong>their row is completely empty</strong>. Any seeds still on the board go to the owner of the row they sit on. Count your store: whoever has <strong>more than 35 of the 70 seeds</strong> wins. 35 each is a draw.</p>
{cta()}

<h2 id="variations">Common variations<span class="ta">வேறுபாடுகள்</span></h2>
<p>Pallanguzhi is a household game, so rules drift from family to family. The most common differences:</p>
<ul>
<li><strong>Seeds per pit:</strong> some families start with 6 or even 12 seeds per pit for longer games.</li>
<li><strong>Multiple rounds:</strong> in the traditional long game, players refill their pits from their winnings at the start of each round. A player who can’t fill every pit leaves the short ones out of play (often called “burnt” pits), and the game continues until one player can’t fill a single pit.</li>
<li><strong>Who gets the pasu:</strong> most players give it to the row’s owner; some give it to the player who is sowing.</li>
<li><strong>Starting pit:</strong> some players begin sowing in the pit they emptied rather than the next one.</li>
</ul>
<p>Our <a href="/">online Pallanguzhi game</a> uses the single-round rules on this page. Read about the game’s names in other languages in <a href="/pallanguzhi-names-and-spellings">Pallankuzhi, Ali Guli Mane, Kuzhipara: every name for Pallanguzhi</a>.</p>

<h2 id="faq">Frequently asked questions</h2>
{faq_html(HOWTO_FAQ)}
""",
    faq=lambda: HOWTO_FAQ,
))

HOWTO_FAQ = [
    ("How many seeds do you need for Pallanguzhi?", "70 seeds: 5 in each of the 14 pits. Some families play with 6 or 12 per pit for a longer game."),
    ("How many players can play Pallanguzhi?", "Pallanguzhi is a two-player game. Each player owns the row of seven pits nearest to them."),
    ("What is pasu in Pallanguzhi?", "Pasu (பசு, “cow”) is the rule that whenever a pit reaches exactly four seeds during sowing, those four seeds go immediately to the owner of that row."),
    ("Which direction do you sow in Pallanguzhi?", "Anticlockwise: left to right along your own row, then right to left along your opponent’s row."),
    ("How do you win Pallanguzhi?", "Collect more seeds than your opponent. With 70 seeds, more than 35 wins. The round ends when the player to move has no seeds on their row."),
    ("Is Pallanguzhi the same as mancala?", "Pallanguzhi is a member of the mancala family, like Oware and Kalah, but it has its own rules, including relay sowing, capturing past an empty pit and the pasu rule."),
    ("Can I play Pallanguzhi online?", "Yes. You can play Pallanguzhi online for free at pallanguzhi.vercel.app against Sheila Paati, an AI grandmother with three difficulty levels and a built-in interactive tutorial."),
]

PAGES.append(dict(
    slug="pallanguzhi-history", lang="en", kicker="History & culture", nav="History",
    title="Pallanguzhi History: The Tamil Mancala Game Played for Generations",
    h1="The History of Pallanguzhi",
    ta="பல்லாங்குழியின் வரலாறு",
    og_title="The History of Pallanguzhi",
    og_sub="Where the Tamil game of many pits comes from, and why it still matters.",
    description="The history and cultural significance of Pallanguzhi, the traditional Tamil mancala board game: its roots, boards, seeds, festivals and the women who kept it alive.",
    lede="Long before screens, Tamil homes had a game of many pits. Pallanguzhi has been passed down from grandmothers to grandchildren for generations, and its story is tied up with festivals, kitchens, courtyards and counting.",
    body=lambda: f"""
{img("/assets/img/pallanguzhi-online-home.webp", "Pallanguzhi online home screen with banana trees, lotus flowers and Sheila Paati", "Pallanguzhi, reimagined for the browser.", eager=True)}

<h2>Part of the world’s oldest game family</h2>
<p>Pallanguzhi is a <strong>mancala</strong> game: a family of “sowing” games played across Africa, the Middle East, South and Southeast Asia. Mancala games are among the oldest board games still played. Carved boards with rows of pits have been found at historic sites in East Africa and the Middle East, and the games travelled along trade routes across the Indian Ocean.</p>
<p>In South India the game settled into a distinctive local form: <strong>two rows of seven pits</strong>, relay sowing, and the unusual <em>pasu</em> rule, where any pit reaching four seeds is claimed by the owner of its row.</p>

<h2>A game of homes and courtyards</h2>
<p>In Tamil Nadu, Pallanguzhi was traditionally a <strong>household game</strong>, played on verandahs (<em>thinnai</em>), in courtyards and on kitchen floors. It is especially associated with <strong>women and girls</strong>, and many people today remember learning it from a grandmother or aunt during long summer afternoons, festival holidays like Pongal, or family gatherings.</p>
<p>Because it needs nothing more than a board and a few dozen seeds, it travelled easily. Families without a board simply scooped fourteen small pits into the ground.</p>

<h2>Boards: from carved wood to brass</h2>
<p>Pallanguzhi boards range from plain wooden planks to heirloom pieces. Wooden boards from regions such as <strong>Chettinad</strong> are often richly carved, and some fold in half on a brass hinge to store the seeds inside. Boards may be shaped like fish or decorated with brass fittings. A finely made board was a valued household object and sometimes part of a bride’s trousseau.</p>
{img("/assets/img/pallanguzhi-board-closeup.webp", "Close-up of a carved wooden Pallanguzhi board with round pits and red manjadi seeds", "Turned, round kuzhis and glossy manjadi seeds.", w=1088, h=264)}

<h2>Seeds: manjadi, tamarind and cowries</h2>
<ul>
<li><strong>Manjadi</strong> (<span class="ta">மஞ்சாடி</span>): the glossy red seeds of the red sandalwood tree, <em>Adenanthera pavonina</em>. They are famously uniform in size and were once used as a weight for measuring gold.</li>
<li><strong>Puliyankottai</strong> (<span class="ta">புளியங்கொட்டை</span>): tamarind seeds, collected from every kitchen.</li>
<li><strong>Sozhi</strong> (<span class="ta">சோழி</span>): cowrie shells, which clatter beautifully into the pits.</li>
</ul>
<p>Learn more in our guide to <a href="/pallanguzhi-board-and-seeds">the Pallanguzhi board and seeds</a>.</p>

<h2>Why elders loved it: counting, memory and patience</h2>
<p>Pallanguzhi is a quiet mental workout. Players count seeds constantly, predict where a chain of sowing will end, and remember how the board looked a few moves ago. Elders often describe it as a way to sharpen arithmetic and concentration in children, and it builds fine motor control from handling small seeds.</p>
{note("The game also teaches a very Tamil kind of patience: <em>porumai</em>. The player who rushes usually hands the other a pasu.")}

<h2>The same game, many names</h2>
<p>Neighbouring regions play close cousins of Pallanguzhi under different names: <strong>Ali Guli Mane</strong> in Karnataka, <strong>Vamana Guntalu</strong> in Andhra Pradesh and Telangana, <strong>Kuzhipara</strong> in Kerala and <strong>Chenne Mane</strong> in Tulu Nadu. See <a href="/pallanguzhi-names-and-spellings">every name and spelling for Pallanguzhi</a>.</p>

<h2>Pallanguzhi today</h2>
<p>Like many traditional games, Pallanguzhi faded as families moved to apartments and phones. It is now enjoying a revival: craft stores sell new boards, schools use it to teach counting, and families bring it out during Pongal and summer holidays. This site is part of that revival. It’s a free, browser-based Pallanguzhi you can play in a minute, with a grandmother who teaches you as you go.</p>
{cta("Play the game your grandmother played, and see if you can beat Sheila Paati, unbeaten since 1952.")}
""",
))

PAGES.append(dict(
    slug="pallanguzhi-strategy", lang="en", kicker="Strategy", nav="Strategy",
    title="Pallanguzhi Strategy: 9 Tips to Win More Games",
    h1="Pallanguzhi Strategy: 9 Tips to Win",
    ta="பல்லாங்குழி வெல்லும் யுக்திகள்",
    og_title="Pallanguzhi Strategy: 9 Tips to Win",
    og_sub="Count ahead, set traps, farm pasus and win the endgame.",
    description="Pallanguzhi strategy guide: 9 practical tips to win more often, from counting your landing pit and setting capture traps to using pasu and managing the endgame.",
    lede="Pallanguzhi looks like luck until you start counting. These nine tips are what separate a beginner from someone who beats their grandmother, or at least makes her put down her coffee.",
    body=lambda: f"""
<h2>1. Always count your landing pit</h2>
<p>Every move is decided by where your <strong>last seed</strong> lands. From a pit with <em>n</em> seeds, your last seed lands <em>n</em> pits ahead (anticlockwise). Before you touch anything, count it out, then look at the next two pits after it.</p>

<h2>2. Look for “empty, then full”</h2>
<p>The capture pattern is: <strong>last seed → empty pit → pit you take</strong>. Scan the board for an empty pit sitting just before a big pile, then look for one of your pits whose seeds would land right before that empty pit.</p>
{board([0,0,0,0,2,0,0, 0,6,2,1,2,3,1], {4:"hl",6:"hl",7:"empty",8:"cap"}, [(4,6,18)], "Two seeds from the fifth pit end beside an empty pit, so you capture the 6 beyond it.", "Pallanguzhi capture trap diagram")}

<h2>3. Don’t leave your opponent a capture</h2>
<p>After your move, check the board from your opponent’s side. Do they have a pit that lands right before an empty pit with a big pile behind it? If yes, try a different move, or fill that empty pit yourself.</p>

<h2>4. Think in relays, not single sows</h2>
<p>A move rarely stops after one handful. If your last seed lands next to a non-empty pit, the move continues. Strong players trace the whole chain: “I land here, scoop 4, those land there, the next pit is empty, so I capture...”. In our <a href="/">online game</a>, hovering over a pit shows where your first handful lands.</p>

<h2>5. Farm pasus on your own row</h2>
<p>A pasu goes to <strong>the owner of the row</strong>, not the player sowing. Pits with <strong>3 seeds on your row</strong> are opportunities: if your opponent’s sowing passes through, it becomes 4 and the pasu is yours.</p>

<h2>6. Watch 3s on your opponent’s row</h2>
<p>The reverse is also true. If your move will drop a seed into a 3 on your opponent’s row, you’re gifting them four seeds. Sometimes it’s worth it for a big capture. Usually it isn’t.</p>
{board([0,0,3,1,3,0,0, 2,1,2,1,2,1,2], {4:"pasu"}, [(2,3,14),(3,4,14)], "Turning a 3 into a 4 creates a pasu for whoever owns that row.", "Pallanguzhi pasu strategy diagram")}

<h2>7. Big pits are both bombs and shields</h2>
<p>A pit with 12+ seeds travels around the whole board. It can set up a massive relay, but while it sits there it’s also a juicy target. Keep big piles where your opponent can’t easily land just before an empty pit next to them.</p>

<h2>8. Control the tempo near the end</h2>
<p>The round ends when the player to move has an empty row, and remaining seeds go to the owner of each row. Near the end, <strong>keeping seeds on your own row</strong> is worth points. Avoid moves that shovel your last seeds onto your opponent’s side.</p>

<h2>9. Practise against a stronger player</h2>
<p>The fastest way to improve is to lose to someone better and notice why. Sheila Paati has three moods: <em>Chellam</em> (easy), <em>Konjam serious</em> (medium) and <em>Paati mode</em>, which looks many moves ahead.</p>
{cta("Try these tips against Sheila Paati. Start on Chellam, then move up to Paati mode when you’re feeling brave.", "Put the tips to work")}
<p>New to the game? Start with <a href="/how-to-play-pallanguzhi">how to play Pallanguzhi</a>.</p>
""",
))

PAGES.append(dict(
    slug="pallanguzhi-names-and-spellings", lang="en", kicker="Names & spellings", nav="Names",
    title="Pallankuzhi, Pallanguli, Ali Guli Mane: Every Name for Pallanguzhi",
    h1="Pallanguzhi, Pallankuzhi or Pallanguli? Every Name for the Game",
    ta="பல்லாங்குழி: பல பெயர்கள்",
    og_title="Every Name for Pallanguzhi",
    og_sub="Pallankuzhi, pallanguli, Ali Guli Mane, Vamana Guntalu, Kuzhipara and more.",
    description="Pallanguzhi, pallankuzhi, pallanguli, pallankuli, palanguzhi: why the Tamil game has so many spellings, and its names in Kannada, Telugu, Malayalam and Tulu.",
    lede="Search for this game and you’ll find a dozen spellings. They’re all the same Tamil word, பல்லாங்குழி, written in English letters in different ways. Here’s why, and what neighbouring languages call it.",
    body=lambda: f"""
<h2>Why so many spellings?</h2>
<p>The Tamil letter <span class="ta">ழ</span> (<em>zha</em>) has no exact English equivalent. Some people write it as <strong>zh</strong>, others as <strong>l</strong>, and the <span class="ta">ங்</span> (<em>ng</em>) and <span class="ta">க</span> (<em>k/g</em>) sounds also get written differently. So one word, <span class="ta">பல்லாங்குழி</span>, becomes many:</p>
<table>
<thead><tr><th>Spelling</th><th>Why people write it that way</th></tr></thead>
<tbody>
<tr><td><strong>Pallanguzhi</strong></td><td>Most common; <em>zh</em> for <span class="ta">ழ</span>, used by Wikipedia</td></tr>
<tr><td><strong>Pallankuzhi</strong></td><td><em>k</em> instead of <em>g</em> for <span class="ta">கு</span></td></tr>
<tr><td><strong>Pallanguli / Pallankuli</strong></td><td><span class="ta">ழ</span> written as <em>l</em>, as it often sounds in everyday speech</td></tr>
<tr><td><strong>Palanguzhi / Pallaanguzhi</strong></td><td>Single <em>l</em>, or a doubled vowel for the long <em>aa</em></td></tr>
<tr><td><strong>Pallangkuzhi / Pallanghuzhi</strong></td><td>Spelling out the <em>ng</em> and <em>gh</em> sounds</td></tr>
</tbody></table>
{note("Whichever spelling you searched, you’re in the right place. You can <a href='/#play'>play Pallanguzhi online here</a>.")}

<h2>What does Pallanguzhi mean?</h2>
<p>The name is usually explained as <span class="ta">பல</span> <em>pala</em> (“many”) + <span class="ta">குழி</span> <em>kuzhi</em> (“pit” or “hollow”): the game of many pits. A single pit is a <strong>kuzhi</strong>.</p>

<h2>Names in other South Indian languages</h2>
<table>
<thead><tr><th>Language / region</th><th>Name</th></tr></thead>
<tbody>
<tr><td>Tamil (Tamil Nadu, Sri Lanka)</td><td><strong>Pallanguzhi</strong> · <span class="ta">பல்லாங்குழி</span></td></tr>
<tr><td>Kannada (Karnataka)</td><td><strong>Ali Guli Mane</strong> (also Alaguli Mane)</td></tr>
<tr><td>Telugu (Andhra Pradesh, Telangana)</td><td><strong>Vamana Guntalu</strong></td></tr>
<tr><td>Malayalam (Kerala)</td><td><strong>Kuzhipara</strong></td></tr>
<tr><td>Tulu (coastal Karnataka)</td><td><strong>Chenne Mane</strong></td></tr>
</tbody></table>
<p>The boards and rules vary a little between regions and even between families, but they are all close relatives in the worldwide <strong>mancala</strong> family, alongside games like Oware and Kalah.</p>

<h2>Words you’ll hear while playing</h2>
<ul>
<li><strong>Kuzhi</strong> (<span class="ta">குழி</span>): a pit.</li>
<li><strong>Pasu</strong> (<span class="ta">பசு</span>): “cow”. Four seeds in a pit, claimed by that row’s owner.</li>
<li><strong>Manjadi</strong> (<span class="ta">மஞ்சாடி</span>): the red seeds traditionally used.</li>
<li><strong>Sozhi</strong> (<span class="ta">சோழி</span>): cowrie shells, another traditional counter.</li>
</ul>
{cta()}
<p>Next: <a href="/how-to-play-pallanguzhi">learn the rules</a> or read about <a href="/pallanguzhi-history">Pallanguzhi’s history</a>.</p>
""",
))

PAGES.append(dict(
    slug="pallanguzhi-board-and-seeds", lang="en", kicker="Board & seeds", nav="Board & seeds",
    title="The Pallanguzhi Board and Seeds: Manjadi, Tamarind & Cowries",
    h1="The Pallanguzhi Board & Seeds",
    ta="பல்லாங்குழி பலகையும் விதைகளும்",
    og_title="The Pallanguzhi Board & Seeds",
    og_sub="Anatomy of a board, and why manjadi seeds are the classic choice.",
    description="The Pallanguzhi board and seeds explained: the 14-pit layout, wooden and brass boards, and choosing manjadi, tamarind or cowrie counters.",
    lede="A good Pallanguzhi set is half the pleasure: the weight of a carved board, the click of seeds falling into wood. Here’s how a board is laid out and what to play with.",
    body=lambda: f"""
{img("/assets/img/pallanguzhi-board-closeup.webp", "Carved rosewood Pallanguzhi board with 14 round pits and red manjadi seeds", "A two-row, 14-pit Pallanguzhi board with store pits at each end.", w=1088, h=264, eager=True)}

<h2>Anatomy of a Pallanguzhi board</h2>
<ul>
<li><strong>14 playing pits</strong> (<em>kuzhis</em>) in <strong>two rows of seven</strong>. Each player owns the row nearest to them.</li>
<li><strong>Store pits</strong>: many boards have a larger hollow at each end to hold captured seeds. On simpler boards players keep captures in a pile beside them.</li>
<li><strong>Hinge</strong>: folding boards close like a box, with the seeds stored inside.</li>
</ul>
{board(START, caption="Layout: two rows of seven kuzhis, with store pits at the ends.", alt="Pallanguzhi board layout diagram")}

<h2>Board materials</h2>
<p><strong>Wood</strong> is the classic: rosewood, teak and jackfruit wood age beautifully. Carved boards from Chettinad are prized, and some are shaped like fish or decorated with brass corners and studs. <strong>Brass</strong> boards are heavier, ring when seeds drop, and last generations. Modern sets are often lacquered wood made by artisan cooperatives.</p>

<h2>Choosing seeds</h2>
<table>
<thead><tr><th>Counter</th><th>What it is</th><th>Feel</th></tr></thead>
<tbody>
<tr><td><strong>Manjadi</strong> <span class="ta">மஞ்சாடி</span></td><td>Glossy red seeds of <em>Adenanthera pavonina</em></td><td>Uniform, shiny, the classic look</td></tr>
<tr><td><strong>Puliyankottai</strong> <span class="ta">புளியங்கொட்டை</span></td><td>Tamarind seeds</td><td>Dark brown, flat, easy to find at home</td></tr>
<tr><td><strong>Sozhi</strong> <span class="ta">சோழி</span></td><td>Cowrie shells</td><td>Satisfying clatter, easy to count</td></tr>
</tbody></table>
<p>You’ll need <strong>70</strong> counters for the standard 5-per-pit game, and a few spares. If you play with 6 or 12 per pit, you need 84 or 168.</p>
{note("No board at home? You can play on our <a href='/'>online Pallanguzhi board</a> and switch between manjadi, tamarind and sozhi from the menu.")}

<h2>Caring for a wooden board</h2>
<p>Keep it out of direct sun and damp, wipe it with a dry cloth, and rub in a little coconut or linseed oil once or twice a year to keep the wood from drying out.</p>
{cta()}
""",
))

PAGES.append(dict(
    slug="ta/pallanguzhi", lang="ta", kicker="தமிழில்", nav="தமிழ்",
    title="பல்லாங்குழி விளையாடுவது எப்படி? விதிமுறைகள், வரலாறு | Pallanguzhi in Tamil",
    h1="பல்லாங்குழி விளையாடுவது எப்படி?",
    ta="Pallanguzhi rules in Tamil",
    og_title="பல்லாங்குழி விளையாடுவது எப்படி?",
    og_sub="விதிமுறைகள், பசு, வெற்றி: எளிய தமிழில்.",
    og_ta="Pallanguzhi in Tamil",
    description="பல்லாங்குழி விளையாட்டின் விதிமுறைகள் எளிய தமிழில்: பலகை அமைப்பு, விதைத்தல், தொடர்ந்து ஆடுதல், கைப்பற்றுதல், பசு, வெற்றி. இலவசமாக ஆன்லைனில் விளையாடுங்கள்.",
    lede="பல்லாங்குழி நம் பாட்டிகள் விளையாடிய பாரம்பரிய தமிழ் விளையாட்டு. 14 குழிகள், 70 விதைகள், இரண்டு பேர். விதிகள் எளிமையானவை, ஆனால் வெல்ல நன்றாக எண்ணத் தெரிய வேண்டும்.",
    alt_lang="how-to-play-pallanguzhi",
    body=lambda: f"""
{img("/assets/img/pallanguzhi-game-board.webp", "பல்லாங்குழி பலகை: ஒவ்வொரு குழியிலும் 5 மஞ்சாடி விதைகள்", "ஆட்டத் தொடக்கம்: ஒவ்வொரு குழியிலும் 5 விதைகள்.", eager=True)}

<h2>பல்லாங்குழி என்றால் என்ன?</h2>
<p><strong>பல்லாங்குழி</strong> (Pallanguzhi, Pallankuzhi) தமிழ்நாட்டின் பாரம்பரிய பலகை விளையாட்டு. “பல” + “குழி” — பல குழிகள் கொண்ட விளையாட்டு. உலகெங்கும் விளையாடப்படும் <em>மங்காலா</em> (mancala) குடும்பத்தைச் சேர்ந்தது. வீட்டுத் திண்ணைகளிலும் முற்றங்களிலும், குறிப்பாகப் பெண்களும் குழந்தைகளும் விரும்பி விளையாடிய விளையாட்டு இது.</p>

<h2>தேவையானவை</h2>
<ul>
<li>இரண்டு வரிசைகளில் 7 குழிகள் வீதம் <strong>14 குழிகள்</strong> கொண்ட பலகை</li>
<li><strong>70 விதைகள்</strong>: மஞ்சாடி, புளியங்கொட்டை அல்லது சோழி</li>
<li>இரண்டு விளையாட்டாளர்கள்</li>
</ul>

<h2>1. பலகையை அமைத்தல்</h2>
<p>ஒவ்வொரு குழியிலும் <strong>5 விதைகள்</strong> வையுங்கள். உங்கள் அருகில் உள்ள 7 குழிகள் உங்களுடையவை; எதிரே உள்ள 7 குழிகள் எதிராளியுடையவை.</p>

<h2>2. விதைத்தல்</h2>
<p>உங்கள் முறையில், உங்கள் வரிசையில் விதைகள் உள்ள ஏதேனும் ஒரு குழியைத் தேர்ந்தெடுத்து, அதிலுள்ள எல்லா விதைகளையும் எடுங்கள். பிறகு அடுத்தடுத்த குழிகளில் <strong>ஒவ்வொன்றாக</strong> போடுங்கள். திசை: <strong>இடஞ்சுழி</strong> (anticlockwise). உங்கள் வரிசையில் இடமிருந்து வலம், பின் எதிராளி வரிசையில் வலமிருந்து இடம்.</p>
{board([0,0,3,1,1,1,0, 2,2,2,2,2,2,2], {2:"hl",3:"hl",4:"hl",5:"hl"}, [(2,3,16),(3,4,16),(4,5,16)], "3 விதைகள் → அடுத்த 3 குழிகளில் ஒவ்வொன்று.", "விதைத்தல் படம்", top="எதிராளி வரிசை", bottom="உங்கள் வரிசை")}

<h2>3. தொடர்ந்து ஆடுதல்</h2>
<p>கடைசி விதை விழுந்த பிறகு, <strong>அடுத்த குழியைப்</strong> பாருங்கள். அதில் விதைகள் இருந்தால், அவை அனைத்தையும் எடுத்துத் தொடர்ந்து விதையுங்கள். ஒரே முறையில் பலகையைச் சுற்றி வரலாம்!</p>

<h2>4. கைப்பற்றுதல்</h2>
<p>அடுத்த குழி <strong>காலியாக</strong> இருந்தால், அதற்கு அடுத்த குழியில் உள்ள <strong>எல்லா விதைகளும் உங்களுக்கு</strong>. உங்கள் முறை முடிந்தது. இரண்டு குழிகளும் காலியாக இருந்தால், எதுவும் கிடைக்காது.</p>
{board([0,0,0,0,0,1,1, 0,7,2,2,2,2,2], {6:"hl",7:"empty",8:"cap"}, [(6,8,40)], "கடைசி விதை → காலி குழி → அடுத்த குழியின் 7 விதைகள் உங்களுக்கு.", "கைப்பற்றுதல் படம்", top="எதிராளி வரிசை", bottom="உங்கள் வரிசை")}

<h2>5. பசு</h2>
<p>விதைக்கும்போது ஏதேனும் ஒரு குழியில் <strong>சரியாக 4 விதைகள்</strong> ஆனால், அது <strong>பசு</strong>. அந்த 4 விதைகளும் உடனே <strong>அந்த வரிசையின் உரிமையாளருக்குப்</strong> போகும். எதிராளியின் முறையிலும் இது நடக்கும்!</p>

<h2>6. வெற்றி</h2>
<p>ஒருவரின் முறை வரும்போது அவர் வரிசையில் விதைகளே இல்லையென்றால் ஆட்டம் முடியும். பலகையில் மீதமுள்ள விதைகள் அந்தந்த வரிசையின் உரிமையாளருக்குச் சேரும். <strong>70-இல் 35-க்கு மேல்</strong> விதைகள் சேர்த்தவர் வெற்றியாளர்.</p>
{note("<strong>சிறு குறிப்பு:</strong> குழியைத் தொடும் முன், உங்கள் கடைசி விதை எங்கே விழும் என்று எண்ணிப் பாருங்கள். அதுதான் வெற்றியின் ரகசியம்.")}

<h2>பல்லாங்குழியின் நன்மைகள்</h2>
<ul>
<li>எண்ணும் திறனும் கணக்கும் வளரும்</li>
<li>நினைவாற்றலும் கவனமும் கூடும்</li>
<li>பொறுமை பழகும்; விரல்களின் நுண்திறன் மேம்படும்</li>
<li>குடும்பத்தினரோடு செலவிடும் இனிய நேரம்</li>
</ul>

<h2>ஆன்லைனில் இலவசமாக விளையாடுங்கள்</h2>
<p>பலகை இல்லையா? கவலை வேண்டாம். ஷீலா பாட்டியுடன் <a href="/#play">இங்கே இலவசமாக விளையாடலாம்</a>. அவர் விதிகளையும் <a href="/#learn">சொல்லித் தருவார்</a>.</p>
{cta("ஷீலா பாட்டி 1952-ல் இருந்து தோற்றதே இல்லை. நீங்கள் வெல்வீர்களா?", "இப்போதே விளையாடுங்கள்")}
<p>English: <a href="/how-to-play-pallanguzhi">How to play Pallanguzhi</a> · <a href="/pallanguzhi-history">History</a> · <a href="/pallanguzhi-strategy">Strategy</a></p>
""",
))

HUB = dict(slug="learn", lang="en", kicker="Learn", nav="Learn",
           title="Learn Pallanguzhi: Rules, History, Strategy & Tamil Guide",
           h1="Learn Pallanguzhi",
           ta="பல்லாங்குழி கற்றுக்கொள்ளுங்கள்",
           og_title="Learn Pallanguzhi",
           og_sub="Rules, history, strategy, names and a Tamil guide, all in one place.",
           description="Everything about Pallanguzhi (pallankuzhi), the Tamil mancala game: rules, history, strategy, board and seeds, names and spellings, and a full guide in Tamil.",
           lede="Guides to Pallanguzhi, the Tamil game of many pits. Start with the rules, then go deeper, or skip ahead and play.")

# ---------------------------------------------------------------- page shell
def url(slug):
    return f"{SITE}/{slug}" if slug else f"{SITE}/"

def og_path(slug):
    return f"/assets/og/{slug.replace('/', '-') or 'home'}.jpg"

def head(p, extra_ld):
    canonical = url(p["slug"])
    alt = ""
    if p.get("alt_lang"):
        en, ta = (p["slug"], p["alt_lang"]) if p["lang"] == "en" else (p["alt_lang"], p["slug"])
        alt = (f'<link rel="alternate" hreflang="en" href="{url(en)}" />\n'
               f'<link rel="alternate" hreflang="ta" href="{url(ta)}" />\n'
               f'<link rel="alternate" hreflang="x-default" href="{url(en)}" />')
    t = html.escape(p["title"])
    d = html.escape(p["description"])
    ogi = SITE + og_path(p["slug"])
    return f"""<!doctype html>
<html lang="{p['lang']}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{t}</title>
<meta name="description" content="{d}" />
<link rel="canonical" href="{canonical}" />
{alt}
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="author" content="{AUTHOR}" />
<meta name="theme-color" content="#E7A33A" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Pallanguzhi" />
<meta property="og:locale" content="{'ta_IN' if p['lang'] == 'ta' else 'en_IN'}" />
<meta property="og:title" content="{t}" />
<meta property="og:description" content="{d}" />
<meta property="og:url" content="{canonical}" />
<meta property="og:image" content="{ogi}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="{html.escape(p['og_title'])}" />
<meta property="article:published_time" content="{PUBLISHED}" />
<meta property="article:modified_time" content="{TODAY}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{t}" />
<meta name="twitter:description" content="{d}" />
<meta name="twitter:image" content="{ogi}" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="{FONTS}" />
<link rel="stylesheet" href="/css/article.css" />
<script type="application/ld+json">{json.dumps(extra_ld, ensure_ascii=False)}</script>
</head>"""

NAV = [("how-to-play-pallanguzhi", "How to play"), ("pallanguzhi-strategy", "Strategy"),
       ("pallanguzhi-history", "History"), ("pallanguzhi-names-and-spellings", "Names"),
       ("ta/pallanguzhi", "தமிழ்")]

def header(active):
    cur = ' aria-current="page"'
    links = "".join(f'<a href="/{s}"{cur if s == active else ""}>{n}</a>' for s, n in NAV)
    return f"""<body>
<header class="site-head"><div class="in">
  <a class="logo" href="/"><b>Pallanguzhi</b><span>பல்லாங்குழி</span></a>
  <nav class="nav" aria-label="Guides">{links}</nav>
  <a class="play-btn" href="/#play">▶ Play free</a>
</div></header>
<div class="band" aria-hidden="true"></div>"""

def footer():
    return f"""<footer class="site-foot"><div class="in">
  <div><strong>Pallanguzhi</strong> · play the Tamil seed game online, free.<br /><a href="/#play">Play</a> · <a href="/#learn">Tutorial</a> · <a href="/learn">All guides</a></div>
  <div><a href="/how-to-play-pallanguzhi">How to play</a><br /><a href="/pallanguzhi-strategy">Strategy</a><br /><a href="/pallanguzhi-history">History</a></div>
  <div><a href="/pallanguzhi-board-and-seeds">Board &amp; seeds</a><br /><a href="/pallanguzhi-names-and-spellings">Names &amp; spellings</a><br /><a href="/ta/pallanguzhi" lang="ta">தமிழில் படிக்க</a></div>
  <p class="names">Also known as pallankuzhi, pallanguli, pallankuli, palanguzhi, pallaanguzhi · <span lang="ta">பல்லாங்குழி</span> · Ali Guli Mane (Kannada) · Vamana Guntalu (Telugu) · Kuzhipara (Malayalam) · Chenne Mane (Tulu). A member of the mancala family of board games.</p>
</div></footer>
</body>
</html>"""

def breadcrumbs_ld(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}

def related(slug):
    cards = []
    for q in PAGES:
        if q["slug"] == slug:
            continue
        cards.append(f'<a class="card" href="/{q["slug"]}"{TA_ATTR if q["lang"] == "ta" else ""}><small>{q["kicker"]}</small><b>{html.escape(q["h1"])}</b><span>{html.escape(q["description"][:110].rsplit(" ", 1)[0])}…</span></a>')
    return f'<h2>Keep reading</h2><div class="related">{"".join(cards[:4])}</div>'

def build_article(p):
    crumbs = [("Pallanguzhi", url("")), ("Learn", url("learn")), (p["h1"], url(p["slug"]))]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": p["title"][:110], "description": p["description"],
         "inLanguage": p["lang"], "image": [SITE + og_path(p["slug"])],
         "datePublished": PUBLISHED, "dateModified": TODAY,
         "author": {"@type": "Person", "name": AUTHOR, "url": "https://github.com/JustinBenito"},
         "publisher": {"@type": "Organization", "name": "Pallanguzhi", "logo": {"@type": "ImageObject", "url": SITE + "/icon-512.png"}},
         "mainEntityOfPage": url(p["slug"]),
         "about": {"@type": "Game", "name": "Pallanguzhi", "alternateName": ALT_NAMES, "sameAs": "https://en.wikipedia.org/wiki/Pallanguzhi"}},
        breadcrumbs_ld(crumbs)]}
    if p.get("faq"):
        ld["@graph"].append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": html.unescape(a)}} for q, a in p["faq"]()]})
    body = p["body"]()
    import re
    words = len(re.sub(r'<svg.*?</svg>|<[^>]+>', ' ', body, flags=re.S).split())
    out = head(p, ld) + header(p["slug"]) + f"""
<main>
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Pallanguzhi</a> › <a href="/learn">Learn</a> › {html.escape(p['nav'])}</nav>
  <article>
    <div class="kicker">{p['kicker']}</div>
    <h1>{p['h1']}</h1>
    <div class="ta-sub"{' lang="en"' if p['lang'] == 'ta' else ' lang="ta"'}>{p['ta']}</div>
    <p class="lede">{p['lede']}</p>
    <div class="meta"><span>By {AUTHOR}</span><span>Updated <time datetime="{TODAY}">{date.fromisoformat(TODAY).strftime('%d %b %Y')}</time></span><span>{max(2, round(words / 230))} min read</span></div>
    {body}
  </article>
  {related(p['slug'])}
</main>""" + footer()
    return out

def build_hub():
    p = HUB
    crumbs = [("Pallanguzhi", url("")), ("Learn", url("learn"))]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "name": p["title"], "description": p["description"], "url": url("learn"),
         "hasPart": [{"@type": "Article", "headline": q["title"], "url": url(q["slug"])} for q in PAGES]},
        breadcrumbs_ld(crumbs)]}
    cards = "".join(f'<a class="card" href="/{q["slug"]}"{TA_ATTR if q["lang"] == "ta" else ""}><small>{q["kicker"]}</small><b>{html.escape(q["h1"])}</b><span>{html.escape(q["description"])}</span></a>' for q in PAGES)
    return head(p, ld) + header("learn") + f"""
<main>
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Pallanguzhi</a> › Learn</nav>
  <div class="hub-hero">
    <div class="kicker">{p['kicker']}</div>
    <h1>{p['h1']}</h1>
    <div class="ta-sub" lang="ta">{p['ta']}</div>
    <p class="lede">{p['lede']}</p>
    <a class="play-btn" href="/#learn">▶ Two-minute interactive tutorial</a>
  </div>
  {img("/assets/img/pallanguzhi-tutorial.webp", "Sheila Paati's interactive Pallanguzhi tutorial", "Paati’s pathshala: an interactive tutorial that teaches the rules on a real board.", eager=True)}
  <div class="related">{cards}</div>
  {cta()}
</main>""" + footer()

TA_ATTR = ' lang="ta"'
ALT_NAMES = ["Pallankuzhi", "Pallanguli", "Pallankuli", "Palanguzhi", "Pallaanguzhi", "Pallangkuzhi",
             "Pallanghuzhi", "பல்லாங்குழி", "Ali Guli Mane", "Vamana Guntalu", "Kuzhipara", "Chenne Mane"]

# ---------------------------------------------------------------- misc files
def sitemap():
    entries = [("", "1.0", "weekly"), ("learn", "0.8", "monthly")] + [(p["slug"], "0.8", "monthly") for p in PAGES]
    rows = []
    for slug, pri, freq in entries:
        img_tag = ""
        if slug == "":
            img_tag = f"<image:image><image:loc>{SITE}/assets/img/pallanguzhi-game-board.webp</image:loc></image:image>"
        rows.append(f"  <url><loc>{url(slug)}</loc><lastmod>{TODAY}</lastmod><changefreq>{freq}</changefreq><priority>{pri}</priority>{img_tag}</url>")
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
            + "\n".join(rows) + "\n</urlset>\n")

ROBOTS = f"""User-agent: *
Allow: /
Disallow: /scripts/

Sitemap: {SITE}/sitemap.xml
"""

def write(rel, text):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("wrote", rel)

def render_og(slug, title, kicker, sub, ta=None):
    from PIL import Image
    q = {"title": title, "kicker": kicker, "sub": sub}
    if ta:
        q["ta"] = ta
    tmp = os.path.join(ROOT, "scripts", ".og.png")
    subprocess.run([CHROME, f"--screenshot={tmp}", "--window-size=1200,630", "--hide-scrollbars",
                    "--virtual-time-budget=4000", "http://localhost:5173/scripts/og.html?" + urllib.parse.urlencode(q)],
                   check=True, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    out = os.path.join(ROOT, og_path(slug).lstrip("/"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    Image.open(tmp).convert("RGB").save(out, "JPEG", quality=86, optimize=True, progressive=True)
    os.remove(tmp)
    print("og", out)

if __name__ == "__main__":
    for p in PAGES:
        write(p["slug"] + ".html", build_article(p))
    write("learn.html", build_hub())
    write("sitemap.xml", sitemap())
    write("robots.txt", ROBOTS)
    if "--og" in sys.argv:
        render_og("", "Pallanguzhi", "The Tamil seed game", "Play the Tamil mancala online, free, and learn the rules in 2 minutes.")
        render_og("learn", HUB["og_title"], HUB["kicker"], HUB["og_sub"])
        for p in PAGES:
            render_og(p["slug"], p["og_title"], p["kicker"], p["og_sub"], p.get("og_ta"))
