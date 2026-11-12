import { createScope } from '../core/disposable.js';

export function createProfileDialog({ element, content }) {
  const scope = createScope();
  const panel = element.querySelector('[role="tabpanel"]');
  const tabs = [...element.querySelectorAll('[data-tab]')];

  function select(id) {
    if (!Object.hasOwn(content, id)) return;
    panel.innerHTML = content[id];
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.scrollTop = 0;
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
  }

  tabs.forEach((tab, index) => {
    scope.listen(tab, 'click', () => select(tab.dataset.tab));
    scope.listen(tab, 'keydown', (event) => {
      const positions = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      const next = positions[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next].dataset.tab);
      tabs[next].focus();
    });
  });
  scope.listen(element.querySelector('.close-profile'), 'click', () => element.close());
  select(tabs[0].dataset.tab);

  return {
    open(id) {
      if (!Object.hasOwn(content, id)) return;
      select(id);
      if (!element.open) element.showModal();
      tabs.find((tab) => tab.dataset.tab === id)?.focus();
    },
    dispose: scope.dispose,
  };
}
