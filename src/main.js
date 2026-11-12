import { site } from './config/site.js';
import { manuscripts } from './content/manuscripts.js';
import { profileContent } from './content/profile.js';
import { terminalContent } from './content/terminals.js';
import { createScope } from './core/disposable.js';
import { createChapterRouter } from './core/chapter-router.js';
import { createAudioController } from './core/audio-controller.js';
import { createPageTransition } from './ui/page-transition.js';
import { createManuscriptDialog } from './ui/manuscript-dialog.js';
import { createProfileDialog } from './ui/profile-dialog.js';
import { initMusicPlayer } from './ui/music-player.js';
import { initSocialLinks } from './ui/social-links.js';
import { initBrainIntro } from './features/brain-intro.js';
import { initInkTrail } from './features/ink-trail.js';
import { initMechanisms } from './features/mechanisms.js';
import { initTerminals } from './features/terminals.js';

const scope = createScope();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const transition = createPageTransition({
  curtain: document.querySelector('.page-transition'),
  body: document.body,
  reducedMotion,
});
const router = createChapterRouter({
  chapters: site.chapters.map((id) => document.getElementById(id)),
  transition,
});
const manuscript = createManuscriptDialog({
  element: document.querySelector('.manuscript'),
  content: manuscripts,
});
const profile = createProfileDialog({
  element: document.querySelector('.profile-dialog'),
  content: profileContent,
});
const audio = createAudioController({ audio: new Audio(), ...site.audio });

document.querySelector('.note-copy').innerHTML = manuscripts.architecture.html;
const buttonActions = {
  chapter: (id) => void router.navigate(id),
  manuscript: (id) => manuscript.open(id),
  profile: (id) => profile.open(id),
};

function handleNavigation(event) {
  const button = event.target.closest('[data-chapter], [data-manuscript], [data-profile]');
  if (!button) return;
  const action = Object.keys(buttonActions).find((key) => button.dataset[key]) ?? 'profile';
  buttonActions[action](button.dataset[action]);
}

scope.listen(document, 'click', handleNavigation);

scope.add(transition.reset);
scope.add(manuscript.dispose);
scope.add(profile.dispose);
scope.add(audio.dispose);
scope.add(initMusicPlayer({ container: document.body, controller: audio, ...site.audio }));
scope.add(initSocialLinks({ container: document.body, ...site }));
scope.add(initTerminals({ router, content: terminalContent, reducedMotion }));
scope.add(initMechanisms());
scope.add(initInkTrail({ reducedMotion }));
scope.add(initBrainIntro());
// Keep listeners for back-forward cache restoration; dispose only on a real unload.
scope.listen(window, 'pagehide', (event) => {
  if (!event.persisted) scope.dispose();
});
