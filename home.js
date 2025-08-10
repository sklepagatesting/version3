gsap.registerPlugin(CustomEase);

CustomEase.create("hop", "M0,0 C0.07,0.42 0.18,0.98 0.3,1 0.4,0.99 0.52,0.52 0.6,0.5 0.71,0.48 0.78,0.98 1,1");

const tl = gsap.timeline({
    delay: 0.5
});

tl.to(".counter .digits", {
    y: "-100%",
    stagger: 0.1,
    ease: "power2.inOut",
    duration: 1.5
})
.to(".spinner", {
    opacity: 0,
    duration: 0.5
}, "-=1")
.to(".intro-logo .word", {
    y: 0,
    stagger: 0.2,
    ease: "power2.out",
    duration: 1
}, "-=1")
.to(".divider", {
    scaleY: 1,
    duration: 1,
    ease: "power2.out"
}, "-=0.5")
.to(".divider", {
    opacity: 0,
    duration: 0.5
})
.to(".intro-logo .word", {
    y: "-100%",
    stagger: 0.2,
    ease: "power2.in",
    duration: 1
}, "-=0.5")
.to(".dark-bg-blocks .block", {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    stagger: 0.1,
    duration: 1,
    ease: "power2.inOut"
}, "-=0.5")
.to(".hero-image", {
    scale: 0.9,
    duration: 1,
    ease: "power2.out"
}, "-=1")
.to([".nav-bar", ".header-section h1 span", ".header-section p", ".cta-section"], {
    opacity: 1,
    y: 0,
    stagger: 0.1,
    duration: 1,
    ease: "power2.out"
}, "-=0.5")
// HIGHLIGHT: This is the new line that fixes the issue
.to(".loader", { display: "none" });