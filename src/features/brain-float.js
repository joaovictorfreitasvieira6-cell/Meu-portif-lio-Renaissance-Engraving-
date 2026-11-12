const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

// The still artwork stays intact underneath the moving engraving.
const BRAIN_CONTOUR = [
  'M 1002 119',
  'C 950 103 914 115 885 132 C 848 115 801 143 782 168',
  'C 735 168 700 205 702 242 C 662 266 658 313 674 346',
  'C 645 374 655 411 676 432 C 647 470 669 511 695 532',
  'C 688 576 720 604 753 607 C 764 643 813 659 847 644',
  'C 877 677 913 701 947 696 C 962 731 1004 749 1031 739',
  'L 1060 772 L 1115 774 L 1124 724',
  'C 1187 722 1239 693 1254 651 C 1309 624 1329 572 1316 529',
  'C 1346 480 1346 422 1325 387 C 1339 342 1319 294 1290 270',
  'C 1295 229 1258 197 1226 185 C 1214 146 1175 129 1143 133',
  'C 1109 104 1068 104 1037 119 C 1025 110 1012 111 1002 119 Z',
].join(' ');

export function initBrainFloat({ reducedMotion }) {
  if (reducedMotion.matches) return;
  const hero = document.getElementById('mind');
  const source = hero.querySelector('.reference-art');
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('class', 'floating-brain');
  svg.setAttribute('viewBox', '0 0 1779 884');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = `<defs><clipPath id="brain-float-contour"><path d="${BRAIN_CONTOUR}"/></clipPath></defs>
    <g class="floating-brain-layer"><g clip-path="url(#brain-float-contour)">
      <image width="1779" height="884"/>
    </g></g>`;
  const image = svg.querySelector('image');
  function enable() {
    hero.classList.add('brain-float-enabled');
  }
  image.addEventListener('load', enable, { once: true });
  image.setAttribute('href', source.getAttribute('src'));
  hero.append(svg);

  return () => {
    image.removeEventListener('load', enable);
    hero.classList.remove('brain-float-enabled');
    svg.remove();
  };
}
