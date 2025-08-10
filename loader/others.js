// --- Inject transition elements and styles early ---
(function injectTransitionElements() {
  const style = document.createElement("style");
  style.innerHTML = `
    html, body {
      background: white;
      margin: 0;
      padding: 0;
    }
    #page-transition {
      position: fixed;
      bottom: 0;
      left: 50%;
      width: 60px;
      height: 10px;
      background: white;
      border-radius: 50%;
      transform: translateX(-50%) translateY(0) scale(1);
      z-index: 10000;
      pointer-events: none;
      transition:
        bottom 1s ease-in-out,
        width 1s ease-in-out,
        height 1s ease-in-out,
        transform 1s ease-in-out;
      display: none;
    }
    #page-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0);
      pointer-events: none;
      z-index: 9999;
      transition: background 1s ease-in-out;
      display: none;
    }
  `;
  document.head.appendChild(style);

  const transitionDiv = document.createElement("div");
  transitionDiv.id = "page-transition";
  const overlayDiv = document.createElement("div");
  overlayDiv.id = "page-overlay";

  document.body.prepend(overlayDiv);
  document.body.prepend(transitionDiv);
})();

// --- Loader run conditions ---
const shouldRunLoader = (() => {
  const isFirstLoad = !sessionStorage.getItem('hasRunLoader');
  let navigationType = 'navigate';
  if (window.performance?.getEntriesByType) {
    const navEntries = window.performance.getEntriesByType("navigation");
    if (navEntries.length) navigationType = navEntries[0].type;
  }
  return isFirstLoad && navigationType !== 'back_forward';
})();

// --- IntersectionObserver for text reveal ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const textLine = entry.target.querySelector('.text-line');
      if (textLine) {
        const allContainers = [...document.querySelectorAll('.text-container')];
        const index = allContainers.indexOf(entry.target);
        textLine.style.animationDelay = `${index * 0.2}s`;
        textLine.classList.add('animate');
        observer.unobserve(entry.target);
      }
    }
  });
}, { threshold: 1 });

function startObservingText() {
  document.querySelectorAll('.text-container').forEach(container => {
    observer.observe(container);
  });
}

// --- Hero animation ---
function heroIn() {
  gsap.from(".hero", {
    y: 50,
    opacity: 0,
    duration: 1.2,
    ease: "power4.inOut"
  });
}

// --- Loader animation ---
function runLoader() {
  const screen = document.createElement('div');
  Object.assign(screen.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100dvh',
    backgroundColor: 'white',
    zIndex: '999999999',
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transform: 'scale(1)',
    transition: 'clip-path 1s cubic-bezier(.94,-0.01,0,.99), transform 1s cubic-bezier(.89,.04,0,.99)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
    fontSize: '12px',
    fontFamily: 'Arial, sans-serif'
  });
  document.documentElement.appendChild(screen);

  const shadowOverlay = document.createElement('div');
  Object.assign(shadowOverlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100dvh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: '999999998',
    opacity: '1',
    transition: 'opacity 1s ease-out'
  });
  document.documentElement.appendChild(shadowOverlay);

  const whiteOverlay = document.createElement('div');
  Object.assign(whiteOverlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100dvh',
    backgroundColor: 'white',
    zIndex: '999999997'
  });
  document.documentElement.appendChild(whiteOverlay);

  const counter = document.createElement('div');
  counter.textContent = '0%';
  counter.style.transform = 'scale(1)';
  counter.style.transition = 'transform 0.2s ease';
  screen.appendChild(counter);

  let fakeProgress = 0;
  let interval = setInterval(() => {
    if (fakeProgress < 90) {
      fakeProgress += Math.random() * 5;
      counter.textContent = `${Math.floor(fakeProgress)}%`;
      counter.style.transform = `scale(${1 + fakeProgress / 100})`;
    }
  }, 100);

  window.addEventListener('load', () => {
    clearInterval(interval);

    let finalProgress = fakeProgress;
    const completeInterval = setInterval(() => {
      finalProgress += 2;
      counter.textContent = `${Math.min(100, Math.floor(finalProgress))}%`;
      counter.style.transform = `scale(${1 + finalProgress / 100})`;

      if (finalProgress >= 100) {
        clearInterval(completeInterval);
        screen.style.clipPath = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
        screen.style.transform = 'scale(0)';
        shadowOverlay.style.opacity = '0';

        setTimeout(() => {
          screen.remove();
          shadowOverlay.remove();
          whiteOverlay.remove();
          document.getElementById("main-content")?.style.setProperty("display", "block");
          document.body.style.overflow = "auto";
          document.body.classList.remove("preload");

          heroIn();
          startObservingText();
          window.dispatchEvent(new Event("scroller:start"));
        }, 1000);
      }
    }, 20);
  });
}

// --- Loader control ---
document.addEventListener('DOMContentLoaded', () => {
  if (shouldRunLoader) {
    runLoader();
    sessionStorage.setItem('hasRunLoader', 'true');
  } else {
    document.getElementById("main-content")?.style.setProperty("display", "block");
    document.body.style.overflow = "auto";
    document.body.classList.remove("preload");
    startObservingText();
    window.dispatchEvent(new Event("scroller:start"));
    heroIn();
  }
});

// --- Breakpoint reload ---
const BREAKPOINTS = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity }
};
function getBreakpoint() {
  const w = window.innerWidth;
  if (w <= BREAKPOINTS.mobile.max) return "mobile";
  if (w <= BREAKPOINTS.tablet.max) return "tablet";
  return "desktop";
}
let prevBreakpoint = getBreakpoint();
window.addEventListener("resize", () => {
  const bp = getBreakpoint();
  if (bp !== prevBreakpoint) {
    sessionStorage.removeItem("hasRunLoader");
    location.reload();
  }
});

// --- Idle session reset ---
let activityTimer;
const IDLE_TIMEOUT = 5 * 60 * 1000;
function resetIdleTimer() {
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    sessionStorage.removeItem('hasRunLoader');
    console.log("Idle detected, loader flag reset.");
  }, IDLE_TIMEOUT);
}
['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
  document.addEventListener(evt, resetIdleTimer, false)
);
resetIdleTimer();

// --- bfcache handling ---
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    document.getElementById("main-content")?.style.setProperty("display", "block");
    document.body.style.overflow = "auto";
    document.body.classList.remove("preload");
  }
});
