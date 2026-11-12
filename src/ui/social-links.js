export function initSocialLinks({ container, github, linkedin }) {
  const navigation = document.createElement('nav');
  navigation.className = 'social-links';
  navigation.setAttribute('aria-label', 'Redes profissionais');
  [
    ['GitHub', github],
    ['LinkedIn', linkedin],
  ].forEach(([label, href], index) => {
    if (index) {
      const separator = document.createElement('span');
      separator.setAttribute('aria-hidden', 'true');
      separator.textContent = '/';
      navigation.append(separator);
    }
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${label} ↗`;
    navigation.append(link);
  });
  container.append(navigation);
  return () => navigation.remove();
}
