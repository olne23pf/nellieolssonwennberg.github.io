document.addEventListener("DOMContentLoaded", () => {
  //---- Hamburger menu ----//
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

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
  // Visa och dölj redigeringsformuläret
  function toggleModifyForm() {
    const form = document.getElementById("modify-form");
    form.style.display = form.style.display === "none" ? "block" : "none";
  }

  // Lägg till fler inmatningsfält för bilder
  function addImageField() {
    const div = document.getElementById("image-urls");
    const input = document.createElement("input");
    input.type = "text";
    input.name = "projurl[]";
    input.placeholder = "/img/newimage.png";
    div.appendChild(input);
  }

  //---- LogIn or Register forms ----//
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
  }
});
