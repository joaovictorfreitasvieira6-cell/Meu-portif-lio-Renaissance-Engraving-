import { createScope } from '../core/disposable.js';

export function initMusicPlayer({ container, controller, title, volume }) {
  const scope = createScope();
  const player = document.createElement('aside');
  player.className = 'music-player';
  player.setAttribute('aria-label', 'Trilha sonora');
  player.innerHTML = `
    <button class="music-toggle" aria-label="Reproduzir trilha sonora">▶</button>
    <div class="music-label"><span class="music-title"></span>
      <span class="music-status" role="status"></span>
    </div>
    <label><span class="visually-hidden">Volume da música</span>
      <input type="range" min="0" max="100" aria-label="Volume da música">
    </label>`;
  player.querySelector('.music-title').textContent = title;
  const toggle = player.querySelector('.music-toggle');
  const status = player.querySelector('.music-status');
  const slider = player.querySelector('input');
  slider.value = String(volume * 100);
  container.append(player);

  scope.add(
    controller.subscribe((state) => {
      toggle.textContent = state.paused ? '▶' : 'Ⅱ';
      toggle.setAttribute(
        'aria-label',
        state.paused ? 'Reproduzir trilha sonora' : 'Pausar trilha sonora',
      );
      toggle.title = toggle.getAttribute('aria-label');
      status.textContent = state.failed
        ? 'Não foi possível abrir o áudio.'
        : state.blocked
          ? 'Clique para ouvir'
          : state.paused
            ? 'Pausada'
            : 'Violino · Reproduzindo';
    }),
  );
  scope.listen(toggle, 'click', () => controller.toggle());
  scope.listen(slider, 'input', () => controller.setVolume(Number(slider.value) / 100));

  // Autoplay may be blocked. Retry once after an intentional user gesture.
  let waitingForGesture = true;
  function startOnInteraction(event) {
    if (!waitingForGesture || player.contains(event.target)) return;
    waitingForGesture = false;
    void controller.play();
  }
  scope.listen(document, 'pointerdown', startOnInteraction);
  scope.listen(document, 'keydown', startOnInteraction);
  scope.listen(window, 'pagehide', () => controller.pause());
  void controller.play();
  scope.add(() => player.remove());
  return scope.dispose;
}
