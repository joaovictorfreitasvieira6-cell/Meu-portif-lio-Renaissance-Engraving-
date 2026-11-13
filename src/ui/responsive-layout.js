export function initResponsiveLayout({ chapters, content }) {
  const originals = new Map();

  chapters.forEach((chapter, index) => {
    const entry = content[chapter.id];
    if (!entry || chapter.querySelector('.art-stage')) return;
    originals.set(chapter, [...chapter.childNodes]);

    const stage = document.createElement('div');
    stage.className = 'art-stage';
    stage.append(...chapter.childNodes);

    const header = document.createElement('header');
    header.className = 'mobile-chapter-header';
    const brand = document.createElement('span');
    brand.className = 'mobile-brand';
    brand.textContent = 'JV /';
    const counter = document.createElement('span');
    counter.className = 'mobile-chapter-count';
    counter.textContent = `Capítulo ${index + 1} de ${chapters.length}`;
    header.append(brand, counter);

    const copy = document.createElement('div');
    copy.className = 'mobile-chapter-copy';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = entry.label;
    const title = document.createElement('h1');
    title.append(document.createTextNode(entry.title));
    const accent = document.createElement('em');
    accent.textContent = entry.accent;
    title.append(accent);
    const lead = document.createElement('p');
    lead.className = 'mobile-lead';
    lead.textContent = entry.lead;
    copy.append(eyebrow, title, lead);
    entry.paragraphs.forEach((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      copy.append(paragraph);
    });

    // Reuse the existing Hermes descriptions, without duplicating editorial content.
    const topics = stage.querySelector('.ai-topics');
    if (topics) {
      const readableTopics = topics.cloneNode(true);
      readableTopics.className = 'mobile-ai-topics';
      copy.append(readableTopics);
    }

    const actions = document.createElement('nav');
    actions.className = 'mobile-chapter-actions';
    actions.setAttribute('aria-label', 'Explore este capítulo');
    entry.actions.forEach((action) => {
      const button = document.createElement('button');
      button.dataset[action.type] = action.target;
      button.textContent = action.label + ' ↗';
      actions.append(button);
    });
    copy.append(actions);

    const navigation = document.createElement('nav');
    navigation.className = 'chapter-navigation';
    navigation.setAttribute('aria-label', 'Navegação entre capítulos');
    navigation.append(...stage.querySelectorAll('.chapter-button'));
    chapter.append(header, stage, copy, navigation);
  });

  return () => {
    originals.forEach((nodes, chapter) => chapter.replaceChildren(...nodes));
  };
}
