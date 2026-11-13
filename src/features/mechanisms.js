export function initMechanisms() {
  const ns = 'http://www.w3.org/2000/svg';
  function make(tag, attributes) {
    const node = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  const svg = make('svg', {
    class: 'mechanisms',
    viewBox: '0 0 1783 882',
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const defs = make('defs', {});
  svg.append(defs);
  [
    { x: 834, y: 510, r: 65, reverse: false },
    { x: 912, y: 448, r: 49, reverse: true },
    { x: 907, y: 574, r: 46, reverse: true },
  ].forEach((gear, index) => {
    const clip = make('clipPath', { id: 'gear-window-' + index });
    clip.append(make('circle', { cx: gear.x, cy: gear.y, r: gear.r }));
    defs.append(clip);
    const window = make('g', { 'clip-path': `url(#gear-window-${index})` });
    const image = make('image', {
      href: 'assets/construindo-solucoes.png',
      width: 1783,
      height: 882,
      class: 'engraved-gear' + (gear.reverse ? ' reverse' : ''),
    });
    image.style.transformOrigin = `${gear.x}px ${gear.y}px`;
    window.append(image);
    svg.append(window);
  });
  svg.append(make('path', { class: 'sand-fall', d: 'M1461 708 L1461 753' }));
  const chapter = document.querySelector('.second-chapter');
  (chapter.querySelector('.art-stage') ?? chapter).append(svg);
  return () => svg.remove();
}
