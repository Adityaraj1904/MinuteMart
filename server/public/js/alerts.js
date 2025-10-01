(function() {
  const alertContainer = document.getElementById('alert-container');
  const params = new URLSearchParams(window.location.search);

  const error = params.get('error');
  const success = params.get('success');

  let alertType = '';
  let message = '';

  if (error) {
    alertType = 'danger';
    message = error;
  } else if (success) {
    alertType = 'success';
    message = success;
  }

  if (message) {
    const alertDiv = `
      <div class="alert alert-${alertType} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    alertContainer.innerHTML = alertDiv;

    // Add bootstrap JS for the dismiss button to work
    if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
        const bootstrapScript = document.createElement('script');
        bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
        document.body.appendChild(bootstrapScript);
    }
  }
})();