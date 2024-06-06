$(document).ready(function () {
  // Add smooth scrolling to all links
  $("a").on("click", function (event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top,
        },
        800,
        function () {
          window.location.hash = hash;
        }
      );
    }
  });

  // Toggle class active untuk hamburger menu
  const navbarNav = document.querySelector(".navbar-nav");
  const hamburgerMenu = document.querySelector("#hamburger-menu");
  if (hamburgerMenu) {
    hamburgerMenu.onclick = (e) => {
      navbarNav.classList.toggle("active");
      e.preventDefault();
    };
  }

  // Klik di luar elemen
  const hm = document.querySelector("#hamburger-menu");

  document.addEventListener("click", function (e) {
    if (!hm.contains(e.target) && !navbarNav.contains(e.target)) {
      navbarNav.classList.remove("active");
    }
  });

  // Mengelola pesan
  const messageForm = document.getElementById("messageForm");
  if (messageForm) {
    messageForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const message = document.getElementById("message").value;

      const messages = JSON.parse(localStorage.getItem("messages")) || [];
      messages.push({ name, email, phone, message });
      localStorage.setItem("messages", JSON.stringify(messages));

      console.log("Pesan tersimpan:", { name, email, phone, message });
      alert("Pesan telah dikirim!");
      document.getElementById("messageForm").reset();
    });
  }
});
