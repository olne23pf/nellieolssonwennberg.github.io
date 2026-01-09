/*
//---- start function ----//
const heroTitle = document.querySelector(".hero-title");
const header = document.querySelector(".navbar");
const pagelayout = document.querySelector(".pageLayout");

//--Hamburger--//
const hamburgermenu = document.querySelector(".headerright");
const hamburgermenuOther = document.querySelector(".headerright_other");

const startFont = 6; // rem (startstorlek)
const endFont = 4; // rem (målet när den blir fixed)
const maxScroll = 300; // px scroll för krympning

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  if (scrollY < maxScroll) {
    let progress = scrollY / maxScroll;
    let newFont = startFont - (startFont - endFont) * progress;
    heroTitle.style.fontSize = newFont + "rem";
    heroTitle.classList.remove("fixed");

    // Endast ta bort 'visible' om menyn inte är aktiv
    if (!document.querySelector(".hamburger").classList.contains("active")) {
      header.classList.remove("visible");
      pagelayout.classList.remove("visible");
      hamburgermenu.classList.remove("visible");
    }
  } else {
    heroTitle.style.fontSize = endFont + "rem";
    heroTitle.classList.add("fixed");

    // Lägg till 'visible' alltid (så headern syns) utan att stänga menyn
    header.classList.add("visible");
    pagelayout.classList.add("visible");
    hamburgermenu.classList.add("visible");
  }
});*/

//---- HERO ----//
const heroTitle = document.querySelector(".hero-title");
const header = document.querySelector(".navbar");
const pagelayout = document.querySelector(".pageLayout");
const hamburgermenu = document.querySelector(".headerright");

// Desktop font sizes
const startFontDesktop = 6; // rem
const endFontDesktop = 4; // rem

// Mobile font sizes
const startFontMobile = 2; // rem (maximum starting font on mobile)
const endFontMobile = 1.5; // rem (final font after scroll)

// Scroll distance for shrinking
const maxScroll = 300; // px

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  // Detect if mobile
  const isMobile = window.innerWidth <= 768;

  // Pick appropriate font sizes
  const startFont = isMobile ? startFontMobile : startFontDesktop;
  const endFont = isMobile ? endFontMobile : endFontDesktop;

  if (scrollY < maxScroll) {
    const progress = scrollY / maxScroll;
    const newFont = startFont - (startFont - endFont) * progress;
    heroTitle.style.fontSize = newFont + "rem";
    heroTitle.classList.remove("fixed");

    // Hide navbar/page layout only if hamburger not active
    if (!document.querySelector(".hamburger").classList.contains("active")) {
      header.classList.remove("visible");
      pagelayout.classList.remove("visible");
      hamburgermenu.classList.remove("visible");
    }
  } else {
    heroTitle.style.fontSize = endFont + "rem";
    heroTitle.classList.add("fixed");

    header.classList.add("visible");
    pagelayout.classList.add("visible");
    hamburgermenu.classList.add("visible");
  }
});

// Update hero size if window is resized
window.addEventListener("resize", () => {
  const isMobile = window.innerWidth <= 768;
  const startFont = isMobile ? startFontMobile : startFontDesktop;
  if (!heroTitle.classList.contains("fixed")) {
    heroTitle.style.fontSize = startFont + "rem";
  }
});

//---- HAMBURGER MENU ----//
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  //---- Hamburger menu ----//

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-link").forEach((n) =>
    n.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    })
  );

  //---- PROJECT CAROSEL SCROLL ON MOBILE ----//
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    initMobileCarousel();
  }
  function initMobileCarousel() {
    const carousel = document.querySelector(".projects-carousel");

    let position = 0;
    let speed = 0.3;
    let isTouching = false;
    let lastTouchX = 0;

    function animate() {
      if (!isTouching) {
        position -= speed;
      }

      carousel.style.transform = `translateX(${position}px)`;

      if (Math.abs(position) > carousel.scrollWidth / 2) {
        position = 0;
      }

      requestAnimationFrame(animate);
    }

    animate();

    carousel.addEventListener("touchstart", (e) => {
      isTouching = true;
      lastTouchX = e.touches[0].clientX;
    });

    carousel.addEventListener("touchmove", (e) => {
      const currentX = e.touches[0].clientX;
      const delta = currentX - lastTouchX;

      position += delta;
      speed = Math.min(Math.max(Math.abs(delta) * 0.02, 0), 4);

      lastTouchX = currentX;
    });

    carousel.addEventListener("touchend", () => {
      isTouching = false;
    });
  }

  //----  Filter ----//

  const filter = document.querySelector(".filter");
  const categories = document.querySelector(".categories");
  //open cateogries
  if (filter !== null) {
    filter.addEventListener("click", () => {
      filter.classList.toggle("active");
      categories.classList.toggle("active");
    });
  }

  // Add click event to each category option in filter
  document.querySelectorAll(".option").forEach((option) => {
    option.addEventListener("click", function () {
      const cid = this.getAttribute("data-cid"); // Get the `cid` of the clicked category
      window.location.href = `/projects?cid=${cid}`; // Redirect to the filtered projects pages
    });
  });

  //---- Modify Project add images ----//

  //---- LogIn or Register forms ----//
  /*
  const x = document.getElementById("login");
  const y = document.getElementById("register");
  const z = document.getElementById("btn");

  function register() {
    x.style.left = "-30rem";
    y.style.left = "15rem";
    z.style.left = "15rem";
  }
  function login() {
    x.style.left = "15rem";
    y.style.left = "70rem";
    z.style.left = "0rem";
  }*/

  //---- Projects ----//
  const a = document.getElementById("project");
  const b = document.getElementById("projectarkviz");
  const c = document.getElementById("btn");

  function projects1() {
    a.style.left = "-30rem";
    b.style.left = "15rem";
    c.style.left = "15rem";
  }
  function projects2() {
    a.style.left = "15rem";
    b.style.left = "70rem";
    c.style.left = "0rem";
  }
});
