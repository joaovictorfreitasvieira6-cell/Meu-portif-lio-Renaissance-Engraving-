import { createScope } from '../core/disposable.js';

export function initInkTrail({ reducedMotion }) {
  if (reducedMotion.matches || !matchMedia('(pointer:fine)').matches) return;
  const scope = createScope();
  const canvas = document.createElement('canvas');
  canvas.className = 'engraving-trail';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d');
  if (!context) return;
  document.body.append(canvas);
  let marks = [];
  let frame = 0;
  let last = null;

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function draw(now) {
    context.clearRect(0, 0, innerWidth, innerHeight);
    marks = marks.filter((mark) => now - mark.time < 900);
    for (const mark of marks) {
      context.globalAlpha = (1 - (now - mark.time) / 900) * 0.38;
      context.strokeStyle = '#79563a';
      context.lineWidth = 0.65;
      context.beginPath();
      context.moveTo(mark.x - 9, mark.y + 5);
      context.lineTo(mark.x + 9, mark.y - 5);
      context.moveTo(mark.x - 5, mark.y + 8);
      context.lineTo(mark.x + 5, mark.y - 8);
      if (mark.ornament) {
        context.moveTo(mark.x - 13, mark.y);
        context.lineTo(mark.x + 13, mark.y);
        context.moveTo(mark.x, mark.y - 13);
        context.lineTo(mark.x, mark.y + 13);
        context.moveTo(mark.x + 7, mark.y);
        context.ellipse(mark.x, mark.y, 7, 7, 0, 0, Math.PI * 2);
      }
      context.stroke();
    }
    context.globalAlpha = 1;
    frame = marks.length ? requestAnimationFrame(draw) : 0;
  }
  scope.listen(window, 'resize', resize);
  scope.listen(
    window,
    'pointermove',
    (event) => {
      if (
        reducedMotion.matches ||
        event.pointerType !== 'mouse' ||
        document.querySelector('dialog[open]')
      )
        return;
      if (last && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 22) return;
      last = { x: event.clientX, y: event.clientY };
      marks.push({ ...last, time: performance.now(), ornament: Math.random() < 0.16 });
      if (marks.length > 65) marks.shift();
      if (!frame) frame = requestAnimationFrame(draw);
    },
    { passive: true },
  );
  scope.add(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
  });
  resize();
  return scope.dispose;
}
