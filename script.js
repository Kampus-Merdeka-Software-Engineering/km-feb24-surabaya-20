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

      alert("Pesan telah dikirim!");
      document.getElementById("messageForm").reset();
    });
  }

  // Validasi login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var username = document.getElementById("username").value;
      var password = document.getElementById("password").value;

      if (!username || !password) {
        showModal("Please fill in all fields.");
      } else if (username === "admin" && password === "tim20") {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "dashboard.html";
      } else {
        showModal("Username and password are incorrect.");
      }
    });

    function showModal(message) {
      var modal = document.getElementById("modal");
      var modalMessage = document.getElementById("modalMessage");
      var closeModal = document.getElementById("closeModal");

      modalMessage.textContent = message;
      modal.style.display = "flex";

      closeModal.onclick = function () {
        modal.style.display = "none";
      };

      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      };
    }
  }

  // Logout
  const logout = document.getElementById("logout");
  if (logout) {
    logout.onclick = function () {
      localStorage.removeItem("isLoggedIn");
      window.location.href = "login.html";
    };
  }
});
