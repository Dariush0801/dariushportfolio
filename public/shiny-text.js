// React Bits — ShinyText Vanilla JS Implementation
(function () {
  'use strict';

  function initShinyText(el) {
    if (!el || el.dataset.shinyInitialized) return;
    el.dataset.shinyInitialized = 'true';

    const speed = parseFloat(el.getAttribute('data-speed')) || 2.8;
    const delay = parseFloat(el.getAttribute('data-delay')) || 0;
    const color = el.getAttribute('data-color');
    const shineColor = el.getAttribute('data-shine-color');
    const spread = parseFloat(el.getAttribute('data-spread')) || 120;
    const direction = el.getAttribute('data-direction') || 'left';
    const pauseOnHover = el.getAttribute('data-pause-on-hover') === 'true';
    const yoyo = el.getAttribute('data-yoyo') === 'true';
    const disabled = el.getAttribute('data-disabled') === 'true';

    if (disabled) {
      el.classList.add('shiny-disabled');
      return;
    }

    if (color) el.style.setProperty('--shiny-color', color);
    if (shineColor) el.style.setProperty('--shiny-shine-color', shineColor);
    if (spread) el.style.setProperty('--shiny-spread', `${spread}deg`);
    if (speed) el.style.setProperty('--shiny-speed', `${speed}s`);

    if (direction === 'right') {
      el.classList.add('direction-right');
    }

    if (pauseOnHover) {
      el.classList.add('pause-on-hover');
    }

    // Optional dynamic animation frame loop if advanced delay or yoyo is requested
    if (delay > 0 || yoyo) {
      let isPaused = false;
      let elapsed = 0;
      let lastTime = null;
      const animationDuration = speed * 1000;
      const delayDuration = delay * 1000;
      const dirMultiplier = direction === 'left' ? 1 : -1;

      if (pauseOnHover) {
        el.addEventListener('mouseenter', () => { isPaused = true; });
        el.addEventListener('mouseleave', () => { isPaused = false; });
      }

      function animate(time) {
        if (!lastTime) lastTime = time;
        const delta = time - lastTime;
        lastTime = time;

        if (!isPaused) {
          elapsed += delta;

          let progress = 0;
          if (yoyo) {
            const cycleDuration = animationDuration + delayDuration;
            const fullCycle = cycleDuration * 2;
            const cycleTime = elapsed % fullCycle;

            if (cycleTime < animationDuration) {
              const p = (cycleTime / animationDuration) * 100;
              progress = dirMultiplier === 1 ? p : 100 - p;
            } else if (cycleTime < cycleDuration) {
              progress = dirMultiplier === 1 ? 100 : 0;
            } else if (cycleTime < cycleDuration + animationDuration) {
              const reverseTime = cycleTime - cycleDuration;
              const p = 100 - (reverseTime / animationDuration) * 100;
              progress = dirMultiplier === 1 ? p : 100 - p;
            } else {
              progress = dirMultiplier === 1 ? 0 : 100;
            }
          } else {
            const cycleDuration = animationDuration + delayDuration;
            const cycleTime = elapsed % cycleDuration;

            if (cycleTime < animationDuration) {
              const p = (cycleTime / animationDuration) * 100;
              progress = dirMultiplier === 1 ? p : 100 - p;
            } else {
              progress = dirMultiplier === 1 ? 100 : 0;
            }
          }

          const bgPos = `${150 - progress * 2}% center`;
          el.style.backgroundPosition = bgPos;
          el.style.animation = 'none'; // disable CSS keyframes in favor of precision RAF
        }

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    }
  }

  function initAll() {
    document.querySelectorAll('.shiny-text').forEach(initShinyText);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Export for programmatic usage
  window.ShinyText = {
    init: initShinyText,
    initAll: initAll
  };
})();
