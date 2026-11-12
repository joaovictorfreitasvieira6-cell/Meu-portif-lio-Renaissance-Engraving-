export function createPageTransition({ curtain, body, reducedMotion }) {
  const animations = new Set();
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  function animate(element, frames, options) {
    const animation = element.animate(frames, options);
    animations.add(animation);
    return animation.finished;
  }

  return {
    async cover({ previous, index, direction }) {
      body.classList.add('is-navigating');
      if (reducedMotion.matches) return;
      curtain.style.visibility = 'visible';
      // All values come from the chapter registry, not visitor input.
      curtain.querySelector('span').innerHTML =
        `❧<small>JOÃO VICTOR<br>CAPÍTULO ${numerals[index] ?? index + 1}</small>❧`;
      if (previous) {
        animate(
          previous,
          [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0.55, transform: `translateX(${-direction * 28}px)` },
          ],
          { duration: 360, fill: 'forwards', easing: 'ease-in' },
        ).catch(() => {});
      }
      await animate(
        curtain,
        [
          { transform: `translateX(${-direction * 105}%) rotate(${-direction * 2}deg)` },
          { transform: 'translateX(0) rotate(0deg)' },
        ],
        { duration: 420, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' },
      );
    },
    async reveal({ current, previous, direction }) {
      previous?.getAnimations?.().forEach((animation) => animation.cancel());
      if (reducedMotion.matches) return;
      await Promise.all([
        animate(
          current,
          [
            { opacity: 0.6, transform: `translateX(${direction * 24}px)` },
            { opacity: 1, transform: 'translateX(0)' },
          ],
          { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' },
        ),
        animate(
          curtain,
          [
            { transform: 'translateX(0) rotate(0deg)' },
            { transform: `translateX(${direction * 105}%) rotate(${direction * 2}deg)` },
          ],
          { duration: 520, easing: 'cubic-bezier(.6,0,.25,1)', fill: 'forwards' },
        ),
      ]);
    },
    reset() {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      curtain.style.visibility = 'hidden';
      body.classList.remove('is-navigating');
    },
  };
}
