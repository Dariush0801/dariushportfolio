// React Bits — BounceCards Vanilla JS Implementation with GSAP
(function () {
  'use strict';

  function getTransforms() {
    const width = window.innerWidth;
    if (width < 360) {
      return [
        'rotate(-7deg) translate(-72px, 4px)',
        'rotate(-5deg) translate(-50px, 2px)',
        'rotate(-3deg) translate(-28px, -1px)',
        'rotate(-1deg) translate(-9px, -2px)',
        'rotate(1deg) translate(9px, -2px)',
        'rotate(3deg) translate(28px, -1px)',
        'rotate(5deg) translate(50px, 2px)',
        'rotate(7deg) translate(72px, 4px)'
      ];
    } else if (width < 420) {
      return [
        'rotate(-9deg) translate(-88px, 5px)',
        'rotate(-6deg) translate(-62px, 2px)',
        'rotate(-3deg) translate(-36px, -1px)',
        'rotate(-1deg) translate(-12px, -3px)',
        'rotate(1deg) translate(12px, -3px)',
        'rotate(3deg) translate(36px, -1px)',
        'rotate(6deg) translate(62px, 2px)',
        'rotate(9deg) translate(88px, 5px)'
      ];
    } else if (width < 680) {
      return [
        'rotate(-11deg) translate(-130px, 7px)',
        'rotate(-8deg) translate(-92px, 3px)',
        'rotate(-4deg) translate(-54px, -1px)',
        'rotate(-1deg) translate(-18px, -4px)',
        'rotate(1deg) translate(18px, -4px)',
        'rotate(4deg) translate(54px, -1px)',
        'rotate(8deg) translate(92px, 3px)',
        'rotate(11deg) translate(130px, 7px)'
      ];
    } else {
      return [
        'rotate(-14deg) translate(-200px, 12px)',
        'rotate(-10deg) translate(-142px, 4px)',
        'rotate(-6deg) translate(-85px, -2px)',
        'rotate(-2deg) translate(-28px, -6px)',
        'rotate(2deg) translate(28px, -6px)',
        'rotate(6deg) translate(85px, -2px)',
        'rotate(10deg) translate(142px, 4px)',
        'rotate(14deg) translate(200px, 12px)'
      ];
    }
  }

  function getPushDistance() {
    const width = window.innerWidth;
    if (width < 360) return 45;
    if (width < 420) return 60;
    if (width < 680) return 90;
    return 130;
  }

  const getNoRotationTransform = transformStr => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none') {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  const getPushedTransform = (baseTransform, offsetX) => {
    const translateRegex = /translate\(([-0-9.]+)px(?:,\s*[-0-9.]+px)?\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, (m, xVal) => m.replace(xVal, newX.toFixed(1)));
    } else {
      return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
    }
  };

  function initBounceCards() {
    const container = document.getElementById('certBounceCards');
    if (!container || typeof gsap === 'undefined') return;

    const cards = Array.from(container.querySelectorAll('.card'));
    if (!cards.length) return;

    let transformStyles = getTransforms();
    let pushDistance = getPushDistance();

    // Apply base initial transforms and z-indices
    cards.forEach((card, idx) => {
      const baseTransform = transformStyles[idx] || 'none';
      card.style.transform = baseTransform;
      card.style.zIndex = (idx + 1).toString();
    });

    // Animate cards bouncing in
    function animateIn(delay = 0.25) {
      gsap.killTweensOf(cards);
      transformStyles = getTransforms();
      pushDistance = getPushDistance();

      cards.forEach((card, idx) => {
        card.style.transform = transformStyles[idx] || 'none';
        card.style.zIndex = (idx + 1).toString();
      });

      gsap.fromTo(
        cards,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: 0.06,
          ease: 'elastic.out(1, 0.75)',
          delay: delay,
          duration: 0.9,
          overwrite: 'auto'
        }
      );
    }

    // Push siblings effect on hover
    function pushSiblings(hoveredIdx) {
      transformStyles = getTransforms();
      pushDistance = getPushDistance();

      cards.forEach((card, i) => {
        gsap.killTweensOf(card);
        const baseTransform = transformStyles[i] || 'none';

        if (i === hoveredIdx) {
          const noRotationTransform = getNoRotationTransform(baseTransform);
          gsap.to(card, {
            transform: noRotationTransform,
            scale: 1.08,
            zIndex: 40,
            duration: 0.4,
            ease: 'back.out(1.4)',
            overwrite: 'auto'
          });
        } else {
          const offsetX = i < hoveredIdx ? -pushDistance : pushDistance;
          const pushedTransform = getPushedTransform(baseTransform, offsetX);
          const distance = Math.abs(hoveredIdx - i);
          const delay = distance * 0.04;

          gsap.to(card, {
            transform: pushedTransform,
            scale: 0.98,
            zIndex: 10 + (cards.length - distance),
            duration: 0.4,
            ease: 'back.out(1.4)',
            delay: delay,
            overwrite: 'auto'
          });
        }
      });
    }

    // Reset siblings effect on mouse leave
    function resetSiblings() {
      transformStyles = getTransforms();

      cards.forEach((card, i) => {
        gsap.killTweensOf(card);
        const baseTransform = transformStyles[i] || 'none';
        gsap.to(card, {
          transform: baseTransform,
          scale: 1,
          zIndex: (i + 1).toString(),
          duration: 0.45,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
      });
    }

    // Attach listeners to cards
    cards.forEach((card, idx) => {
      card.addEventListener('mouseenter', () => pushSiblings(idx));
      card.addEventListener('touchstart', () => pushSiblings(idx), { passive: true });
    });

    container.addEventListener('mouseleave', resetSiblings);
    container.addEventListener('touchend', () => {
      setTimeout(resetSiblings, 1200);
    }, { passive: true });

    // Initial bounce animation
    animateIn(0.3);

    // Replay animation on resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resetSiblings();
      }, 150);
    });

    // Expose replay hook for tab switching
    window.replayBounceCards = function (delay = 0.15) {
      animateIn(delay);
    };
  }

  // Hook into page load and tab change events
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Allow GSAP to load first if async
      setTimeout(initBounceCards, 50);
    });
  } else {
    setTimeout(initBounceCards, 50);
  }
})();
