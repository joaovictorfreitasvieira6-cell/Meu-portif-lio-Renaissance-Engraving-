export function initTerminals({ router, content, reducedMotion }) {
  const terminals = content.map((entry) => {
    const screen = document.getElementById(entry.chapter);
    const element = screen.querySelector('.code-terminal');
    const code = element.querySelector('.terminal-typed');
    const output = element.querySelector('.terminal-output');
    const pre = element.querySelector('pre');
    let timer;
    let position = 0;

    function stop() {
      clearTimeout(timer);
    }
    function type() {
      if (screen.hidden) return;
      code.textContent = entry.code.slice(0, ++position);
      pre.scrollTop = pre.scrollHeight;
      if (position < entry.code.length) timer = setTimeout(type, entry.interval);
      else
        timer = setTimeout(() => {
          output.textContent = entry.output;
        }, 550);
    }
    function start() {
      stop();
      position = 0;
      code.textContent = '';
      output.textContent = '';
      if (reducedMotion.matches) {
        code.textContent = entry.code;
        output.textContent = entry.output;
      } else timer = setTimeout(type, 650);
    }
    return { screen, start, stop };
  });

  function update() {
    terminals.forEach((terminal) => {
      if (terminal.screen === router.current) terminal.start();
      else terminal.stop();
    });
  }
  const unsubscribe = router.subscribe(update);
  update();
  return () => {
    unsubscribe();
    terminals.forEach((terminal) => terminal.stop());
  };
}
