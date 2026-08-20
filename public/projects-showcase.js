// Interactive Project Card Showcase, Carousel & Lightbox
(function () {
  const slidesData = [
    {
      type: 'video',
      src: 'Images/AI skinwise/AI skinwise vid intro.mp4',
      title: 'AI Skinwise Introduction Video',
      duration: 5500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/Scanner Interface.png',
      title: 'Scanner Interface — Live Camera AI Viewfinder',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/Scanner Taking Image.png',
      title: 'Scanner Taking Image & High Precision Focus',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/Clinics - Scan Detected - Analysis.png',
      title: 'AI Scan Disease Classification & Confidence Score',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/Clinics - Scan Detected.png',
      title: 'Condition Overview & Recommended Medical Clinics',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/Clinics - Select - Scheduling - Done.png',
      title: 'Appointment Booking & Consultation Scheduling',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/Clinics.png',
      title: 'Partner Dermatology Clinics Directory',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/User - Homepage.png',
      title: 'Patient Dashboard & Health Management Hub',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/User - Diseases.png',
      title: 'Skin Conditions Library & Educational Reference',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/Message Interface.png',
      title: 'Specialist Messages & Tele-Dermatology Inquiries',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/Message Interface - Conversation.png',
      title: 'Real-time Specialist Consultation Chat',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/User - Notification.png',
      title: 'Reminders & Medical Status Notifications',
      duration: 3500
    },
    {
      type: 'image',
      src: 'Images/AI skinwise/User - Profile.png',
      title: 'User Medical Profile & Security Settings',
      duration: 3500
    }
  ];

  function initProjectShowcase() {
    const toggleBtn = document.getElementById('projectToggleBtn');
    const dropdownContent = document.getElementById('projectDetailsContent');
    const track = document.getElementById('carouselTrack');
    const indicatorsWrap = document.getElementById('carouselIndicators');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const carousel = document.getElementById('projectCarousel');
    const video = document.getElementById('skinwiseIntroVideo');
    const lightboxModal = document.getElementById('projectLightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');

    if (!toggleBtn || !dropdownContent || !track) return;

    let currentSlide = 0;
    let autoPlayTimer = null;
    let isHovering = false;
    let isExpanded = false;
    let lightboxCurrentIdx = 1; // image index for lightbox

    // Generate Indicator Dots
    indicatorsWrap.innerHTML = '';
    slidesData.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `indicator-dot ${idx === 0 ? 'active' : ''}`;
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(idx);
        startAutoPlay();
      });
      indicatorsWrap.appendChild(dot);
    });

    const dots = indicatorsWrap.querySelectorAll('.indicator-dot');
    function goToSlide(index) {
      currentSlide = (index + slidesData.length) % slidesData.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === currentSlide);
      });

      // Reset scroll position on other slides
      const allSlides = track.querySelectorAll('.carousel-slide');
      allSlides.forEach((s, idx) => {
        if (idx !== currentSlide) {
          s.scrollTop = 0;
        }
      });

      // Handle video behavior
      if (video) {
        if (currentSlide === 0) {
          try {
            video.currentTime = 0;
            video.play().catch(() => {});
          } catch (e) {}
        } else {
          try {
            video.pause();
          } catch (e) {}
        }
      }
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
      if (autoPlayTimer) clearTimeout(autoPlayTimer);
      if (!isExpanded || isHovering) return;

      const currentDuration = slidesData[currentSlide]?.duration || 3500;
      autoPlayTimer = setTimeout(() => {
        nextSlide();
        startAutoPlay();
      }, currentDuration);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    // Dropdown accordion toggle
    function toggleDropdown() {
      isExpanded = !isExpanded;
      toggleBtn.classList.toggle('expanded', isExpanded);
      toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      dropdownContent.classList.toggle('expanded', isExpanded);

      if (isExpanded) {
        goToSlide(0);
        startAutoPlay();
      } else {
        stopAutoPlay();
        if (video) {
          try { video.pause(); } catch (e) {}
        }
      }
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // Also toggle when clicking anywhere on the summary header card
    const summaryCard = document.querySelector('.project-card-summary');
    if (summaryCard) {
      summaryCard.style.cursor = 'pointer';
      summaryCard.addEventListener('click', (e) => {
        if (e.target.closest('.project-tag') || e.target.closest('.project-dropdown-btn')) return;
        toggleDropdown();
      });
    }

    // Carousel Navigation Controls
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
        startAutoPlay();
      });
    }

    if (carousel) {
      // Pause on hover
      carousel.addEventListener('mouseenter', () => {
        isHovering = true;
        stopAutoPlay();
      });

      carousel.addEventListener('mouseleave', () => {
        isHovering = false;
        startAutoPlay();
      });

      // Tap / Click to open fullscreen lightbox
      carousel.addEventListener('click', (e) => {
        if (e.target.closest('.carousel-nav-btn')) return;
        openLightbox(currentSlide);
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fullscreen Lightbox Logic
    // ─────────────────────────────────────────────────────────────────────────
    function openLightbox(index) {
      if (!lightboxModal) return;
      const slide = slidesData[index];
      if (!slide) return;

      // If video, we can switch to first image or display video
      if (slide.type === 'video') {
        // Jump to first screenshot for clear image inspection
        index = 1;
      }

      lightboxCurrentIdx = index;
      updateLightboxContent();

      if (typeof lightboxModal.showModal === 'function') {
        lightboxModal.showModal();
      } else {
        lightboxModal.setAttribute('open', '');
      }
      stopAutoPlay();
    }

    function updateLightboxContent() {
      const slide = slidesData[lightboxCurrentIdx];
      if (!slide) return;

      if (lightboxImg) {
        lightboxImg.src = slide.src;
        lightboxImg.alt = slide.title;
      }
      if (lightboxTitle) {
        lightboxTitle.textContent = slide.title;
      }
      if (lightboxCounter) {
        const imageSlides = slidesData.filter(s => s.type === 'image');
        const currentImgNum = lightboxCurrentIdx; // since index 0 is video
        lightboxCounter.textContent = `${currentImgNum} / ${imageSlides.length}`;
      }
    }

    function closeLightbox() {
      if (!lightboxModal) return;
      if (typeof lightboxModal.close === 'function') {
        lightboxModal.close();
      } else {
        lightboxModal.removeAttribute('open');
      }
      if (isExpanded && !isHovering) {
        startAutoPlay();
      }
    }

    function nextLightbox() {
      let nextIdx = lightboxCurrentIdx + 1;
      if (nextIdx >= slidesData.length) nextIdx = 1; // loop back to first image
      lightboxCurrentIdx = nextIdx;
      updateLightboxContent();
    }

    function prevLightbox() {
      let prevIdx = lightboxCurrentIdx - 1;
      if (prevIdx < 1) prevIdx = slidesData.length - 1;
      lightboxCurrentIdx = prevIdx;
      updateLightboxContent();
    }

    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', closeLightbox);
    }

    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevLightbox();
      });
    }

    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextLightbox();
      });
    }

    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
          closeLightbox();
        }
      });
    }

    // Keyboard navigation (Arrow keys + Esc)
    window.addEventListener('keydown', (e) => {
      if (lightboxModal && lightboxModal.open) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectShowcase);
  } else {
    initProjectShowcase();
  }
})();
