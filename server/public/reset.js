(function() {
  const form = document.getElementById('resetForm');
  const tokenInput = document.getElementById('token');
  const idInput = document.getElementById('id');

  // Extract token and id from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const id = params.get('id');

  if (!token || !id) {
    alert("Invalid or missing reset link.");
    form.style.display = 'none';
    return;
  }

  // Populate hidden fields
  tokenInput.value = token;
  idInput.value = id;
  console.log("Token:", tokenInput.value);
  console.log("ID:", idInput.value);

  // Validate passwords match before submitting
  form.addEventListener('submit', function(e) {
    const pwd = form.password.value;
    const cpwd = form.confirmPassword.value;

    if (!tokenInput.value || !idInput.value) {
      e.preventDefault();
      alert("Reset link not loaded yet. Please refresh the page.");
    } else if (pwd !== cpwd) {
      e.preventDefault();
      alert("Passwords do not match!");
    }
  });
})();
