import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "images", "entities");

const palettes = {
  human_states: { sky: "#eff6ff", sky2: "#dbeafe", panel: "#ffffff", accent: "#2563eb", ink: "#0f172a", ground: "#dbeafe" },
  animals: { sky: "#ecfeff", sky2: "#dcfce7", panel: "#ffffff", accent: "#059669", ink: "#052e16", ground: "#d1fae5" },
  plants_fungi_microbes: { sky: "#fefce8", sky2: "#dcfce7", panel: "#fffef5", accent: "#65a30d", ink: "#1a2e05", ground: "#d9f99d" },
  machines_ai: { sky: "#eff6ff", sky2: "#e0e7ff", panel: "#ffffff", accent: "#4f46e5", ink: "#172554", ground: "#c7d2fe" },
  collectives_systems: { sky: "#f8fafc", sky2: "#e2e8f0", panel: "#ffffff", accent: "#334155", ink: "#0f172a", ground: "#cbd5e1" },
  planetary_cosmic: { sky: "#dbeafe", sky2: "#ddd6fe", panel: "#f8fafc", accent: "#7c3aed", ink: "#1e1b4b", ground: "#c4b5fd" },
  named_humans: { sky: "#fff7ed", sky2: "#fef3c7", panel: "#ffffff", accent: "#b45309", ink: "#0f172a", ground: "#fde68a" }
};

const entities = [
  { slug: "you", category: "human_states", scene: figureStanding },
  { slug: "you-asleep", category: "human_states", scene: figureSleeping },
  { slug: "you-dreaming", category: "human_states", scene: figureDreaming },
  { slug: "you-very-drunk", category: "human_states", scene: figureDrunk },
  { slug: "you-under-anesthesia", category: "human_states", scene: figureAnesthesia },
  { slug: "newborn-baby", category: "human_states", scene: newbornBaby },
  { slug: "chimpanzee", category: "animals", scene: chimpanzee },
  { slug: "crow", category: "animals", scene: crow },
  { slug: "octopus", category: "animals", scene: octopus },
  { slug: "jellyfish", category: "animals", scene: jellyfish },
  { slug: "bee", category: "animals", scene: bee },
  { slug: "ant-colony", category: "animals", scene: antColony },
  { slug: "oak-tree", category: "plants_fungi_microbes", scene: oakTree },
  { slug: "venus-flytrap", category: "plants_fungi_microbes", scene: venusFlytrap },
  { slug: "carrot", category: "plants_fungi_microbes", scene: carrot },
  { slug: "mushroom", category: "plants_fungi_microbes", scene: mushroom },
  { slug: "slime-mold", category: "plants_fungi_microbes", scene: slimeMold },
  { slug: "bacterium", category: "plants_fungi_microbes", scene: bacterium },
  { slug: "chatgpt", category: "machines_ai", scene: chatgpt },
  { slug: "humanoid-robot", category: "machines_ai", scene: humanoidRobot },
  { slug: "corporation", category: "collectives_systems", scene: corporation },
  { slug: "city", category: "collectives_systems", scene: city },
  { slug: "internet", category: "collectives_systems", scene: internet },
  { slug: "coral-polyp", category: "animals", scene: coralPolyp },
  { slug: "coral-reef", category: "plants_fungi_microbes", scene: coralReef },
  { slug: "earth", category: "planetary_cosmic", scene: earth },
  { slug: "universe", category: "planetary_cosmic", scene: universe },
  { slug: "rock", category: "planetary_cosmic", scene: rock },
  { slug: "dog", category: "animals", scene: dog },
  { slug: "dolphin", category: "animals", scene: dolphin },
  { slug: "elephant", category: "animals", scene: elephant },
  { slug: "blue-whale", category: "animals", scene: blueWhale },
  { slug: "goldfish", category: "animals", scene: goldfish },
  { slug: "salmon", category: "animals", scene: salmon },
  { slug: "spider", category: "animals", scene: spider },
  { slug: "fruit-fly", category: "animals", scene: fruitFly },
  { slug: "fetus", category: "human_states", scene: fetus },
  { slug: "person-in-coma", category: "human_states", scene: personInComa },
  { slug: "meditating-monk", category: "human_states", scene: meditatingMonk },
  { slug: "thermostat", category: "machines_ai", scene: thermostat },
  { slug: "self-driving-car", category: "machines_ai", scene: selfDrivingCar },
  { slug: "einstein", category: "named_humans", scene: einstein },
  { slug: "picasso", category: "named_humans", scene: picasso },
  { slug: "marie-curie", category: "named_humans", scene: marieCurie },
  { slug: "frida-kahlo", category: "named_humans", scene: fridaKahlo },
  { slug: "beehive", category: "collectives_systems", scene: beehive },
  { slug: "virus", category: "plants_fungi_microbes", scene: virus },
  { slug: "smartphone", category: "machines_ai", scene: smartphone },
  { slug: "black-hole", category: "planetary_cosmic", scene: blackHole },
  { slug: "ecosystem", category: "collectives_systems", scene: ecosystem }
];

fs.mkdirSync(outDir, { recursive: true });

for (const entity of entities) {
  const palette = palettes[entity.category];
  const svg = renderScene(entity.slug, palette, entity.scene(palette));
  fs.writeFileSync(path.join(outDir, `${entity.slug}.svg`), svg, "utf8");
}

function renderScene(slug, palette, scene) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-labelledby="${slug}-title">
  <title id="${slug}-title">${slug}</title>
  <defs>
    <linearGradient id="${slug}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.sky}" />
      <stop offset="100%" stop-color="${palette.sky2}" />
    </linearGradient>
    <linearGradient id="${slug}-floor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${palette.ground}" />
      <stop offset="100%" stop-color="${palette.panel}" />
    </linearGradient>
    <radialGradient id="${slug}-sun" cx="50%" cy="22%" r="58%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <filter id="${slug}-shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.14" />
    </filter>
    <filter id="${slug}-soft" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#ffffff" flood-opacity="0.2" />
    </filter>
  </defs>
  <rect width="1200" height="900" rx="48" fill="url(#${slug}-bg)" />
  <rect width="1200" height="900" rx="48" fill="url(#${slug}-sun)" opacity="0.72" />
  <circle cx="150" cy="132" r="94" fill="${palette.panel}" opacity="0.22" />
  <circle cx="1042" cy="126" r="126" fill="${palette.panel}" opacity="0.18" />
  <path d="M0 650 C132 614 258 604 390 618 C498 630 578 654 678 654 C796 654 886 616 1012 612 C1090 610 1148 624 1200 650 V900 H0 Z" fill="${palette.panel}" opacity="0.12" />
  <path d="M0 742 C180 700 358 684 540 706 S908 756 1200 736 V900 H0 Z" fill="url(#${slug}-floor)" opacity="0.98" />
  <path d="M0 748 C220 724 362 710 546 722 C742 734 920 746 1200 732" stroke="#ffffff" stroke-opacity="0.34" stroke-width="10" fill="none" />
  <ellipse cx="600" cy="740" rx="320" ry="54" fill="#0f172a" opacity="0.08" />
  <g filter="url(#${slug}-shadow)">${scene}</g>
</svg>`;
}

function figureStanding(p) {
  return `
  <circle cx="600" cy="272" r="86" fill="#f2c9a5" />
  <path d="M520 250 C540 182 660 182 680 250 C658 214 624 196 600 196 C576 196 542 214 520 250 Z" fill="${p.ink}" />
  <rect x="530" y="360" width="140" height="232" rx="56" fill="${p.accent}" />
  <path d="M530 414 L432 566" stroke="#f2c9a5" stroke-width="24" stroke-linecap="round" />
  <path d="M670 414 L768 566" stroke="#f2c9a5" stroke-width="24" stroke-linecap="round" />
  <path d="M566 590 L530 742" stroke="${p.ink}" stroke-width="24" stroke-linecap="round" />
  <path d="M634 590 L670 742" stroke="${p.ink}" stroke-width="24" stroke-linecap="round" />
  <rect x="516" y="372" width="168" height="36" rx="18" fill="${p.panel}" opacity="0.18" />
  `;
}

function figureSleeping(p) {
  return `
  <rect x="214" y="520" width="772" height="132" rx="34" fill="${p.panel}" stroke="${p.accent}" stroke-width="10" />
  <rect x="256" y="558" width="688" height="58" rx="28" fill="${p.accent}" opacity="0.22" />
  <circle cx="408" cy="476" r="62" fill="#f2c9a5" />
  <path d="M352 450 C364 398 454 398 466 450 C452 420 430 406 408 406 C386 406 364 420 352 450 Z" fill="${p.ink}" />
  <path d="M478 514 C536 482 676 484 756 542" stroke="${p.accent}" stroke-width="22" stroke-linecap="round" fill="none" />
  <circle cx="862" cy="234" r="52" fill="${p.accent}" opacity="0.16" />
  <path d="M856 188 C836 218 836 252 856 280 C812 274 782 236 782 188 C782 140 812 104 856 96 C836 124 836 158 856 188 Z" fill="${p.accent}" />
  <text x="764" y="324" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="700" fill="${p.accent}">Z</text>
  <text x="828" y="274" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700" fill="${p.accent}" opacity="0.75">Z</text>
  `;
}

function figureDreaming(p) {
  return `
  <rect x="214" y="520" width="772" height="132" rx="34" fill="${p.panel}" stroke="${p.accent}" stroke-width="10" />
  <rect x="256" y="558" width="688" height="58" rx="28" fill="${p.accent}" opacity="0.18" />
  <circle cx="408" cy="476" r="62" fill="#f2c9a5" />
  <path d="M352 450 C364 398 454 398 466 450 C452 420 430 406 408 406 C386 406 364 420 352 450 Z" fill="${p.ink}" />
  <path d="M680 236 C728 176 852 180 902 242 C948 298 924 382 852 392 C822 446 724 448 680 394 C628 330 632 282 680 236 Z" fill="${p.panel}" opacity="0.96" />
  <path d="M786 224 L806 272 L856 278 L818 312 L828 362 L786 336 L744 362 L754 312 L716 278 L766 272 Z" fill="${p.accent}" />
  <circle cx="852" cy="250" r="18" fill="${p.accent}" opacity="0.45" />
  `;
}

function figureDrunk(p) {
  return `
  <circle cx="582" cy="296" r="84" fill="#f2c9a5" />
  <path d="M510 268 C524 204 642 206 658 268 C632 220 610 206 584 206 C558 206 532 220 510 268 Z" fill="${p.ink}" />
  <rect x="514" y="382" width="136" height="214" rx="58" fill="${p.accent}" transform="rotate(-10 582 490)" />
  <path d="M512 434 L420 586" stroke="#f2c9a5" stroke-width="24" stroke-linecap="round" />
  <path d="M650 428 L760 560" stroke="#f2c9a5" stroke-width="24" stroke-linecap="round" />
  <path d="M542 586 L486 742" stroke="${p.ink}" stroke-width="24" stroke-linecap="round" />
  <path d="M620 586 L680 730" stroke="${p.ink}" stroke-width="24" stroke-linecap="round" />
  <rect x="742" y="444" width="56" height="154" rx="20" fill="#ef4444" transform="rotate(-20 742 444)" />
  `;
}

function figureAnesthesia(p) {
  return `
  <rect x="208" y="514" width="782" height="136" rx="34" fill="${p.panel}" stroke="${p.accent}" stroke-width="10" />
  <rect x="252" y="558" width="698" height="56" rx="28" fill="${p.accent}" opacity="0.18" />
  <circle cx="390" cy="474" r="66" fill="#f2c9a5" />
  <path d="M334 448 C348 392 434 392 446 448 C432 418 412 404 390 404 C368 404 346 418 334 448 Z" fill="${p.ink}" />
  <rect x="806" y="206" width="72" height="180" rx="26" fill="${p.panel}" stroke="${p.accent}" stroke-width="10" />
  <path d="M842 386 C844 470 780 526 716 560" stroke="${p.accent}" stroke-width="12" fill="none" stroke-linecap="round" />
  <path d="M440 514 C520 478 640 478 742 534" stroke="${p.panel}" stroke-width="18" stroke-linecap="round" fill="none" />
  `;
}

function newbornBaby(p) {
  return `
  <path d="M420 610 C420 480 500 374 600 374 C700 374 780 480 780 610 C720 686 660 726 600 726 C540 726 480 686 420 610 Z" fill="${p.accent}" opacity="0.2" />
  <path d="M452 596 C452 500 514 426 600 426 C686 426 748 500 748 596 C700 650 648 686 600 686 C552 686 500 650 452 596 Z" fill="${p.panel}" stroke="${p.accent}" stroke-width="10" />
  <circle cx="600" cy="420" r="66" fill="#f2c9a5" />
  <path d="M548 398 C562 354 638 354 652 398" stroke="#c08457" stroke-width="10" stroke-linecap="round" fill="none" />
  <path d="M470 572 C520 628 564 654 600 654 C636 654 680 628 730 572" stroke="${p.accent}" stroke-width="20" stroke-linecap="round" fill="none" />
  `;
}

function chimpanzee(p) {
  return `
  <circle cx="600" cy="382" r="146" fill="${p.ink}" />
  <circle cx="492" cy="320" r="42" fill="${p.panel}" />
  <circle cx="708" cy="320" r="42" fill="${p.panel}" />
  <ellipse cx="600" cy="416" rx="110" ry="88" fill="${p.panel}" />
  <circle cx="558" cy="394" r="16" fill="${p.ink}" />
  <circle cx="642" cy="394" r="16" fill="${p.ink}" />
  <ellipse cx="600" cy="438" rx="22" ry="18" fill="${p.ink}" />
  `;
}

function crow(p) {
  return `
  <path d="M336 560 C434 448 580 408 738 432 C704 470 694 520 700 568 C640 592 562 608 488 610 C422 610 372 594 336 560 Z" fill="${p.ink}" />
  <path d="M706 446 C774 426 840 426 902 450 C858 484 812 500 764 498 Z" fill="${p.accent}" opacity="0.9" />
  <path d="M418 520 C472 460 544 430 612 432 C560 478 536 540 536 606 C490 602 450 584 418 520 Z" fill="#0f172a" opacity="0.72" />
  <circle cx="650" cy="462" r="10" fill="${p.panel}" />
  <circle cx="650" cy="462" r="4" fill="${p.ink}" />
  <path d="M470 610 L442 738" stroke="${p.ink}" stroke-width="16" stroke-linecap="round" />
  <path d="M540 616 L530 738" stroke="${p.ink}" stroke-width="16" stroke-linecap="round" />
  <path d="M308 690 H916" stroke="#94a3b8" stroke-width="12" stroke-linecap="round" opacity="0.36" />
  `;
}

function octopus(p) {
  return `
  <path d="M430 446 C430 316 512 242 600 242 C688 242 770 316 770 446 C770 560 690 620 600 620 C510 620 430 560 430 446 Z" fill="${p.accent}" />
  <path d="M454 594 C404 638 398 708 436 770" stroke="${p.accent}" stroke-width="24" stroke-linecap="round" fill="none" />
  <path d="M518 612 C490 678 490 738 514 794" stroke="${p.accent}" stroke-width="24" stroke-linecap="round" fill="none" />
  <path d="M586 620 C584 698 592 748 612 794" stroke="${p.accent}" stroke-width="24" stroke-linecap="round" fill="none" />
  <path d="M654 612 C680 678 712 736 748 782" stroke="${p.accent}" stroke-width="24" stroke-linecap="round" fill="none" />
  <circle cx="548" cy="430" r="14" fill="${p.panel}" />
  <circle cx="652" cy="430" r="14" fill="${p.panel}" />
  `;
}

function jellyfish(p) {
  return `
  <path d="M426 450 C436 330 514 258 600 258 C686 258 764 330 774 450 Z" fill="${p.panel}" opacity="0.98" />
  <path d="M474 452 H726 C716 558 668 624 600 624 C532 624 484 558 474 452 Z" fill="${p.accent}" opacity="0.55" />
  <path d="M520 620 C492 692 488 742 518 792" stroke="${p.ink}" stroke-width="14" stroke-linecap="round" fill="none" />
  <path d="M600 628 C594 700 600 750 624 798" stroke="${p.ink}" stroke-width="14" stroke-linecap="round" fill="none" />
  <path d="M678 620 C700 690 722 742 748 794" stroke="${p.ink}" stroke-width="14" stroke-linecap="round" fill="none" />
  `;
}

function bee(p) {
  return `
  <ellipse cx="610" cy="462" rx="168" ry="104" fill="#facc15" />
  <ellipse cx="538" cy="382" rx="88" ry="62" fill="${p.panel}" opacity="0.85" />
  <ellipse cx="692" cy="382" rx="88" ry="62" fill="${p.panel}" opacity="0.85" />
  <rect x="494" y="360" width="30" height="198" rx="15" fill="${p.ink}" />
  <rect x="590" y="352" width="30" height="206" rx="15" fill="${p.ink}" />
  <rect x="686" y="360" width="30" height="198" rx="15" fill="${p.ink}" />
  <circle cx="452" cy="448" r="52" fill="${p.ink}" />
  `;
}

function antColony(p) {
  return `
  <path d="M446 690 C454 578 520 496 600 496 C680 496 746 578 754 690 Z" fill="${p.accent}" opacity="0.3" />
  <path d="M318 670 C410 590 510 552 600 552 C690 552 794 590 882 670" stroke="${p.ink}" stroke-width="18" fill="none" stroke-linecap="round" />
  ${[384, 466, 546, 630, 714, 798].map((x, i) => `
  <circle cx="${x}" cy="${600 + (i % 2) * 20}" r="26" fill="${p.ink}" />
  <circle cx="${x - 34}" cy="${592 + (i % 2) * 20}" r="18" fill="${p.ink}" />
  <circle cx="${x + 34}" cy="${592 + (i % 2) * 20}" r="18" fill="${p.ink}" />`).join("")}
  `;
}

function oakTree(p) {
  return `
  <rect x="542" y="374" width="116" height="284" rx="28" fill="#7c2d12" />
  <circle cx="600" cy="308" r="168" fill="${p.accent}" />
  <circle cx="496" cy="338" r="104" fill="#4d7c0f" opacity="0.96" />
  <circle cx="710" cy="338" r="104" fill="#4d7c0f" opacity="0.96" />
  `;
}

function venusFlytrap(p) {
  return `
  <path d="M600 680 C594 598 594 512 600 430" stroke="${p.accent}" stroke-width="24" fill="none" stroke-linecap="round" />
  <path d="M456 410 C516 286 654 286 716 410 C658 450 550 452 456 410 Z" fill="${p.accent}" />
  <path d="M494 404 C544 338 628 338 678 404" stroke="${p.ink}" stroke-width="14" stroke-linecap="round" fill="none" />
  <path d="M482 414 L442 344" stroke="${p.ink}" stroke-width="7" />
  <path d="M520 388 L498 302" stroke="${p.ink}" stroke-width="7" />
  <path d="M680 388 L702 302" stroke="${p.ink}" stroke-width="7" />
  <path d="M718 414 L758 344" stroke="${p.ink}" stroke-width="7" />
  `;
}

function carrot(p) {
  return `
  <path d="M606 668 C544 598 490 484 524 330 C560 348 642 348 676 330 C712 484 660 598 606 668 Z" fill="#f97316" />
  <path d="M560 308 C522 256 484 234 436 214" stroke="${p.accent}" stroke-width="22" stroke-linecap="round" fill="none" />
  <path d="M606 286 C606 232 622 182 656 140" stroke="${p.accent}" stroke-width="22" stroke-linecap="round" fill="none" />
  <path d="M652 308 C698 256 748 232 800 214" stroke="${p.accent}" stroke-width="22" stroke-linecap="round" fill="none" />
  `;
}

function mushroom(p) {
  return `
  <path d="M350 434 C394 294 508 214 600 214 C692 214 806 294 850 434 Z" fill="#b45309" />
  <rect x="536" y="434" width="128" height="222" rx="44" fill="#fef3c7" />
  <circle cx="488" cy="356" r="20" fill="#fef3c7" />
  <circle cx="600" cy="314" r="24" fill="#fef3c7" />
  <circle cx="712" cy="356" r="20" fill="#fef3c7" />
  `;
}

function slimeMold(p) {
  return `
  <path d="M332 566 C388 474 500 428 596 446 C648 388 750 374 836 428 C898 466 918 560 890 630 C842 696 734 730 648 708 C562 734 446 718 384 648 C350 622 326 594 332 566 Z" fill="#f59e0b" opacity="0.94" />
  <circle cx="466" cy="560" r="24" fill="${p.panel}" opacity="0.92" />
  <circle cx="612" cy="526" r="28" fill="${p.panel}" opacity="0.92" />
  <circle cx="758" cy="576" r="24" fill="${p.panel}" opacity="0.92" />
  `;
}

function bacterium(p) {
  return `
  <ellipse cx="600" cy="484" rx="222" ry="118" fill="#34d399" />
  <ellipse cx="600" cy="484" rx="176" ry="72" fill="${p.panel}" opacity="0.45" />
  <path d="M388 456 C330 404 306 356 308 286" stroke="${p.ink}" stroke-width="12" stroke-linecap="round" fill="none" />
  <path d="M810 508 C876 552 900 612 900 676" stroke="${p.ink}" stroke-width="12" stroke-linecap="round" fill="none" />
  <circle cx="546" cy="474" r="18" fill="${p.ink}" opacity="0.22" />
  <circle cx="642" cy="506" r="24" fill="${p.ink}" opacity="0.22" />
  `;
}

function chatgpt(p) {
  return `
  <rect x="260" y="664" width="680" height="30" rx="15" fill="#94a3b8" opacity="0.28" />
  <rect x="318" y="216" width="564" height="372" rx="28" fill="#0f172a" />
  <rect x="344" y="242" width="512" height="318" rx="18" fill="${p.panel}" />
  <rect x="514" y="588" width="168" height="34" rx="12" fill="#475569" />
  <circle cx="410" cy="330" r="34" fill="${p.accent}" opacity="0.12" />
  <path d="M466 316 H606 C642 316 670 344 670 380 C670 416 642 444 606 444 H474 C442 444 418 420 418 390 V364 C418 336 438 316 466 316 Z" fill="${p.accent}" opacity="0.18" />
  <path d="M560 430 H744 C778 430 804 456 804 490 C804 526 778 552 744 552 H602 C556 552 520 516 520 470 C520 448 538 430 560 430 Z" fill="${p.accent}" opacity="0.28" />
  <rect x="438" y="488" width="152" height="20" rx="10" fill="${p.accent}" opacity="0.12" />
  <rect x="610" y="460" width="118" height="18" rx="9" fill="${p.panel}" opacity="0.92" />
  <rect x="468" y="348" width="118" height="18" rx="9" fill="${p.panel}" opacity="0.9" />
  <rect x="376" y="274" width="448" height="30" rx="15" fill="#e2e8f0" />
  <circle cx="402" cy="289" r="8" fill="#ef4444" />
  <circle cx="430" cy="289" r="8" fill="#f59e0b" />
  <circle cx="458" cy="289" r="8" fill="#22c55e" />
  `;
}

function humanoidRobot(p) {
  return `
  <rect x="486" y="214" width="228" height="206" rx="44" fill="${p.panel}" stroke="${p.ink}" stroke-width="16" />
  <circle cx="552" cy="320" r="16" fill="${p.accent}" />
  <circle cx="648" cy="320" r="16" fill="${p.accent}" />
  <rect x="560" y="372" width="80" height="18" rx="9" fill="${p.ink}" />
  <rect x="518" y="426" width="164" height="184" rx="32" fill="#e2e8f0" stroke="${p.ink}" stroke-width="16" />
  <path d="M518 468 L440 586" stroke="${p.ink}" stroke-width="18" stroke-linecap="round" />
  <path d="M682 468 L760 586" stroke="${p.ink}" stroke-width="18" stroke-linecap="round" />
  <path d="M560 610 L522 736" stroke="${p.ink}" stroke-width="18" stroke-linecap="round" />
  <path d="M640 610 L678 736" stroke="${p.ink}" stroke-width="18" stroke-linecap="round" />
  <circle cx="600" cy="520" r="24" fill="${p.accent}" opacity="0.7" />
  <rect x="548" y="558" width="104" height="16" rx="8" fill="${p.panel}" opacity="0.75" />
  `;
}

function corporation(p) {
  return `
  <rect x="382" y="250" width="436" height="420" rx="28" fill="#e2e8f0" stroke="${p.ink}" stroke-width="16" />
  <rect x="430" y="214" width="338" height="48" rx="18" fill="${p.panel}" opacity="0.9" />
  <rect x="470" y="226" width="124" height="22" rx="11" fill="${p.accent}" opacity="0.22" />
  <rect x="320" y="670" width="560" height="34" rx="17" fill="#94a3b8" opacity="0.32" />
  ${[456, 572, 688].map((x) => `
  <rect x="${x}" y="320" width="70" height="70" rx="12" fill="${p.panel}" />
  <rect x="${x}" y="432" width="70" height="70" rx="12" fill="${p.panel}" />`).join("")}
  <rect x="550" y="560" width="100" height="110" rx="12" fill="#cbd5e1" />
  <rect x="590" y="226" width="128" height="22" rx="11" fill="${p.accent}" opacity="0.12" />
  `;
}

function city(p) {
  return `
  <path d="M0 724 C120 700 250 688 372 700 C484 710 582 742 668 742 C774 742 842 694 962 688 C1062 684 1130 700 1200 722 V900 H0 Z" fill="#a5b4fc" opacity="0.16" />
  <rect x="264" y="430" width="126" height="250" rx="16" fill="${p.ink}" />
  <rect x="404" y="342" width="146" height="338" rx="16" fill="#475569" />
  <rect x="566" y="264" width="126" height="416" rx="16" fill="#64748b" />
  <rect x="708" y="378" width="188" height="302" rx="16" fill="${p.ink}" />
  <rect x="300" y="386" width="54" height="44" rx="10" fill="${p.ink}" />
  <rect x="444" y="302" width="66" height="40" rx="10" fill="#475569" />
  <rect x="606" y="222" width="46" height="42" rx="10" fill="#64748b" />
  <circle cx="636" cy="196" r="36" fill="${p.panel}" opacity="0.94" />
  ${[300, 334].map((x) => `<rect x="${x}" y="470" width="18" height="18" rx="4" fill="${p.panel}" opacity="0.75" />`).join("")}
  ${[300, 334].map((x) => `<rect x="${x}" y="512" width="18" height="18" rx="4" fill="${p.panel}" opacity="0.75" />`).join("")}
  ${[444, 482, 520].map((x) => `<rect x="${x}" y="404" width="18" height="18" rx="4" fill="${p.panel}" opacity="0.72" />`).join("")}
  ${[444, 482, 520].map((x) => `<rect x="${x}" y="446" width="18" height="18" rx="4" fill="${p.panel}" opacity="0.72" />`).join("")}
  ${[598, 636].map((x) => `<rect x="${x}" y="330" width="18" height="18" rx="4" fill="${p.panel}" opacity="0.7" />`).join("")}
  ${[598, 636].map((x) => `<rect x="${x}" y="372" width="18" height="18" rx="4" fill="${p.panel}" opacity="0.7" />`).join("")}
  ${[756, 798, 840].map((x) => `<rect x="${x}" y="438" width="20" height="20" rx="4" fill="${p.panel}" opacity="0.74" />`).join("")}
  ${[756, 798, 840].map((x) => `<rect x="${x}" y="484" width="20" height="20" rx="4" fill="${p.panel}" opacity="0.74" />`).join("")}
  <path d="M248 686 H922" stroke="#94a3b8" stroke-width="12" stroke-linecap="round" opacity="0.4" />
  <path d="M258 706 C340 694 430 702 514 706 C604 710 710 708 892 698" stroke="#64748b" stroke-width="10" stroke-linecap="round" opacity="0.28" />
  `;
}

function internet(p) {
  return `
  <rect x="244" y="292" width="182" height="350" rx="24" fill="${p.panel}" stroke="${p.ink}" stroke-width="14" />
  <rect x="774" y="292" width="182" height="350" rx="24" fill="${p.panel}" stroke="${p.ink}" stroke-width="14" />
  ${[338, 430, 522].map((y) => `
  <rect x="284" y="${y}" width="102" height="38" rx="12" fill="${p.accent}" opacity="0.18" />
  <circle cx="350" cy="${y + 19}" r="8" fill="${p.accent}" />
  <circle cx="374" cy="${y + 19}" r="8" fill="${p.accent}" opacity="0.55" />
  <rect x="814" y="${y}" width="102" height="38" rx="12" fill="${p.accent}" opacity="0.18" />
  <circle cx="880" cy="${y + 19}" r="8" fill="${p.accent}" />
  <circle cx="904" cy="${y + 19}" r="8" fill="${p.accent}" opacity="0.55" />`).join("")}
  <circle cx="600" cy="448" r="170" fill="${p.panel}" stroke="${p.ink}" stroke-width="14" />
  <ellipse cx="600" cy="448" rx="120" ry="170" fill="none" stroke="${p.accent}" stroke-width="10" opacity="0.5" />
  <ellipse cx="600" cy="448" rx="56" ry="170" fill="none" stroke="${p.accent}" stroke-width="10" opacity="0.5" />
  <path d="M430 448 H770" stroke="${p.accent}" stroke-width="10" opacity="0.45" />
  <path d="M456 374 C544 402 656 402 744 374" stroke="${p.accent}" stroke-width="10" opacity="0.4" fill="none" />
  <path d="M456 522 C544 494 656 494 744 522" stroke="${p.accent}" stroke-width="10" opacity="0.4" fill="none" />
  <path d="M426 430 C488 420 520 394 546 364" stroke="${p.ink}" stroke-width="12" fill="none" stroke-linecap="round" />
  <path d="M774 430 C712 420 680 394 654 364" stroke="${p.ink}" stroke-width="12" fill="none" stroke-linecap="round" />
  <circle cx="546" cy="364" r="12" fill="${p.accent}" />
  <circle cx="654" cy="364" r="12" fill="${p.accent}" />
  `;
}

function coralPolyp(p) {
  return `
  <path d="M420 718 C474 688 528 660 600 650 C672 660 726 688 780 718" stroke="#0ea5e9" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.42" />
  <path d="M600 680 C590 620 590 556 600 468" stroke="#f97316" stroke-width="22" stroke-linecap="round" fill="none" />
  <ellipse cx="600" cy="406" rx="82" ry="68" fill="#fb923c" />
  <path d="M600 344 C578 286 566 236 562 190" stroke="#fb923c" stroke-width="14" stroke-linecap="round" />
  <path d="M646 360 C702 322 744 276 782 224" stroke="#fb923c" stroke-width="14" stroke-linecap="round" />
  <path d="M554 360 C498 322 456 278 418 228" stroke="#fb923c" stroke-width="14" stroke-linecap="round" />
  <path d="M664 414 C734 414 792 400 846 368" stroke="#fb923c" stroke-width="14" stroke-linecap="round" />
  <path d="M536 414 C466 414 408 400 354 368" stroke="#fb923c" stroke-width="14" stroke-linecap="round" />
  <path d="M650 456 C710 478 756 514 792 558" stroke="#fb923c" stroke-width="14" stroke-linecap="round" />
  <path d="M550 456 C490 478 444 514 408 558" stroke="#fb923c" stroke-width="14" stroke-linecap="round" />
  <circle cx="600" cy="404" r="24" fill="#fdba74" opacity="0.85" />
  `;
}

function coralReef(p) {
  return `
  <path d="M340 696 C354 604 392 536 458 462" stroke="#fb7185" stroke-width="24" stroke-linecap="round" fill="none" />
  <path d="M458 696 C476 584 512 498 562 422" stroke="#f97316" stroke-width="28" stroke-linecap="round" fill="none" />
  <path d="M590 696 C602 606 624 534 662 458" stroke="#f43f5e" stroke-width="26" stroke-linecap="round" fill="none" />
  <path d="M714 696 C728 596 764 524 830 450" stroke="#fb7185" stroke-width="24" stroke-linecap="round" fill="none" />
  <circle cx="458" cy="452" r="28" fill="#fda4af" />
  <circle cx="562" cy="412" r="30" fill="#fdba74" />
  <circle cx="662" cy="446" r="28" fill="#fda4af" />
  <circle cx="830" cy="440" r="30" fill="#fdba74" />
  `;
}

function earth(p) {
  return `
  <circle cx="600" cy="452" r="216" fill="#60a5fa" />
  <path d="M492 294 C548 286 590 318 614 356 C658 344 708 354 748 398 C712 454 664 488 616 504 C598 560 544 606 478 610 C424 566 398 512 402 450 C434 410 454 346 492 294 Z" fill="#16a34a" opacity="0.96" />
  <circle cx="600" cy="452" r="216" fill="none" stroke="${p.panel}" stroke-width="12" opacity="0.7" />
  `;
}

function universe(p) {
  return `
  <circle cx="600" cy="452" r="216" fill="#312e81" />
  <path d="M428 452 C466 388 532 356 600 356 C694 356 772 420 772 500 C772 580 694 644 600 644 C522 644 454 602 424 540" stroke="#c4b5fd" stroke-width="18" stroke-linecap="round" fill="none" />
  <circle cx="600" cy="452" r="48" fill="${p.panel}" opacity="0.94" />
  <circle cx="520" cy="342" r="12" fill="${p.panel}" />
  <circle cx="760" cy="308" r="10" fill="${p.panel}" />
  <circle cx="434" cy="594" r="12" fill="${p.panel}" />
  `;
}

function rock(p) {
  return `
  <path d="M374 614 L446 392 L696 334 L852 470 L798 668 L534 702 Z" fill="#94a3b8" />
  <path d="M446 392 L696 334 L646 478 L516 508 Z" fill="#cbd5e1" opacity="0.92" />
  <path d="M516 508 L646 478 L798 668 L534 702 Z" fill="#64748b" opacity="0.95" />
  `;
}

function dog(p) {
  return `
  <ellipse cx="600" cy="480" rx="140" ry="110" fill="${p.accent}" />
  <circle cx="600" cy="340" r="90" fill="${p.accent}" />
  <path d="M528 280 L488 196 L548 264" fill="${p.ink}" />
  <path d="M672 280 L712 196 L652 264" fill="${p.ink}" />
  <circle cx="570" cy="330" r="12" fill="${p.panel}" />
  <circle cx="630" cy="330" r="12" fill="${p.panel}" />
  <circle cx="570" cy="332" r="6" fill="${p.ink}" />
  <circle cx="630" cy="332" r="6" fill="${p.ink}" />
  <ellipse cx="600" cy="374" rx="18" ry="14" fill="${p.ink}" />
  <path d="M600 388 C600 408 584 418 576 408" stroke="${p.ink}" stroke-width="6" fill="none" stroke-linecap="round" />
  <path d="M600 388 C600 408 616 418 624 408" stroke="${p.ink}" stroke-width="6" fill="none" stroke-linecap="round" />
  <path d="M484 556 L456 738" stroke="${p.ink}" stroke-width="22" stroke-linecap="round" />
  <path d="M716 556 L744 738" stroke="${p.ink}" stroke-width="22" stroke-linecap="round" />
  <path d="M548 572 L530 738" stroke="${p.ink}" stroke-width="22" stroke-linecap="round" />
  <path d="M652 572 L670 738" stroke="${p.ink}" stroke-width="22" stroke-linecap="round" />
  <path d="M740 480 C782 460 820 476 838 510" stroke="${p.accent}" stroke-width="18" stroke-linecap="round" fill="none" />
  `;
}

function dolphin(p) {
  return `
  <path d="M320 480 C380 380 500 340 620 360 C740 380 840 440 880 520 C860 580 780 600 700 580 C620 560 520 560 440 580 C380 600 340 560 320 480 Z" fill="${p.accent}" />
  <path d="M340 470 C380 400 480 360 600 370 C700 380 780 420 820 480" fill="#4ade80" opacity="0.2" />
  <circle cx="420" cy="440" r="10" fill="${p.panel}" />
  <circle cx="420" cy="442" r="5" fill="${p.ink}" />
  <path d="M330 470 C310 430 280 420 260 430" stroke="${p.accent}" stroke-width="14" stroke-linecap="round" fill="none" />
  <path d="M560 356 C540 290 570 240 620 220" stroke="${p.accent}" stroke-width="16" stroke-linecap="round" fill="none" />
  <path d="M870 510 C910 480 940 500 950 540" stroke="${p.accent}" stroke-width="14" stroke-linecap="round" fill="none" />
  <path d="M870 510 C910 540 940 520 950 480" stroke="${p.accent}" stroke-width="14" stroke-linecap="round" fill="none" />
  `;
}

function elephant(p) {
  return `
  <ellipse cx="600" cy="480" rx="200" ry="150" fill="#94a3b8" />
  <circle cx="540" cy="330" r="110" fill="#94a3b8" />
  <circle cx="440" cy="300" r="60" fill="#94a3b8" />
  <circle cx="440" cy="300" r="48" fill="#cbd5e1" opacity="0.4" />
  <circle cx="580" cy="310" r="14" fill="${p.panel}" />
  <circle cx="580" cy="312" r="7" fill="${p.ink}" />
  <path d="M518 390 C496 460 480 540 460 620 C450 660 470 680 498 670 C520 650 530 610 540 560" stroke="#94a3b8" stroke-width="36" stroke-linecap="round" fill="none" />
  <path d="M440 570 L416 738" stroke="#94a3b8" stroke-width="30" stroke-linecap="round" />
  <path d="M560 588 L540 738" stroke="#94a3b8" stroke-width="30" stroke-linecap="round" />
  <path d="M680 570 L700 738" stroke="#94a3b8" stroke-width="30" stroke-linecap="round" />
  <path d="M760 550 L790 738" stroke="#94a3b8" stroke-width="30" stroke-linecap="round" />
  <path d="M510 380 C520 392 540 392 550 380" stroke="${p.ink}" stroke-width="4" fill="none" />
  `;
}

function blueWhale(p) {
  return `
  <path d="M220 460 C300 360 460 320 620 340 C780 360 920 420 960 500 C940 580 840 620 720 610 C580 600 400 590 300 560 C240 540 210 500 220 460 Z" fill="#3b82f6" />
  <path d="M260 460 C320 390 460 350 600 360 C720 370 820 410 860 470" fill="#60a5fa" opacity="0.4" />
  <circle cx="360" cy="430" r="10" fill="${p.panel}" />
  <circle cx="360" cy="432" r="5" fill="${p.ink}" />
  <path d="M950 490 C1000 450 1040 460 1060 500" stroke="#3b82f6" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M950 490 C1000 530 1040 520 1060 480" stroke="#3b82f6" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M300 540 C340 560 380 556 400 540" stroke="#60a5fa" stroke-width="8" fill="none" opacity="0.5" />
  <path d="M500 560 C540 576 580 572 600 556" stroke="#60a5fa" stroke-width="8" fill="none" opacity="0.5" />
  `;
}

function goldfish(p) {
  return `
  <ellipse cx="600" cy="460" rx="140" ry="100" fill="#f97316" />
  <ellipse cx="600" cy="460" rx="120" ry="80" fill="#fb923c" opacity="0.5" />
  <circle cx="540" cy="440" r="14" fill="${p.panel}" />
  <circle cx="540" cy="442" r="7" fill="${p.ink}" />
  <path d="M740 460 C800 420 840 430 860 470 C840 510 800 500 740 460 Z" fill="#f97316" />
  <path d="M580 370 C610 340 640 340 660 370" stroke="#f97316" stroke-width="14" stroke-linecap="round" fill="none" />
  <path d="M520 480 C540 500 560 500 580 480" stroke="${p.ink}" stroke-width="5" fill="none" />
  <circle cx="480" cy="460" r="6" fill="#fdba74" opacity="0.6" />
  <circle cx="520" cy="500" r="4" fill="#fdba74" opacity="0.5" />
  `;
}

function salmon(p) {
  return `
  <path d="M280 470 C360 390 500 360 640 380 C780 400 880 460 920 500 C880 540 780 580 640 570 C500 560 360 530 280 470 Z" fill="#f87171" />
  <path d="M320 470 C380 410 500 380 620 390 C740 400 840 450 880 490" fill="#fca5a5" opacity="0.4" />
  <circle cx="380" cy="450" r="10" fill="${p.panel}" />
  <circle cx="380" cy="452" r="5" fill="${p.ink}" />
  <path d="M910 490 C950 460 980 470 990 500" stroke="#f87171" stroke-width="14" stroke-linecap="round" fill="none" />
  <path d="M910 490 C950 520 980 510 990 480" stroke="#f87171" stroke-width="14" stroke-linecap="round" fill="none" />
  <circle cx="500" cy="430" r="4" fill="#0f172a" opacity="0.12" />
  <circle cx="560" cy="440" r="4" fill="#0f172a" opacity="0.12" />
  <circle cx="620" cy="430" r="4" fill="#0f172a" opacity="0.12" />
  <circle cx="680" cy="440" r="4" fill="#0f172a" opacity="0.12" />
  `;
}

function spider(p) {
  return `
  <ellipse cx="600" cy="440" rx="56" ry="48" fill="${p.ink}" />
  <circle cx="600" cy="380" r="36" fill="${p.ink}" />
  <circle cx="586" cy="372" r="8" fill="#ef4444" />
  <circle cx="614" cy="372" r="8" fill="#ef4444" />
  <circle cx="580" cy="388" r="6" fill="#ef4444" opacity="0.7" />
  <circle cx="620" cy="388" r="6" fill="#ef4444" opacity="0.7" />
  ${[[-1, -30], [-1, -10], [-1, 10], [-1, 30], [1, -30], [1, -10], [1, 10], [1, 30]].map(([side, angle], i) => {
    const startX = 600 + side * 40;
    const startY = 430 + (i % 4) * 10 - 15;
    const midX = startX + side * 120;
    const midY = startY - 60 + angle;
    const endX = midX + side * 80;
    const endY = midY + 120;
    return `<path d="M${startX} ${startY} Q${midX} ${midY} ${endX} ${endY}" stroke="${p.ink}" stroke-width="6" fill="none" stroke-linecap="round" />`;
  }).join("\n  ")}
  `;
}

function fruitFly(p) {
  return `
  <ellipse cx="600" cy="480" rx="48" ry="60" fill="${p.accent}" />
  <circle cx="600" cy="400" r="32" fill="${p.accent}" />
  <circle cx="584" cy="392" r="14" fill="#ef4444" opacity="0.8" />
  <circle cx="616" cy="392" r="14" fill="#ef4444" opacity="0.8" />
  <ellipse cx="530" cy="420" rx="72" ry="28" fill="${p.panel}" opacity="0.65" transform="rotate(-20 530 420)" />
  <ellipse cx="670" cy="420" rx="72" ry="28" fill="${p.panel}" opacity="0.65" transform="rotate(20 670 420)" />
  <path d="M588 370 C576 330 560 300 548 280" stroke="${p.ink}" stroke-width="4" stroke-linecap="round" fill="none" />
  <path d="M612 370 C624 330 640 300 652 280" stroke="${p.ink}" stroke-width="4" stroke-linecap="round" fill="none" />
  <path d="M570 520 L548 580" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" />
  <path d="M600 530 L600 590" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" />
  <path d="M630 520 L652 580" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" />
  `;
}

function fetus(p) {
  return `
  <ellipse cx="600" cy="460" rx="180" ry="200" fill="${p.accent}" opacity="0.15" />
  <ellipse cx="600" cy="460" rx="150" ry="170" fill="${p.accent}" opacity="0.12" />
  <circle cx="560" cy="380" r="56" fill="#f2c9a5" />
  <path d="M540 420 C520 480 530 540 560 580 C580 610 620 620 650 600 C680 570 680 510 660 460" stroke="#f2c9a5" stroke-width="32" fill="none" stroke-linecap="round" />
  <path d="M528 440 C500 460 480 480 476 510" stroke="#f2c9a5" stroke-width="16" stroke-linecap="round" fill="none" />
  <path d="M620 580 C640 610 650 640 644 660" stroke="#f2c9a5" stroke-width="16" stroke-linecap="round" fill="none" />
  <path d="M580 600 C570 630 560 656 548 670" stroke="#f2c9a5" stroke-width="16" stroke-linecap="round" fill="none" />
  `;
}

function personInComa(p) {
  return `
  <rect x="214" y="520" width="772" height="132" rx="34" fill="${p.panel}" stroke="${p.accent}" stroke-width="10" />
  <rect x="256" y="558" width="688" height="58" rx="28" fill="${p.accent}" opacity="0.18" />
  <circle cx="408" cy="476" r="62" fill="#f2c9a5" />
  <path d="M352 450 C364 398 454 398 466 450 C452 420 430 406 408 406 C386 406 364 420 352 450 Z" fill="${p.ink}" />
  <path d="M478 514 C536 482 676 484 756 542" stroke="${p.accent}" stroke-width="22" stroke-linecap="round" fill="none" />
  <rect x="780" y="280" width="60" height="160" rx="22" fill="${p.panel}" stroke="${p.accent}" stroke-width="8" />
  <path d="M810 440 C812 480 790 510 760 540" stroke="${p.accent}" stroke-width="10" fill="none" stroke-linecap="round" />
  <rect x="766" y="280" width="88" height="30" rx="10" fill="${p.accent}" opacity="0.3" />
  <circle cx="810" cy="350" r="6" fill="#22c55e" />
  <path d="M790 378 L810 362 L830 378 L810 396 Z" fill="${p.accent}" opacity="0.2" />
  `;
}


function meditatingMonk(p) {
  return `
  <circle cx="600" cy="296" r="72" fill="#f2c9a5" />
  <path d="M540 274 C550 232 650 232 660 274 C648 244 630 234 600 234 C570 234 552 244 540 274 Z" fill="#f97316" opacity="0.5" />
  <path d="M480 402 C480 380 530 360 600 360 C670 360 720 380 720 402 L720 580 C720 610 670 640 600 640 C530 640 480 610 480 580 Z" fill="#f97316" />
  <path d="M480 420 L420 530 C430 550 454 558 478 550" stroke="#f97316" stroke-width="20" fill="none" stroke-linecap="round" />
  <path d="M720 420 L780 530 C770 550 746 558 722 550" stroke="#f97316" stroke-width="20" fill="none" stroke-linecap="round" />
  <path d="M520 560 C520 590 560 614 600 614 C640 614 680 590 680 560" stroke="${p.ink}" stroke-width="18" stroke-linecap="round" fill="none" />
  <circle cx="600" cy="210" r="24" fill="#f59e0b" opacity="0.25" />
  <circle cx="600" cy="170" r="16" fill="#f59e0b" opacity="0.15" />
  <circle cx="600" cy="140" r="10" fill="#f59e0b" opacity="0.1" />
  `;
}

function thermostat(p) {
  return `
  <rect x="458" y="236" width="284" height="408" rx="44" fill="${p.panel}" stroke="${p.ink}" stroke-width="14" />
  <circle cx="600" cy="440" r="120" fill="${p.panel}" stroke="${p.accent}" stroke-width="10" />
  <circle cx="600" cy="440" r="96" fill="${p.accent}" opacity="0.08" />
  <text x="556" y="460" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="${p.accent}">72</text>
  <text x="644" y="432" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="${p.accent}" opacity="0.6">\u00B0</text>
  <rect x="560" y="286" width="80" height="28" rx="14" fill="${p.accent}" opacity="0.18" />
  <circle cx="600" cy="580" r="8" fill="${p.accent}" opacity="0.4" />
  `;
}

function selfDrivingCar(p) {
  return `
  <path d="M310 520 L370 380 C400 340 500 310 600 310 C700 310 800 340 830 380 L890 520 Z" fill="${p.ink}" />
  <rect x="280" y="520" width="640" height="120" rx="28" fill="${p.ink}" />
  <path d="M400 380 C440 340 520 320 600 320 C680 320 760 340 800 380 L760 420 C720 396 660 380 600 380 C540 380 480 396 440 420 Z" fill="${p.accent}" opacity="0.2" />
  <rect x="380" y="390" width="240" height="100" rx="18" fill="#60a5fa" opacity="0.4" />
  <circle cx="380" cy="640" r="42" fill="#475569" />
  <circle cx="380" cy="640" r="20" fill="#94a3b8" />
  <circle cx="820" cy="640" r="42" fill="#475569" />
  <circle cx="820" cy="640" r="20" fill="#94a3b8" />
  <circle cx="340" cy="540" r="18" fill="#facc15" opacity="0.9" />
  <circle cx="860" cy="540" r="18" fill="#facc15" opacity="0.9" />
  <circle cx="520" cy="330" r="10" fill="${p.accent}" opacity="0.6" />
  <circle cx="600" cy="320" r="10" fill="${p.accent}" opacity="0.6" />
  <circle cx="680" cy="330" r="10" fill="${p.accent}" opacity="0.6" />
  <path d="M510 310 C530 280 560 264 600 260 C640 264 670 280 690 310" stroke="${p.accent}" stroke-width="8" fill="none" opacity="0.4" stroke-linecap="round" />
  `;
}

function einstein(p) {
  return `
  <circle cx="600" cy="310" r="86" fill="#f2c9a5" />
  <path d="M520 270 C510 210 530 170 570 160 C580 140 620 130 650 150 C680 140 710 160 710 190 C730 210 730 250 700 272" fill="${p.panel}" stroke="${p.ink}" stroke-width="4" />
  <path d="M556 290 L550 310" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" />
  <path d="M644 290 L650 310" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" />
  <circle cx="564" cy="304" r="8" fill="${p.ink}" />
  <circle cx="636" cy="304" r="8" fill="${p.ink}" />
  <path d="M576 350 C590 366 610 366 624 350" stroke="${p.ink}" stroke-width="5" fill="none" stroke-linecap="round" />
  <path d="M562 356 C546 372 536 390 540 410" stroke="${p.accent}" stroke-width="8" fill="none" stroke-linecap="round" />
  <rect x="520" y="400" width="160" height="210" rx="56" fill="#475569" />
  <path d="M520 440 L440 580" stroke="#f2c9a5" stroke-width="22" stroke-linecap="round" />
  <path d="M680 440 L760 580" stroke="#f2c9a5" stroke-width="22" stroke-linecap="round" />
  <path d="M566 608 L540 738" stroke="${p.ink}" stroke-width="22" stroke-linecap="round" />
  <path d="M634 608 L660 738" stroke="${p.ink}" stroke-width="22" stroke-linecap="round" />
  <rect x="760" y="540" width="120" height="80" rx="8" fill="${p.panel}" stroke="${p.accent}" stroke-width="6" />
  <text x="780" y="590" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="${p.accent}">E=mc\u00B2</text>
  `;
}

function picasso(p) {
  return `
  <circle cx="600" cy="310" r="82" fill="#f2c9a5" />
  <path d="M530 262 C540 218 660 218 670 262 C654 230 634 218 600 218 C566 218 546 230 530 262 Z" fill="${p.ink}" />
  <circle cx="566" cy="304" r="10" fill="${p.ink}" />
  <circle cx="640" cy="296" r="12" fill="${p.ink}" />
  <path d="M580 344 C592 360 608 358 618 342" stroke="${p.ink}" stroke-width="5" fill="none" />
  <path d="M566 318 L558 340 L580 332" stroke="${p.ink}" stroke-width="4" fill="none" />
  <rect x="524" y="396" width="152" height="206" rx="54" fill="#1e3a5f" />
  <rect x="530" y="410" width="140" height="30" rx="15" fill="${p.panel}" opacity="0.2" />
  <path d="M524 440 L430 578" stroke="#f2c9a5" stroke-width="22" stroke-linecap="round" />
  <path d="M676 440 L770 578" stroke="#f2c9a5" stroke-width="22" stroke-linecap="round" />
  <path d="M564 600 L540 738" stroke="${p.ink}" stroke-width="22" stroke-linecap="round" />
  <path d="M636 600 L660 738" stroke="${p.ink}" stroke-width="22" stroke-linecap="round" />
  <rect x="756" y="430" width="120" height="160" rx="8" fill="${p.panel}" stroke="${p.accent}" stroke-width="6" />
  <circle cx="796" cy="490" r="20" fill="#3b82f6" />
  <rect x="804" y="510" width="40" height="50" rx="4" fill="#f97316" />
  <path d="M776 540 L836 500" stroke="#16a34a" stroke-width="6" />
  `;
}

function marieCurie(p) {
  return `
  <circle cx="600" cy="304" r="78" fill="#f2c9a5" />
  <path d="M530 272 C524 220 540 192 580 186 C600 174 636 178 660 192 C688 204 694 232 682 268" fill="${p.ink}" />
  <path d="M530 272 C520 300 522 330 536 350" stroke="${p.ink}" stroke-width="10" fill="none" />
  <path d="M682 268 C692 296 690 326 676 346" stroke="${p.ink}" stroke-width="10" fill="none" />
  <circle cx="572" cy="300" r="7" fill="${p.ink}" />
  <circle cx="628" cy="300" r="7" fill="${p.ink}" />
  <path d="M582 338 C592 350 608 350 618 338" stroke="${p.ink}" stroke-width="4" fill="none" stroke-linecap="round" />
  <path d="M510 390 C510 374 548 360 600 360 C652 360 690 374 690 390 L690 580 C690 606 648 630 600 630 C552 630 510 606 510 580 Z" fill="#1e3a5f" />
  <rect x="530" y="400" width="140" height="24" rx="12" fill="${p.panel}" opacity="0.2" />
  <path d="M510 420 L432 560" stroke="#f2c9a5" stroke-width="20" stroke-linecap="round" />
  <path d="M690 420 L768 560" stroke="#f2c9a5" stroke-width="20" stroke-linecap="round" />
  <path d="M560 628 L544 738" stroke="${p.ink}" stroke-width="20" stroke-linecap="round" />
  <path d="M640 628 L656 738" stroke="${p.ink}" stroke-width="20" stroke-linecap="round" />
  <rect x="752" y="480" width="80" height="110" rx="10" fill="${p.panel}" stroke="${p.accent}" stroke-width="6" />
  <rect x="772" y="500" width="12" height="60" rx="6" fill="#22d3ee" opacity="0.6" />
  <rect x="792" y="520" width="12" height="40" rx="6" fill="#a78bfa" opacity="0.5" />
  <circle cx="782" cy="558" r="6" fill="#22c55e" opacity="0.7" />
  `;
}

function fridaKahlo(p) {
  return `
  <circle cx="600" cy="310" r="80" fill="#f2c9a5" />
  <path d="M526 272 C530 224 550 202 590 196 C612 188 640 192 660 204 C686 218 694 244 686 270" fill="${p.ink}" />
  <path d="M530 264 C514 258 504 268 510 282" stroke="${p.ink}" stroke-width="8" fill="none" />
  <path d="M680 260 C696 254 706 264 700 278" stroke="${p.ink}" stroke-width="8" fill="none" />
  <circle cx="528" cy="192" r="14" fill="#ef4444" />
  <circle cx="560" cy="180" r="10" fill="#f97316" />
  <circle cx="544" cy="174" r="8" fill="#facc15" />
  <circle cx="570" cy="192" r="8" fill="#ec4899" />
  <circle cx="572" cy="304" r="7" fill="${p.ink}" />
  <circle cx="628" cy="304" r="7" fill="${p.ink}" />
  <path d="M564 290 C578 282 622 282 636 290" stroke="${p.ink}" stroke-width="5" fill="none" />
  <path d="M584 340 C592 352 608 352 616 340" stroke="${p.ink}" stroke-width="4" fill="none" stroke-linecap="round" />
  <path d="M510 396 C510 378 548 362 600 362 C652 362 690 378 690 396 L690 580 C690 608 648 634 600 634 C552 634 510 608 510 580 Z" fill="${p.accent}" />
  <rect x="530" y="408" width="140" height="24" rx="12" fill="${p.panel}" opacity="0.2" />
  <path d="M510 424 L436 560" stroke="#f2c9a5" stroke-width="20" stroke-linecap="round" />
  <path d="M690 424 L764 560" stroke="#f2c9a5" stroke-width="20" stroke-linecap="round" />
  <path d="M560 632 L544 738" stroke="${p.ink}" stroke-width="20" stroke-linecap="round" />
  <path d="M640 632 L656 738" stroke="${p.ink}" stroke-width="20" stroke-linecap="round" />
  `;
}

function beehive(p) {
  return `
  <path d="M480 220 L720 220" stroke="#7c2d12" stroke-width="16" stroke-linecap="round" />
  <path d="M600 220 L600 280" stroke="#7c2d12" stroke-width="12" />
  <path d="M480 320 C480 280 540 260 600 260 C660 260 720 280 720 320 L720 540 C720 600 660 640 600 640 C540 640 480 600 480 540 Z" fill="#f59e0b" />
  <path d="M500 360 H700" stroke="#d97706" stroke-width="8" opacity="0.5" />
  <path d="M500 420 H700" stroke="#d97706" stroke-width="8" opacity="0.5" />
  <path d="M500 480 H700" stroke="#d97706" stroke-width="8" opacity="0.5" />
  <path d="M500 540 H700" stroke="#d97706" stroke-width="8" opacity="0.5" />
  <circle cx="600" cy="620" r="18" fill="#92400e" />
  <ellipse cx="400" cy="360" rx="32" ry="22" fill="#facc15" />
  <ellipse cx="370" cy="346" rx="22" ry="14" fill="${p.panel}" opacity="0.6" transform="rotate(-20 370 346)" />
  <ellipse cx="430" cy="346" rx="22" ry="14" fill="${p.panel}" opacity="0.6" transform="rotate(20 430 346)" />
  <ellipse cx="780" cy="440" rx="28" ry="20" fill="#facc15" />
  <ellipse cx="756" cy="428" rx="20" ry="12" fill="${p.panel}" opacity="0.6" transform="rotate(-15 756 428)" />
  <ellipse cx="804" cy="428" rx="20" ry="12" fill="${p.panel}" opacity="0.6" transform="rotate(15 804 428)" />
  `;
}

function virus(p) {
  return `
  <circle cx="600" cy="450" r="120" fill="${p.accent}" />
  <circle cx="600" cy="450" r="90" fill="${p.panel}" opacity="0.2" />
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
    const rad = angle * Math.PI / 180;
    const x1 = 600 + Math.cos(rad) * 120;
    const y1 = 450 + Math.sin(rad) * 120;
    const x2 = 600 + Math.cos(rad) * 170;
    const y2 = 450 + Math.sin(rad) * 170;
    return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${p.accent}" stroke-width="10" stroke-linecap="round" />
    <circle cx="${x2}" cy="${y2}" r="16" fill="${p.accent}" />`;
  }).join("\n  ")}
  <circle cx="560" cy="420" r="18" fill="${p.ink}" opacity="0.15" />
  <circle cx="640" cy="470" r="22" fill="${p.ink}" opacity="0.15" />
  <circle cx="590" cy="490" r="14" fill="${p.ink}" opacity="0.1" />
  `;
}

function smartphone(p) {
  return `
  <rect x="440" y="196" width="320" height="556" rx="36" fill="${p.ink}" />
  <rect x="460" y="236" width="280" height="472" rx="8" fill="${p.panel}" />
  <circle cx="600" cy="216" r="6" fill="#475569" />
  <rect x="560" y="720" width="80" height="8" rx="4" fill="#475569" />
  ${[[490, 270, "#3b82f6"], [570, 270, "#22c55e"], [650, 270, "#f97316"], [490, 350, "#ef4444"],
    [570, 350, "#8b5cf6"], [650, 350, "#06b6d4"], [490, 430, "#ec4899"], [570, 430, "#f59e0b"],
    [650, 430, "#64748b"]].map(([x, y, color]) =>
    `<rect x="${x}" y="${y}" width="56" height="56" rx="12" fill="${color}" opacity="0.8" />`
  ).join("\n  ")}
  <rect x="480" y="530" width="240" height="40" rx="12" fill="#e2e8f0" />
  <rect x="480" y="590" width="160" height="28" rx="8" fill="#e2e8f0" opacity="0.6" />
  `;
}

function blackHole(p) {
  return `
  <circle cx="600" cy="450" r="80" fill="${p.ink}" />
  <ellipse cx="600" cy="450" rx="220" ry="60" fill="none" stroke="#f59e0b" stroke-width="16" opacity="0.7" />
  <ellipse cx="600" cy="450" rx="180" ry="48" fill="none" stroke="#f97316" stroke-width="10" opacity="0.5" />
  <ellipse cx="600" cy="450" rx="260" ry="72" fill="none" stroke="#fbbf24" stroke-width="8" opacity="0.3" />
  <circle cx="600" cy="450" r="80" fill="${p.ink}" />
  <circle cx="600" cy="450" r="60" fill="#020617" />
  `;
}

function ecosystem(p) {
  return `
  <path d="M0 620 C200 580 400 560 600 570 C800 580 1000 600 1200 620 V900 H0 Z" fill="#16a34a" opacity="0.3" />
  <rect x="300" y="380" width="40" height="200" rx="10" fill="#7c2d12" />
  <circle cx="320" cy="340" r="70" fill="#15803d" />
  <circle cx="280" cy="360" r="50" fill="#166534" opacity="0.9" />
  <rect x="700" y="340" width="50" height="240" rx="12" fill="#7c2d12" />
  <circle cx="725" cy="290" r="80" fill="#15803d" />
  <circle cx="680" cy="320" r="56" fill="#166534" opacity="0.9" />
  <rect x="520" y="440" width="30" height="140" rx="8" fill="#92400e" />
  <circle cx="535" cy="410" r="46" fill="#22c55e" />
  <path d="M380 640 C420 620 480 618 540 624 C600 630 660 620 700 610" stroke="#60a5fa" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.6" />
  <circle cx="460" cy="560" r="14" fill="${p.ink}" opacity="0.4" />
  <circle cx="480" cy="556" r="10" fill="${p.ink}" opacity="0.4" />
  <circle cx="820" cy="550" r="10" fill="${p.accent}" opacity="0.3" />
  <circle cx="840" cy="546" r="7" fill="${p.accent}" opacity="0.3" />
  `;
}
