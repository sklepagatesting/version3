document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ModifiersPlugin);

  const scroller = document.getElementById("scroller");
  const cards = Array.from(scroller.children);

  // Duplicate cards for seamless loop
  scroller.append(...cards.map(card => card.cloneNode(true)));
  const allCards = Array.from(scroller.children);

  const scrollWidth = scroller.scrollWidth / 2;
  const marginRight = parseFloat(getComputedStyle(cards[0]).marginRight) || 0;

  let position = marginRight;
  let velocity = 0;
  let scrollAllowed = false;

  // Initial GPU-friendly state
  gsap.set(scroller, { x: position });
  gsap.set(allCards, { scaleY: 0, transformOrigin: "bottom center", willChange: "transform" });

  // Scroll lock/unlock helpers
  const lockScroll = () => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
  };
  const unlockScroll = () => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.height = '';
  };
  lockScroll();

  // Intro delay for first visit
  const isFirstVisit = sessionStorage.getItem("hasVisited") !== "true";
  const introDelay = isFirstVisit ? 3000 : 2500;
  sessionStorage.setItem("hasVisited", "true");

  // Intro animation
  gsap.delayedCall(introDelay / 1000, () => {
    const fastDistance = scrollWidth * 1.5;
    gsap.timeline({
      onComplete: () => {
        position = gsap.getProperty(scroller, "x");
        unlockScroll();
        scrollAllowed = true;
      }
    })
    .to(allCards, {
      scaleY: 1,
      duration: 1,
      ease: "power4.out",
      stagger: 0.02
    }, 0)
    .to(scroller, {
      x: `-=${fastDistance}`,
      duration: 2,
      ease: "power4.out",
      modifiers: {
        x: gsap.utils.unitize(x => (parseFloat(x) % scrollWidth))
      }
    }, 0);
  });

  // --- SMOOTH INFINITE SCROLL LOGIC ---
  const wrapX = gsap.utils.wrap(-scrollWidth, 0);
  let ticking = false;

  function startTicker() {
    if (ticking) return;
    ticking = true;
    gsap.ticker.add(updateScroll);
  }

  function stopTicker() {
    if (!ticking) return;
    ticking = false;
    gsap.ticker.remove(updateScroll);
  }

  function updateScroll() {
    position -= velocity;
    velocity *= 0.94; // smooth friction

    if (Math.abs(velocity) < 0.001) {
      stopTicker();
      return;
    }

    gsap.set(scroller, { x: wrapX(position) });
  }

  // Wheel input
  window.addEventListener("wheel", e => {
    if (!scrollAllowed) return;
    velocity += e.deltaY * 0.05;
    startTicker();
  }, { passive: true });

  // Touch input
  let startY;
  window.addEventListener("touchstart", e => {
    if (!scrollAllowed) return;
    startY = e.touches[0].clientY;
    velocity = 0;
  }, { passive: true });

  window.addEventListener("touchmove", e => {
    if (!scrollAllowed) return;
    const deltaY = e.touches[0].clientY - startY;
    velocity += -deltaY * 0.12;
    startY = e.touches[0].clientY;
    startTicker();
  }, { passive: true });
});










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
