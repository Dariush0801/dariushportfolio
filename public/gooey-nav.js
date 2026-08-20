// Social Profile (Threads-ish) Interactive Vocabulary & Feed Logic
(function () {
  const colors = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff', '#0284c7'];

  // React Bits — GooeyNav Particle Physics Math
  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i, t, d, r, particleCount, colorList) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colorList[Math.floor(Math.random() * colorList.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  // React Bits GooeyNav bubble click effect (spawns on every click / tap)
  function triggerGooeyClick(x, y) {
    const particleCount = 14;
    const particleDistances = [75, 10];
    const particleR = 100;
    const animationTime = 550;
    const timeVariance = 250;
    const colorIndices = [1, 2, 3, 1, 2, 3, 1, 4];

    const container = document.createElement('div');
    container.className = 'gooey-click-container';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;

    const maxTime = animationTime * 2 + timeVariance;

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, particleDistances, particleR, particleCount, colorIndices);

      const particle = document.createElement('span');
      const point = document.createElement('span');
      particle.classList.add('particle');
      particle.style.setProperty('--start-x', `${p.start[0]}px`);
      particle.style.setProperty('--start-y', `${p.start[1]}px`);
      particle.style.setProperty('--end-x', `${p.end[0]}px`);
      particle.style.setProperty('--end-y', `${p.end[1]}px`);
      particle.style.setProperty('--time', `${p.time}ms`);
      particle.style.setProperty('--scale', `${p.scale}`);
      particle.style.setProperty('--color', `var(--color-${p.color}, #0ea5e9)`);
      particle.style.setProperty('--rotate', `${p.rotate}deg`);

      point.classList.add('point');
      particle.appendChild(point);
      container.appendChild(particle);
    }

    document.body.appendChild(container);

    setTimeout(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, maxTime + 100);
  }

  // Global listener: triggers the GooeyNav particle effect on click/tap (throttled for mobile fluidity)
  let lastGooeyTime = 0;
  window.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== undefined) return;
    const now = Date.now();
    if (now - lastGooeyTime < 120) return;
    lastGooeyTime = now;
    triggerGooeyClick(e.clientX, e.clientY);
  }, { passive: true });


  // Toast notification helper
  function showToast(message) {
    let toast = document.querySelector('.toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Initialize all interactive components
  function initThreadsInterface() {
    // 1. Theme Toggle
    const themeBtns = document.querySelectorAll('.theme-toggle-btn, .theme-toggle');
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }

    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
        showToast(isLight ? 'Switched to Light Mode' : 'Switched to Dark Mode');
      });
    });

    // 1b. Right Rail Hide/Show Toggle Logic (Visible across all tabs and pages)
    const railToggleBtn = document.querySelector('.rail-toggle-btn');
    const railReopenBtn = document.querySelector('.rail-reopen-btn');

    // Default to fully visible across all pages and navigation tabs
    document.body.classList.remove('rail-collapsed');

    if (railToggleBtn) {
      railToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.classList.toggle('rail-collapsed');
        const isCollapsed = document.body.classList.contains('rail-collapsed');
        showToast(isCollapsed ? 'Right sidebar hidden' : 'Right sidebar visible');
      });
    }

    if (railReopenBtn) {
      railReopenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.classList.remove('rail-collapsed');
        showToast('Right sidebar visible');
      });
    }

    // 2. Feed Tab Filter Logic
    const tabs = document.querySelectorAll('.profile-tab');
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-tab]');
    const feedCards = document.querySelectorAll('.feed-card');

    function filterFeed(tabName) {
      // Update tab active states
      tabs.forEach(t => {
        const isActive = t.getAttribute('data-tab') === tabName;
        t.classList.toggle('active', isActive);
        if (isActive && t.parentElement && t.parentElement.classList.contains('profile-tabs-bar')) {
          try {
            t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } catch (e) {}
        }
      });
      sidebarLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('data-tab') === tabName);
      });
      mobileNavItems.forEach(m => {
        m.classList.toggle('active', m.getAttribute('data-tab') === tabName);
      });

      // Filter cards
      feedCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const categories = (category || '').split(/\s+/);
        if (tabName === 'all') {
          if (card.classList.contains('empty-feed-card')) {
            card.style.display = 'none';
          } else {
            card.style.display = '';
          }
        } else if (categories.includes(tabName)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      // Replay bounce cards animation if certificates are visible
      if ((tabName === 'all' || tabName === 'certificates') && typeof window.replayBounceCards === 'function') {
        window.replayBounceCards(0.1);
      }
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        filterFeed(tabName);
        history.replaceState(null, '', `#${tabName}`);
      });
    });

    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const tabName = link.getAttribute('data-tab');
        if (tabName) {
          e.preventDefault();
          filterFeed(tabName);
          history.replaceState(null, '', `#${tabName}`);
        }
      });
    });

    mobileNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tabName = item.getAttribute('data-tab');
        if (tabName) {
          e.preventDefault();
          filterFeed(tabName);
          history.replaceState(null, '', `#${tabName}`);
          if (window.innerWidth <= 768 && window.scrollY > 120) {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }
        }
      });
    });

    // Check URL hash on initial load
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['all', 'projects', 'certificates', 'skills', 'about'].includes(initialHash)) {
      filterFeed(initialHash);
    }

    // 3. Like Buttons Interactivity
    const likeButtons = document.querySelectorAll('.btn-like');
    likeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const countSpan = btn.querySelector('.like-count');
        let count = parseInt(countSpan.dataset.count || countSpan.textContent.replace(/[^0-9]/g, '')) || 0;
        const isLiked = btn.classList.toggle('liked');

        if (isLiked) {
          count += 1;
        } else {
          count = Math.max(0, count - 1);
        }

        countSpan.dataset.count = count;
        countSpan.textContent = count > 999 ? `${(count / 1000).toFixed(1)}k` : count;
      });
    });

    // 4. Save / Bookmark Buttons
    const saveButtons = document.querySelectorAll('.btn-save');
    saveButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const isSaved = btn.classList.toggle('saved');
        showToast(isSaved ? 'Item saved to your bookmarks' : 'Item removed from bookmarks');
      });
    });

    // 5. Share Buttons (Copy Link)
    const shareButtons = document.querySelectorAll('.btn-share');
    shareButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          showToast('Link copied to clipboard!');
        } else {
          showToast('URL: ' + window.location.href);
        }
      });
    });

    // 6. Certificate Lightbox Modal
    const certModal = document.querySelector('.certificate-modal');
    const certModalImg = document.querySelector('.modal-cert-img');
    const certModalTitle = document.querySelector('.modal-cert-title');
    const certModalClose = document.querySelector('.modal-close-btn');

    document.querySelectorAll('.cert-thumbnail-card, .btn-cert-preview').forEach(card => {
      card.addEventListener('click', (e) => {
        const img = card.querySelector('img') || card;
        const src = card.getAttribute('data-img') || img.src;
        const title = card.getAttribute('data-title') || img.alt || 'Certificate Milestone';

        if (certModal && certModalImg) {
          certModalImg.src = src;
          certModalImg.alt = title;
          if (certModalTitle) certModalTitle.textContent = title;
          certModal.showModal();
        }
      });
    });

    if (certModalClose && certModal) {
      certModalClose.addEventListener('click', () => certModal.close());
      certModal.addEventListener('click', (e) => {
        if (e.target === certModal) certModal.close();
      });
    }

    // 7. Profile Avatar Photo Slideshow (2s Hold Transition Cycle across all 7 images in Images/Me)
    (function initAvatarSlideshow() {
      const profileSlideshow = document.getElementById('profileAvatarSlideshow');
      const sidebarSlideshow = document.getElementById('sidebarAvatarSlideshow');
      const profileImgs = profileSlideshow ? Array.from(profileSlideshow.querySelectorAll('.profile-avatar-img')) : [];
      const sidebarImgs = sidebarSlideshow ? Array.from(sidebarSlideshow.querySelectorAll('.sidebar-user-avatar')) : [];

      let currentIndex = 0;
      const total = Math.max(profileImgs.length, sidebarImgs.length);
      const HOLD_DURATION = 2000; // 2 seconds hold per image

      function goToSlide(nextIndex) {
        if (profileImgs.length > 0) {
          profileImgs.forEach((img, idx) => {
            if (idx === nextIndex) {
              img.classList.remove('prev');
              img.classList.add('active');
            } else if (idx === currentIndex) {
              img.classList.remove('active');
              img.classList.add('prev');
            } else {
              img.classList.remove('active', 'prev');
            }
          });
        }

        if (sidebarImgs.length > 0) {
          sidebarImgs.forEach((img, idx) => {
            if (idx === nextIndex) {
              img.classList.remove('prev');
              img.classList.add('active');
            } else if (idx === currentIndex) {
              img.classList.remove('active');
              img.classList.add('prev');
            } else {
              img.classList.remove('active', 'prev');
            }
          });
        }

        currentIndex = nextIndex;
      }

      function nextSlide() {
        if (total <= 1) return;
        const nextIndex = (currentIndex + 1) % total;
        goToSlide(nextIndex);
      }

      // Initialize slideshow timer: stays still for 2 seconds before each transition
      let timer = setInterval(nextSlide, HOLD_DURATION);

      function handleAvatarClick(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        // Advance to the next photo immediately without zooming in or opening modal
        nextSlide();
        // Reset the hold timer so the next automatic cycle waits a fresh 2 seconds
        clearInterval(timer);
        timer = setInterval(nextSlide, HOLD_DURATION);
      }

      // Profile avatar click/tap handler: cycles next photo directly
      const avatarAnchor = document.getElementById('profileAvatarAnchor') || document.querySelector('.profile-avatar-anchor');
      if (avatarAnchor) {
        avatarAnchor.addEventListener('click', handleAvatarClick);
      }

      // Sidebar avatar click/tap handler: cycles next photo directly
      const sidebarWrap = document.getElementById('sidebarAvatarSlideshow');
      if (sidebarWrap) {
        sidebarWrap.style.cursor = 'pointer';
        sidebarWrap.addEventListener('click', handleAvatarClick);
      }
    })();

    // 8. Real-time Live Visitors System & Profile Picture Stack (Desktop & Mobile Synchronized)
    (function initRealtimeVisitors() {
      const avatarContainers = document.querySelectorAll('.nav-visitor-avatars');
      const countEls = document.querySelectorAll('.nav-visitor-count');
      const labelEls = document.querySelectorAll('.nav-visitor-label');
      const widgets = document.querySelectorAll('.nav-visitor-widget');
      const modal = document.getElementById('visitorAvatarModal');
      const closeModalBtn = document.getElementById('closeVisitorModal');
      const previewImg = document.getElementById('visitorModalPreviewImg');
      const fileInput = document.getElementById('visitorFileInput');
      const githubInput = document.getElementById('visitorGithubInput');
      const githubBtn = document.getElementById('visitorGithubBtn');
      const randomBtn = document.getElementById('visitorRandomBtn');

      if (!avatarContainers.length) return;

      // 1. Session-unique tab visitor ID
      let visitorId = sessionStorage.getItem('ddga_tab_vid');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
        sessionStorage.setItem('ddga_tab_vid', visitorId);
      }

      function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return hash;
      }

      function generateAvatarUrl(seed) {
        const bgColors = ['ffd5dc', 'd1d4f9', 'c0aede', 'b6e3f4', 'ffdfbf', 'fed7aa', 'e9d5ff', 'ccfbf1'];
        const bg = bgColors[Math.abs(hashString(seed)) % bgColors.length];
        return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}`;
      }

      let myAvatar = localStorage.getItem('ddga_visitor_avatar_v2');
      if (!myAvatar) {
        myAvatar = generateAvatarUrl(visitorId);
        localStorage.setItem('ddga_visitor_avatar_v2', myAvatar);
      }

      let myName = localStorage.getItem('ddga_visitor_name_v2') || 'You';

      // Multi-tab instant sync via BroadcastChannel
      let broadcastChannel = null;
      try {
        broadcastChannel = new BroadcastChannel('ddga_live_visitors_bus');
        broadcastChannel.onmessage = (event) => {
          if (!event.data) return;
          if (event.data.type === 'visitor_join' || event.data.type === 'visitor_ping') {
            handleIncomingVisitor(event.data.visitor);
          } else if (event.data.type === 'visitor_leave') {
            handleVisitorLeave(event.data.visitorId);
          }
        };
      } catch (e) {}

      // Active visitor list starts empty (0 visitors)
      let visitorsList = [];

      function renderVisitors(list) {
        const total = list.length;

        if (total === 0) {
          avatarContainers.forEach(c => c.innerHTML = '');
          countEls.forEach(c => {
            c.style.display = 'none';
            c.textContent = '0';
          });
          labelEls.forEach(l => l.textContent = 'live');
          return;
        }

        // Show count across all desktop & mobile labels
        countEls.forEach(c => {
          c.style.display = 'inline';
          c.textContent = String(total);
        });
        labelEls.forEach(l => {
          if (l.id === 'mobileVisitorLabel') {
            l.textContent = total === 1 ? 'online' : 'online';
          } else {
            l.textContent = total === 1 ? 'person viewing now' : 'people viewing now';
          }
        });

        // Sort so current user is first
        const sorted = [...list].sort((a, b) => {
          if (a.id === visitorId) return -1;
          if (b.id === visitorId) return 1;
          return 0;
        });

        const visible = sorted.slice(0, 3);
        const plusCount = Math.max(0, total - visible.length);

        let html = '';
        visible.forEach((v, index) => {
          const zIndex = 5 - index;
          const isYou = v.id === visitorId;
          const isYouClass = isYou ? 'is-you' : '';
          const title = isYou ? 'Your visitor profile (Click to customize)' : (v.name || 'Active visitor');
          html += `
            <div class="visitor-avatar-bubble ${isYouClass} avatar-pop-in" style="z-index: ${zIndex};" title="${title}">
              <img src="${v.avatarUrl}" alt="${v.name || 'Visitor'}" onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/notionists/svg?seed=fallback';">
            </div>
          `;
        });

        if (plusCount > 0) {
          html += `<div class="visitor-avatar-plus">+${plusCount}</div>`;
        }

        avatarContainers.forEach(c => c.innerHTML = html);
      }

      function handleIncomingVisitor(v) {
        if (!v || !v.id) return;
        const idx = visitorsList.findIndex(item => item.id === v.id);
        if (idx >= 0) {
          visitorsList[idx] = { ...visitorsList[idx], ...v };
        } else {
          visitorsList.push(v);
        }
        renderVisitors(visitorsList);
      }

      function handleVisitorLeave(leaveId) {
        if (!leaveId) return;
        visitorsList = visitorsList.filter(item => item.id !== leaveId);
        renderVisitors(visitorsList);
      }

      // Heartbeat sync with server
      async function sendHeartbeat() {
        try {
          const res = await fetch('/api/visits/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId, avatarUrl: myAvatar, name: myName })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.visitors)) {
              visitorsList = data.visitors.map(v => ({
                ...v,
                isYou: v.id === visitorId
              }));
              renderVisitors(visitorsList);
            }
          }
        } catch (e) {
          // Fallback offline / standalone: register self
          if (!visitorsList.some(v => v.id === visitorId)) {
            visitorsList = [{ id: visitorId, avatarUrl: myAvatar, name: myName, isYou: true }];
            renderVisitors(visitorsList);
          }
        }
      }

      // Disconnect notification
      function sendLeave() {
        const payload = JSON.stringify({ visitorId });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/visits/leave', payload);
        } else {
          try {
            fetch('/api/visits/leave', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            });
          } catch (e) {}
        }
        if (broadcastChannel) {
          try {
            broadcastChannel.postMessage({ type: 'visitor_leave', visitorId });
          } catch (e) {}
        }
      }

      window.addEventListener('beforeunload', sendLeave);
      window.addEventListener('pagehide', sendLeave);

      // Initial state render (no visitors until heartbeat registers)
      renderVisitors([]);

      // Trigger heartbeat immediately and every 2.5s for real-time responsiveness
      sendHeartbeat();
      setInterval(sendHeartbeat, 2500);

      // Update avatar modal preview
      function updateMyAvatar(newUrl, newName) {
        myAvatar = newUrl;
        if (newName) myName = newName;
        localStorage.setItem('ddga_visitor_avatar_v2', myAvatar);
        if (newName) localStorage.setItem('ddga_visitor_name_v2', myName);

        if (previewImg) previewImg.src = myAvatar;

        const youIdx = visitorsList.findIndex(v => v.id === visitorId);
        if (youIdx >= 0) {
          visitorsList[youIdx].avatarUrl = myAvatar;
          if (newName) visitorsList[youIdx].name = myName;
        } else {
          visitorsList.unshift({ id: visitorId, avatarUrl: myAvatar, name: myName, isYou: true });
        }

        renderVisitors(visitorsList);
        sendHeartbeat();

        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'visitor_ping',
            visitor: { id: visitorId, avatarUrl: myAvatar, name: myName }
          });
        }
        showToast('Visitor profile picture updated!');
      }

      // Modal Triggers & Actions across desktop and mobile
      if (widgets.length && modal) {
        widgets.forEach(w => {
          w.addEventListener('click', (e) => {
            e.preventDefault();
            if (previewImg) previewImg.src = myAvatar;
            modal.showModal();
          });
        });
      }

      if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => modal.close());
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.close();
        });
      }

      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              updateMyAvatar(evt.target.result, 'You');
              if (modal) modal.close();
            };
            reader.readAsDataURL(file);
          }
        });
      }

      if (githubBtn && githubInput) {
        githubBtn.addEventListener('click', () => {
          const val = githubInput.value.trim().replace(/^@/, '');
          if (val) {
            const ghUrl = `https://github.com/${val}.png`;
            updateMyAvatar(ghUrl, `@${val}`);
            githubInput.value = '';
            if (modal) modal.close();
          } else {
            showToast('Please enter a GitHub username');
          }
        });
      }

      if (randomBtn) {
        randomBtn.addEventListener('click', () => {
          const randSeed = 'v_' + Math.random().toString(36).substring(2, 10);
          updateMyAvatar(generateAvatarUrl(randSeed), 'Visitor');
        });
      }
    })();

    // 8b. Interactive Peeking Mascot Controller (Peeking Edge, Waving, Winking, and Peace Sign)
    (function initPeekingMascot() {
      const peeker = document.getElementById('sidebarPeeker');
      if (!peeker) return;

      const bubble = document.getElementById('peekerSpeechBubble');
      const bubbleText = document.getElementById('peekerBubbleText');
      const posePeek = document.getElementById('peekerPosePeek');
      const posePeace = document.getElementById('peekerPosePeace');
      const poseWink = document.getElementById('peekerPoseWink');

      const poses = [
        { id: 'peek', el: posePeek, phrases: ['Peek-a-boo! 👀', 'Just checking in! ✨', 'Looking around! 🔍'] },
        { id: 'peace', el: posePeace, phrases: ['Peace & good vibes! ✌️', 'Glad you stopped by! ✌️', 'Have a great day! ✨'] },
        { id: 'wink', el: poseWink, phrases: ["Let's build something cool! 😉", 'Open for Internship! 💼', 'Web & Graphic Design! 🎨'] }
      ];

      let currentPoseIdx = 0;
      let bubbleTimeout = null;

      function setPose(index, showBubblePhrase = false, customPhrase = null) {
        currentPoseIdx = index % poses.length;
        poses.forEach((p, idx) => {
          if (p.el) {
            p.el.classList.toggle('active', idx === currentPoseIdx);
          }
        });

        if (showBubblePhrase && bubble && bubbleText) {
          const phraseList = poses[currentPoseIdx].phrases;
          const phrase = customPhrase || phraseList[Math.floor(Math.random() * phraseList.length)];
          bubbleText.textContent = phrase;
          bubble.classList.add('visible');

          if (bubbleTimeout) clearTimeout(bubbleTimeout);
          bubbleTimeout = setTimeout(() => {
            bubble.classList.remove('visible');
          }, 3200);
        }
      }

      // Cycle poses automatically over time (idle animation)
      setInterval(() => {
        const nextIdx = (currentPoseIdx + 1) % poses.length;
        setPose(nextIdx, false);
      }, 5000);

      // On Hover: Show greeting, peace sign, or wink!
      peeker.addEventListener('mouseenter', () => {
        const interactiveChoices = [1, 2]; // peace or wink
        const interactiveIdx = interactiveChoices[Math.floor(Math.random() * interactiveChoices.length)];
        setPose(interactiveIdx, true);
      });

      // On Click / Tap: Trigger next pose, playful reaction phrase, and bubble burst!
      let lastPeekerTap = 0;
      function handlePeekerInteraction(clientX, clientY) {
        const now = Date.now();
        if (now - lastPeekerTap < 200) return;
        lastPeekerTap = now;
        const nextIdx = (currentPoseIdx + 1) % poses.length;
        setPose(nextIdx, true);
        if (typeof triggerGooeyClick === 'function' && clientX !== undefined && clientY !== undefined) {
          triggerGooeyClick(clientX, clientY);
        }
      }

      peeker.addEventListener('click', (e) => {
        handlePeekerInteraction(e.clientX, e.clientY);
      });

      peeker.addEventListener('touchend', (e) => {
        const touch = e.changedTouches && e.changedTouches[0];
        if (touch) {
          handlePeekerInteraction(touch.clientX, touch.clientY);
        }
      }, { passive: true });
    })();

    // 9. Connect / Message Drawer or Action
    const msgButtons = document.querySelectorAll('.btn-message, .sidebar-cta-btn');
    msgButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Smoothly filter or scroll to contact section
        filterFeed('about');
        showToast('Contact information open below!');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreadsInterface);
  } else {
    initThreadsInterface();
  }
})();
