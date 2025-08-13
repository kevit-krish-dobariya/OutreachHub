document.addEventListener('DOMContentLoaded', () => {

  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminModal = document.getElementById('admin-login-modal');
  const adminForm = document.getElementById('admin-modal-form');
  const adminUsername = document.getElementById('admin-modal-username');
  const adminPassword = document.getElementById('admin-modal-password');
  const adminErrorMessage = document.getElementById('admin-modal-message');


  if (!localStorage.getItem('admin')) {
    const admin = { username: 'admin', password: 'admin123', name: 'Admin User' };
    localStorage.setItem('admin', JSON.stringify(admin));
  }


  // --- Show Error Message ---
  function showError(inputElement, message) {
    const inputControl = inputElement.parentElement;
    const small = inputControl.querySelector('small');
    small.innerText = message;
    small.style.display = 'block';
    small.style.color = 'red';
  }

  // --- Hide Admin Modal ---
  window.hideAdminLoginModal = function () {
    adminModal.classList.add('hidden');
    adminErrorMessage.classList.add('hidden');
    adminErrorMessage.textContent = '';
    adminForm.reset();
  };

  // --- Show Admin Modal ---
  adminLoginBtn.addEventListener('click', () => {
    adminModal.classList.remove('hidden');
  });

  // --- Admin Login ---
  adminForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = adminUsername.value.trim();
    const password = adminPassword.value.trim();

    const admin = JSON.parse(localStorage.getItem('admin'));

    if (admin && username === admin.username && password === admin.password) {
      sessionStorage.setItem('loggedInUser', JSON.stringify({ name: admin.name, role: 'Admin' }));
      window.location.href = 'admin.html'; // Redirect to admin portal
    } else {
      adminErrorMessage.textContent = 'Invalid admin credentials';
      adminErrorMessage.classList.remove('hidden');
    }
  });
});
