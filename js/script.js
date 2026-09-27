const sections = document.querySelectorAll('.portfolio-section');
const lastSection = sections[sections.length - 1];
const footer = document.querySelector('#footer');
const ctaArrow = document.querySelector('.section-arrow--cta');

window.addEventListener(
  'wheel',
  (event) => {
    const info = event.target.closest('.project-info');

    if (info) {
      const atTop = info.scrollTop <= 0;
      const atBottom = Math.ceil(info.scrollTop + info.clientHeight) >= info.scrollHeight;
      const scrollingUp = event.deltaY < 0;
      const scrollingDown = event.deltaY > 0;

      if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
        event.preventDefault();
      }
      return;
    }

    event.preventDefault();
  },
  { passive: false }
);

const footerHotzones = document.querySelectorAll('.footer-hotzone');

if (footer && footerHotzones.length) {
  let footerLocked = false;

  const hideFooter = () => {
    footerLocked = false;
    footer.classList.remove('is-visible');
  };

  const hotzoneActivationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const hotzone = entry.target.querySelector('.footer-hotzone');
        if (!hotzone) return;
        hotzone.classList.toggle('is-active', entry.isIntersecting);
        if (!entry.isIntersecting) {
          hideFooter();
        }
      });
    },
    { threshold: 0.6 }
  );

  footerHotzones.forEach((hotzone) => {
    const section = hotzone.closest('.portfolio-section');
    if (section) hotzoneActivationObserver.observe(section);

    hotzone.addEventListener('mouseenter', () => footer.classList.add('is-visible'));
    hotzone.addEventListener('mouseleave', () => {
      if (!footerLocked) footer.classList.remove('is-visible');
    });
  });

  footer.addEventListener('mouseenter', () => {
    footerLocked = true;
  });

  document.addEventListener('click', (event) => {
    if (footerLocked && !footer.contains(event.target)) {
      hideFooter();
    }
  });
}

const infoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const info = entry.target.querySelector('.project-info');
      if (info) {
        info.classList.toggle('is-visible', entry.isIntersecting);
      }
    });
  },
  { threshold: 0.35 }
);

sections.forEach((section) => {
  if (section.querySelector('.project-info')) {
    infoObserver.observe(section);
  }
});

const phoneVideos = document.querySelectorAll('.phone-video');
const mobileVideoQuery = window.matchMedia('(max-width: 768px), (max-aspect-ratio: 4/5)');

const setVideoSource = (video) => {
  const wanted = mobileVideoQuery.matches ? video.dataset.srcMobile : video.dataset.srcDesktop;
  if (video.dataset.activeSrc !== wanted) {
    video.dataset.activeSrc = wanted;
    video.src = wanted;
    video.load();
  }
};

phoneVideos.forEach(setVideoSource);
mobileVideoQuery.addEventListener('change', () => phoneVideos.forEach(setVideoSource));

const positionRectOverlay = (el) => {
  const section = el.closest('.portfolio-section');
  const img = section && section.querySelector('picture img');
  if (!img || !img.naturalWidth || !img.naturalHeight) return;

  const rectAttr = mobileVideoQuery.matches ? el.dataset.rectMobile : el.dataset.rectDesktop;
  const [rx, ry, rw, rh] = rectAttr.split(',').map(Number);

  const containerW = section.clientWidth;
  const containerH = section.clientHeight;
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  // Reproduce the object-fit: cover scaling/cropping math applied to the
  // background image so the overlay lines up with it exactly, whatever the
  // viewport's aspect ratio.
  const scale = Math.max(containerW / naturalW, containerH / naturalH);
  const offsetX = (naturalW * scale - containerW) / 2;
  const offsetY = (naturalH * scale - containerH) / 2;

  el.style.left = `${rx * naturalW * scale - offsetX}px`;
  el.style.top = `${ry * naturalH * scale - offsetY}px`;
  el.style.width = `${rw * naturalW * scale}px`;
  el.style.height = `${rh * naturalH * scale}px`;
};

const positionPhoneVideo = (video) => {
  positionRectOverlay(video);
  video.classList.add('is-positioned');
};

const imageHotspots = document.querySelectorAll('.image-hotspot');
const rectOverlays = [...phoneVideos, ...imageHotspots];
const positionAllRectOverlays = () =>
  rectOverlays.forEach((el) => (el.classList.contains('phone-video') ? positionPhoneVideo(el) : positionRectOverlay(el)));

rectOverlays.forEach((el) => {
  const img = el.closest('.portfolio-section').querySelector('picture img');
  const position = () => (el.classList.contains('phone-video') ? positionPhoneVideo(el) : positionRectOverlay(el));
  if (img.complete) {
    position();
  }
  img.addEventListener('load', position);
});

window.addEventListener('resize', positionAllRectOverlays);
window.addEventListener('orientationchange', positionAllRectOverlays);
mobileVideoQuery.addEventListener('change', positionAllRectOverlays);

const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target.querySelector('.phone-video');
      if (!video) return;

      if (entry.isIntersecting) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  },
  { threshold: 0.5 }
);

sections.forEach((section) => {
  if (section.querySelector('.phone-video')) {
    videoObserver.observe(section);
  }
});

const gallery = document.querySelector('.gallery-carousel');

if (gallery) {
  const track = gallery.querySelector('.gallery-carousel__track');
  const slides = Array.from(gallery.querySelectorAll('.gallery-carousel__slide'));
  const prevButton = gallery.querySelector('.gallery-carousel__nav--prev');
  const nextButton = gallery.querySelector('.gallery-carousel__nav--next');
  const dotsContainer = gallery.querySelector('.gallery-carousel__dots');
  let currentIndex = 0;

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-carousel__dot';
    dot.setAttribute('aria-label', `Aller au projet ${index + 1}`);
    dot.addEventListener('click', () => goTo(index));
    dotsContainer.append(dot);
    return dot;
  });

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentIndex));
  }

  prevButton.addEventListener('click', () => goTo(currentIndex - 1));
  nextButton.addEventListener('click', () => goTo(currentIndex + 1));

  goTo(0);
}

if (ctaArrow) {
  ctaArrow.addEventListener('click', () => {
    ctaArrow.classList.add('is-activated');

    for (let index = 0; index < 14; index += 1) {
      const sparkle = document.createElement('span');
      const angle = (Math.PI * 2 * index) / 14;
      const distance = 2.5 + (index % 3) * 0.8;

      sparkle.className = 'sparkle';
      sparkle.style.setProperty('--sparkle-x', `${Math.cos(angle) * distance}rem`);
      sparkle.style.setProperty('--sparkle-y', `${Math.sin(angle) * distance}rem`);
      ctaArrow.append(sparkle);
      sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
    }
  });
}