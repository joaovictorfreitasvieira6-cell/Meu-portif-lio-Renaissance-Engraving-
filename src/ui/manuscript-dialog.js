export function createManuscriptDialog({ element, content }) {
  const title = element.querySelector('h2');
  const eyebrow = element.querySelector('.eyebrow');
  const body = element.querySelector('.manuscript-copy');
  const close = () => element.close();
  const button = element.querySelector('.close-manuscript');
  button.addEventListener('click', close);

  return {
    open(id) {
      const entry = content[id];
      if (!entry) return;
      title.textContent = entry.title;
      eyebrow.textContent = entry.eyebrow;
      body.innerHTML = entry.html;
      element.scrollTop = 0;
      if (!element.open) element.showModal();
    },
    dispose() {
      button.removeEventListener('click', close);
    },
  };
}
