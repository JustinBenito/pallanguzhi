/* Sheila Ammachi's dialogue. t = what she says (Tanglish), e = a small English whisper for newcomers. */
(function () {
  const PZ = (window.PZ = window.PZ || {});

  const LINES = {
    hello: [
      { t: 'Vaa kanna, utkaaru! Ammachi kitta jeyikka mudiyumaa nu paappom.', e: 'Come, sit! Let’s see if you can beat Ammachi.' },
      { t: 'Coffee kudichiyaa? Illana kai nadungum, seeds ellam keela vizhum.', e: 'Had your coffee? Otherwise your hands will shake.' },
      { t: '1950-la irundhu naan thothadhe illa. Summa solren… vaa aadalaam.', e: 'Haven’t lost since 1950. Just saying… let’s play.' },
      { t: 'Phone-a keela vei, kanna. Idhu dhaan original video game.', e: 'Put the phone down. This is the original video game.' },
    ],
    helloPaatiFirst: [
      { t: 'Indha thadava naan modhalla aaduren. Vayasukku oru mariyaadhai!', e: 'I go first this time. Respect your elders!' },
    ],
    yourTurn: [
      { t: 'Un turn kanna. Keela irukkura kuzhi ellam unnodadhu.', e: 'Your turn — the bottom row is yours.' },
      { t: 'Seri, nee aadu. Paakkalaam.', e: 'Okay, your move. Let’s see.' },
      { t: 'Yosichu aadu, avasara padaadha.', e: 'Think and play. Don’t rush.' },
      { t: 'Hmm, ippo enna panna pora?', e: 'So… what’s your plan?' },
    ],
    thinking: [
      { t: 'Hmm… yosikkaren. Avasara padaadha.', e: 'Hmm… thinking. Patience.' },
      { t: 'Indha kuzhi… illa andha kuzhi… seri.', e: 'This pit… no, that pit… okay.' },
      { t: 'Konjam porumai kanna, Ammachi-ku vayasaachu.', e: 'Little patience, Ammachi is old.' },
      { t: 'Kannaadi ellam saripaathukaren… ok.', e: 'Adjusting my specs… ok.' },
      { t: 'Ennoda mind-la 7 move munnaadi paathuten.', e: 'I’ve already seen 7 moves ahead.' },
    ],
    paatiCaptureBig: [
      { t: 'Aaha! Ellam Ammachi kitta vandhuduchu!', e: 'Aha! All of it comes to Ammachi!' },
      { t: 'Ennoda kai raasi paathiyaa?', e: 'See my lucky hand?' },
      { t: 'Idhu dhaan anubavam kanna. Notes eduthuko.', e: 'That’s experience. Take notes.' },
      { t: 'Kaakka kaakka… ellam en kooda!', e: 'Mine, all mine!' },
    ],
    paatiCaptureSmall: [
      { t: 'Konjam dhaan, aanaa thuli thuliyaa dhaan vellam.', e: 'Small, but drops make a flood.' },
      { t: 'Seri, idhu podhum ippothaikku.', e: 'This is enough for now.' },
    ],
    youCaptureBig: [
      { t: 'Adei! Eppadi da? Yaar solli kuduthaa?', e: 'Hey! How?! Who taught you that?' },
      { t: 'Ennadhu idhu, cheating-a? Kai-a kaattu!', e: 'Is this cheating? Show me your hands!' },
      { t: 'Aiyo, en seeds! En kitta irundhu thirudittiye!', e: 'My seeds! You stole them!' },
      { t: 'Sabaash! Aanaa romba sandhosha padaadha.', e: 'Well done! But don’t celebrate too much.' },
    ],
    youCaptureSmall: [
      { t: 'Paravaala, konjam vittu kudukkaren. Nee chellam.', e: 'Fine, I’ll let you have a little.' },
      { t: 'Avlo dhaanaa? Ammachi bayandhutten nu nenachen.', e: 'That’s all? I thought I should be scared.' },
    ],
    youNothing: [
      { t: 'Onnum kidaikkalaiyaa? Aiyo paavam.', e: 'Got nothing? Poor thing.' },
      { t: 'Kaali kuzhi dhaan kidaichadhu. Next time!', e: 'Only an empty pit. Next time!' },
    ],
    paatiPasu: [
      { t: 'Pasu vandhuduchu! Lakshmi veetukku vandha maadhiri.', e: 'A pasu! Like Lakshmi walking into the house.' },
      { t: 'Naalu! Pasu enakku dhaan. Moo!', e: 'Four! The cow is mine. Moo!' },
    ],
    youPasu: [
      { t: 'Unakku pasu-vaa? Nalla irukkattum, nalla irukkattum.', e: 'You got a pasu? Bless you, bless you.' },
      { t: 'Un pakkam pasu nikkudhu. Paal kudu, paakkalaam.', e: 'A cow on your side. Let’s see if it gives milk.' },
    ],
    longChain: [
      { t: 'Aiyo, idhu nikkave nikkadhaa?', e: 'Will this ever stop?!' },
      { t: 'Suthi suthi varudhu, rail vandi maadhiri!', e: 'Round and round like a train!' },
      { t: 'Ivlo neram aachu, naan oru dosai suttuduven.', e: 'In this time I could make a dosa.' },
    ],
    idle: [
      { t: 'Enna, thoongitiyaa? Seekiram aadu, serial start aaga pogudhu!', e: 'Asleep? Hurry, my serial is starting!' },
      { t: 'Nee yosikkara neraththula naan rendu dosai suttuduven.', e: 'I could make two dosas while you think.' },
      { t: 'Kuzhi-ya thottaa podhum kanna, kadikkaadhu.', e: 'Just tap a pit, it won’t bite.' },
    ],
    emptyTap: [
      { t: 'Andha kuzhi kaali da! Kannaadi pottuko.', e: 'That pit is empty! Wear your glasses.' },
      { t: 'Kaali kuzhi-la enna edukka pora? Kaathaa?', e: 'What will you scoop from an empty pit — air?' },
    ],
    wrongSide: [
      { t: 'Hey hey, adhu en kuzhi! Kai vekkaadha.', e: 'Hey, that’s my pit! Hands off.' },
      { t: 'Andha pakkam Ammachi-odadhu. Indha pakkam unnodadhu. Purinjudhaa?', e: 'That side is mine. This side is yours. Got it?' },
    ],
    winning: [
      { t: 'Score paaru kanna… Ammachi dhaan munnaadi.', e: 'Look at the score… Ammachi is ahead.' },
    ],
    losing: [
      { t: 'Seri seri, ippo dhaan warm-up mudinjudhu.', e: 'Okay okay, the warm-up just ended.' },
    ],
    youWin: [
      { t: 'Sabaash kanna! Nee ennai vida nalla aadura. Romba perumai!', e: 'Bravo, dear! You’ve become better than me. So proud!' },
      { t: 'Aiyo, en student ennaiye minjitta! Nee ippo Ammachi-ah vida better.', e: 'My own student beat me! You’re better than Ammachi now.' },
      { t: 'Unga thaatha kooda ennai jeyichadhu illa! Nee ennai vida perusaa aayitta.', e: 'Even your grandpa never beat me! You’ve outgrown me.' },
    ],
    paatiWin: [
      { t: 'Ammachi kitta vilayaadina ippadi dhaan. Innoru round?', e: 'That’s what happens when you play Ammachi. Another?' },
      { t: 'Kavalai padaadha kanna, 70 varusha practice idhu.', e: 'Don’t worry, this is 70 years of practice.' },
      { t: 'Jeyichutten! Ippo poi homework pannu.', e: 'I won! Now go do your homework.' },
    ],
    tie: [
      { t: 'Samam! Rendu perum nalla aadinom. Coffee kudikkalaam vaa.', e: 'A tie! We both played well. Coffee time.' },
    ],
  };

  const last = {};
  function line(kind) {
    const pool = LINES[kind];
    if (!pool) return null;
    let i = (Math.random() * pool.length) | 0;
    if (pool.length > 1 && i === last[kind]) i = (i + 1) % pool.length;
    last[kind] = i;
    return pool[i];
  }

  Object.assign(PZ, { paatiLine: line });
})();
