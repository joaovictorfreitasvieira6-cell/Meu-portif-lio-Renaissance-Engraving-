export function initBrainIntro() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const chapter = document.querySelector('.reference-hero');
  const hero = chapter.querySelector('.art-stage') ?? chapter;
  const image = hero.querySelector('.reference-art');
  const canvas = document.createElement('canvas');
  canvas.className = 'brain-reconstruction';
  canvas.setAttribute('aria-hidden', 'true');
  const controls = document.createElement('div');
  controls.className = 'intro-controls';
  const label = document.createElement('span');
  label.textContent = 'Da matéria ao pensamento · 5 s';
  const skip = document.createElement('button');
  skip.textContent = 'Pular abertura →';
  controls.append(label, skip);
  hero.append(canvas, controls);
  hero.classList.add('brain-intro-active');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    controls.remove();
    hero.classList.remove('brain-intro-active');
    return;
  }
  let width = 0,
    height = 0,
    frame = 0,
    start = null,
    finished = false;
  const particles = [];
  const count = innerWidth <= 960 ? 180 : 560;
  // Normalized positions follow the brain in the original full composition.
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random());
    const x = 0.565 + Math.cos(angle) * 0.205 * radius;
    const y = 0.455 + Math.sin(angle) * 0.385 * radius;
    const scatter = Math.random() * Math.PI * 2;
    particles.push({
      x,
      y,
      sx: x + Math.cos(scatter) * (0.12 + Math.random() * 0.3),
      sy: y + Math.sin(scatter) * (0.15 + Math.random() * 0.4),
      delay: Math.random() * 0.32,
      spin: Math.random() * Math.PI * 2,
    });
  }
  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    const restoreFocus = document.activeElement === skip;
    canvas.remove();
    controls.remove();
    hero.classList.remove('brain-intro-active');
    removeEventListener('resize', resize);
    observer.disconnect();
    reduced.removeEventListener('change', onPreference);
    if (restoreFocus) chapter.querySelector('.next-chapter')?.focus({ preventScroll: true });
  }
  function onPreference(event) {
    if (event.matches) finish();
  }
  const observer = new MutationObserver(() => {
    if (chapter.hidden) finish();
  });
  observer.observe(chapter, { attributes: true, attributeFilter: ['hidden'] });
  skip.addEventListener('click', finish);
  reduced.addEventListener('change', onPreference);
  addEventListener('resize', resize);
  resize();
  function draw(now) {
    if (finished) return;
    if (start === null) start = now;
    const t = Math.min((now - start) / 5000, 1);
    ctx.clearRect(0, 0, width, height);
    // Feathered paper veils the brain, while the rest of the portfolio stays visible.
    const veil = 1 - Math.max(0, Math.min(1, (t - 0.58) / 0.4));
    ctx.save();
    ctx.translate(width * 0.565, height * 0.455);
    ctx.scale(width * 0.235, height * 0.43);
    const paper = ctx.createRadialGradient(0, 0, 0.3, 0, 0, 1.08);
    paper.addColorStop(0, `rgba(237,230,215,${veil})`);
    paper.addColorStop(0.77, `rgba(237,230,215,${veil * 0.99})`);
    paper.addColorStop(1, 'rgba(237,230,215,0)');
    ctx.fillStyle = paper;
    ctx.fillRect(-1.1, -1.1, 2.2, 2.2);
    ctx.restore();
    const fade = Math.min(1, (1 - t) * 7);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const local = Math.max(0, Math.min(1, (t - p.delay) / (0.82 - p.delay)));
      const ease = 1 - Math.pow(1 - local, 3);
      const x = (p.sx + (p.x - p.sx) * ease) * width;
      const y = (p.sy + (p.y - p.sy) * ease) * height;
      const twist = Math.sin(local * Math.PI) * Math.sin(p.spin + local * 4) * 12;
      ctx.globalAlpha = fade * (0.2 + 0.65 * ease);
      if (local > 0.22) {
        const size = Math.max(5, width * 0.009);
        const sw = image.naturalWidth * 0.01,
          sh = image.naturalHeight * 0.018;
        ctx.drawImage(
          image,
          Math.max(0, p.x * image.naturalWidth - sw / 2),
          Math.max(0, p.y * image.naturalHeight - sh / 2),
          sw,
          sh,
          x - size / 2,
          y + twist - size / 2,
          size,
          size,
        );
      }
      ctx.strokeStyle = i % 5 === 0 ? '#d0a455' : '#796a50';
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      ctx.arc(x, y + twist, 1.3 + (1 - ease) * 2, 0, Math.PI * 2);
      ctx.stroke();
      if (i % 3 === 0 && local < 0.85) {
        const q = particles[(i + 1) % particles.length];
        const qx = (q.sx + (q.x - q.sx) * ease) * width;
        const qy = (q.sy + (q.y - q.sy) * ease) * height;
        if (Math.hypot(qx - x, qy - y) < width * 0.045) {
          ctx.globalAlpha = fade * 0.23;
          ctx.beginPath();
          ctx.moveTo(x, y + twist);
          ctx.lineTo(qx, qy);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    if (t >= 1) finish();
    else frame = requestAnimationFrame(draw);
  }
  // Only begin the five-second sequence once its source artwork is decoded.
  image
    .decode()
    .then(() => {
      if (!finished) {
        resize();
        frame = requestAnimationFrame(draw);
      }
    })
    .catch(finish);
  return finish;
}
