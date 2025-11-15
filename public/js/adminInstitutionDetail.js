document.addEventListener("DOMContentLoaded", () => {
    const archiveBtn = document.getElementById("archive-btn");
    const reactivateBtn = document.getElementById("reactivate-btn");
    const deleteBtn = document.getElementById("delete-btn");

    if (archiveBtn) {
        archiveBtn.addEventListener("click", () => {
            const userId = archiveBtn.dataset.id;
            if (confirm("Are you sure you want to archive this user?")) {
                fetch(`/admin/institutions/archive/${userId}`, {
                    method: "POST",
                }).then((res) => {
                    if (res.ok) {
                        window.location.href = "/admin/institutions";
                    } else {
                        alert("Failed to archive user.");
                    }
                });
            }
        });
    }

    if (reactivateBtn) {
        reactivateBtn.addEventListener("click", () => {
            const userId = reactivateBtn.dataset.id;
            if (confirm("Reactivate this user account?")) {
                fetch(`/admin/institutions/update/${userId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: "active" }),
                }).then((res) => {
                    if (res.ok) {
                        window.location.href = "/admin/institutions";
                    } else {
                        alert("Failed to reactivate user.");
                    }
                });
            }
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            const userId = deleteBtn.dataset.id;
            if (
                confirm(
                    "Are you sure you want to permanently delete this user?"
                )
            ) {
                fetch(`/admin/institutions/delete/${userId}`, {
                    method: "POST",
                }).then((res) => {
                    if (res.ok) {
                        window.location.href = "/admin/institutions";
                    } else {
                        alert("Failed to delete user.");
                    }
                });
            }
        });
    }
});
