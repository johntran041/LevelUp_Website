document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profileForm");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); 
  
      const formData = new FormData(form);
      const userId = "<%= user._id %>";
  
      const res = await fetch(`/settings/profileSetting`, {
        method: "POST",
        body: formData,
      });
  
      if (res.ok) {
        window.location.href = "/settings/profileSetting"; 
      } else {
        alert("Update failed.");
      }
    });
  });

  setTimeout(() => {
    const alert = document.getElementById('success-alert');
    if (alert) {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }
  }, 5000);

  document.getElementById('avatarInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const preview = document.getElementById('avatarPreview');
        preview.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });