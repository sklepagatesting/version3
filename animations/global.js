// textAnimations.js
document.addEventListener('fontLoadedAndPageVisible', () => {
  console.log('Font loaded and page visible, initializing text animations.');

  // Combine both classes
  const textElements = document.querySelectorAll('.rise, .sliding-up');

  textElements.forEach(textElement => {
    // Avoid double-processing if innerHTML already contains spans
    if (textElement.querySelector('span')) return;

    const words = textElement.textContent.trim().split(' ');
    textElement.innerHTML = words.map((word, index) => {
      const separator = (index < words.length - 1) ? '&nbsp;' : '';
      return `<span style="animation-delay: ${index * 0.1}s">${word}${separator}</span>`;
    }).join('');

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observerInstance.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    observer.observe(textElement);
  });
});





const containers = document.querySelectorAll('.text-container');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const textLine = entry.target.querySelector('.text-line');
      if (textLine) {
        const index = [...containers].indexOf(entry.target); // stable index
        textLine.classList.add('animate');
        textLine.style.animationDelay = `${index * 1}s`;
        observer.unobserve(entry.target);
      }
    }
  });
}, {
  threshold: 1
});

containers.forEach(container => {
  observer.observe(container);
});



function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|Tablet|Touch/i.test(navigator.userAgent);
  }

  function setMobileViewportHeight() {
    if (!isMobileDevice()) return;

    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  window.addEventListener('DOMContentLoaded', setMobileViewportHeight);
  window.addEventListener('resize', setMobileViewportHeight);




  // Image Updater
  function showImage(target) {
  if (!target) return;

  const mobile = target.dataset.imgMobile;
  const tablet = target.dataset.imgTablet;
  const desktop = target.dataset.img;

  let newSrc = desktop;
  const width = window.innerWidth;

  if (width <= 767 && mobile) {
    newSrc = mobile;
  } else if (width <= 1023 && tablet) {
    newSrc = tablet;
  }

  if (!newSrc || newSrc === lastSrc) return;

  lastSrc = newSrc;

  // Update active state
  if (lastHovered && lastHovered !== target) {
    lastHovered.classList.remove("bg-gray-100");
  }
  target.classList.add("bg-gray-100");
  lastHovered = target;

  // Speed calculation
  const now = performance.now();
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  const dt = now - lastMoveTime;
  const distance = dt > 0 ? Math.sqrt(dx * dx + dy * dy) : 0;
  const speed = dt > 0 ? distance / dt : 0;
  const fastThreshold = 0.5;
  const duration = speed > fastThreshold ? 0.2 : 0.4;

  // Animate image transition
  gsap.killTweensOf([currentImage, nextImage]);

  nextImage.src = newSrc;
  gsap.set(nextImage, { scale: 1.1, opacity: 0, zIndex: 2 });
  gsap.set(currentImage, { zIndex: 1 });

  gsap.to(nextImage, {
    opacity: 1,
    scale: 1,
    duration,
    ease: "power2.out",
    onComplete: () => {
      currentImage.src = newSrc;
      gsap.set(currentImage, { opacity: 1 });
      gsap.set(nextImage, { opacity: 0 });
    }
  });
}








document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("playReel");
  const overlayBg = document.getElementById("videoOverlayBg");
  let expanded = false;
  let placeholder = null;

  function toggleVideoOverlay() {
    if (!expanded) {
      // Create placeholder to keep layout
      placeholder = document.createElement("div");
      placeholder.style.width = `${video.offsetWidth}px`;
      placeholder.style.height = `${video.offsetHeight}px`;
      video.parentNode.insertBefore(placeholder, video);

      // Get current video position/size before moving
      const rect = video.getBoundingClientRect();

      // Freeze position & size immediately to avoid jump
      gsap.set(video, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: "0px",
        zIndex: 9999,
        margin: 0
      });

      // Move to body AFTER locking styles
      document.body.appendChild(video);

      // Show overlay background
      overlayBg.style.pointerEvents = "auto";
      gsap.to(overlayBg, {
        opacity: 1,
        duration: 0.8,
        ease: "power3.inOut"
      });

      // Expand video
      const target = window.innerWidth > 768
        ? { width: window.innerWidth, height: window.innerHeight }
        : (() => {
            const w = window.innerWidth * 0.9;
            return { width: w, height: w * (9 / 16) };
          })();

      gsap.to(video, {
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        ...target,
        borderRadius: "8px",
        duration: 0.8,
        ease: "power3.inOut"
      });

      document.body.classList.add("overlay-active");

    } else {
      // Animate back to placeholder position/size
      const rect = placeholder.getBoundingClientRect();

      gsap.to(video, {
        top: rect.top,
        left: rect.left,
        xPercent: 0,
        yPercent: 0,
        width: rect.width,
        height: rect.height,
        borderRadius: "0px",
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          // Restore original position in DOM
          video.style = "";
          placeholder.parentNode.insertBefore(video, placeholder);
          placeholder.remove();
          placeholder = null;
        }
      });

      // Hide overlay background
      gsap.to(overlayBg, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.8,
        ease: "power3.inOut"
      });

      document.body.classList.remove("overlay-active");
    }

    expanded = !expanded;
  }

  // Event listeners
  video.addEventListener("click", toggleVideoOverlay);
  overlayBg.addEventListener("click", toggleVideoOverlay);

  // Handle resize while expanded
  window.addEventListener("resize", () => {
    if (expanded) {
      const target = window.innerWidth > 768
        ? { width: window.innerWidth, height: window.innerHeight }
        : (() => {
            const w = window.innerWidth * 0.9;
            return { width: w, height: w * (9 / 16) };
          })();
      gsap.set(video, target);
    }
  });
});
