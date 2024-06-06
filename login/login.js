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
      window.location.href = "/dashboard/dashboard.html";
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
