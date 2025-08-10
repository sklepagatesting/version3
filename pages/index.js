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








