import { createAnimation, getIonPageElement, type Animation, type AnimationBuilder } from '@ionic/vue';

const ENTER_DURATION = 420;
const LEAVE_DURATION = 220;
const ENTER_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const LEAVE_EASING = 'cubic-bezier(0.4, 0, 1, 1)';

const getWorkspaceParts = (page: Element) => {
  const workspace = page.querySelector('.workspace');

  if (!workspace) {
    return {
      header: null,
      body: page.querySelector('main') || page.querySelector('ion-content') || page,
    };
  }

  return {
    header: workspace.querySelector('.topbar'),
    body: Array.from(workspace.children).filter((element) => !element.classList.contains('topbar')),
  };
};

const addEnteringAnimations = (root: Animation, page: Element, isBack: boolean) => {
  const { header, body } = getWorkspaceParts(page);
  const horizontalOffset = isBack ? '-24px' : '24px';

  if (header) {
    root.addAnimation(
      createAnimation()
        .addElement(header)
        .duration(300)
        .delay(55)
        .easing(ENTER_EASING)
        .fromTo('opacity', '0.15', '1')
        .fromTo('transform', 'translate3d(0, -9px, 0)', 'translate3d(0, 0, 0)'),
    );
  }

  root.addAnimation(
    createAnimation()
      .addElement(body)
      .duration(ENTER_DURATION)
      .delay(35)
      .easing(ENTER_EASING)
      .fromTo('opacity', '0.01', '1')
      .fromTo(
        'transform',
        `translate3d(${horizontalOffset}, 14px, 0) scale(0.988)`,
        'translate3d(0, 0, 0) scale(1)',
      ),
  );
};

const addLeavingAnimations = (root: Animation, page: Element, isBack: boolean) => {
  const { header, body } = getWorkspaceParts(page);
  const horizontalOffset = isBack ? '13px' : '-13px';

  if (header) {
    root.addAnimation(
      createAnimation()
        .addElement(header)
        .duration(LEAVE_DURATION - 40)
        .easing(LEAVE_EASING)
        .fromTo('opacity', '1', '0.1')
        .fromTo('transform', 'translate3d(0, 0, 0)', 'translate3d(0, -5px, 0)'),
    );
  }

  root.addAnimation(
    createAnimation()
      .addElement(body)
      .duration(LEAVE_DURATION)
      .easing(LEAVE_EASING)
      .fromTo('opacity', '1', '0.01')
      .fromTo(
        'transform',
        'translate3d(0, 0, 0) scale(1)',
        `translate3d(${horizontalOffset}, -4px, 0) scale(0.996)`,
      ),
  );
};

export const aguaPageTransition: AnimationBuilder = (_baseElement, options) => {
  const enteringPage = getIonPageElement(options?.enteringEl);
  const leavingPage = options?.leavingEl ? getIonPageElement(options.leavingEl) : null;
  const rootAnimation = createAnimation()
    .addElement(enteringPage)
    .fill('both')
    .beforeRemoveClass('ion-page-invisible');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return rootAnimation.duration(1);
  }

  const isBack = options?.direction === 'back';
  rootAnimation.duration(ENTER_DURATION + 35);
  addEnteringAnimations(rootAnimation, enteringPage, isBack);

  if (leavingPage) {
    addLeavingAnimations(rootAnimation, leavingPage, isBack);
  }

  return rootAnimation;
};
