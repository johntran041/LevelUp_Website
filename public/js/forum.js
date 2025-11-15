// =====================================
// Handle Media Preview
// =====================================

const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");

if (mediaInput) {
    mediaInput.addEventListener("change", () => {
        mediaPreview.innerHTML = "";

        [...mediaInput.files].forEach((file) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const src = e.target.result;
                const isImage = file.type.startsWith("image/");
                const element = document.createElement(
                    isImage ? "img" : "video"
                );

                element.src = src;
                element.className = "rounded";
                Object.assign(element.style, {
                    maxWidth: "180px",
                    maxHeight: "180px",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                    padding: "4px",
                    background: "#f8f8f8",
                });

                if (!isImage) element.controls = true;

                mediaPreview.appendChild(element);
            };

            reader.readAsDataURL(file);
        });
    });
}

// =====================================
// Handle Post Submission
// =====================================

const postForm = document.getElementById("postForm");

if (postForm) {
    postForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append(
            "content",
            document.getElementById("contentInput").value
        );
        formData.append(
            "privacy",
            postForm.querySelector('[name="privacy"]').value
        ); // ✅ FIXED

        [...mediaInput.files].forEach((file) => formData.append("media", file));

        try {
            const response = await fetch("/forum/post", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert("Post submitted successfully!");
                location.reload();
            } else {
                alert("Error: " + result.message);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit post.");
        }
    });
}

// =====================================
// Handle Like / Unlike
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    const likeButtons = document.querySelectorAll(".like-button, .like-btn");

    likeButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const postId = btn.getAttribute("data-post-id");

            try {
                const res = await fetch(`/forum/like/${postId}`, {
                    method: "POST",
                    credentials: "same-origin",
                });
                const result = await res.json();

                const postCard = btn.closest(".post-card");
                const likeCountSpan =
                    postCard?.querySelector(".like-count") ||
                    btn.nextElementSibling;
                const heartIcon = postCard?.querySelector(".like-heart");

                let currentLikes = parseInt(likeCountSpan?.textContent) || 0;

                const liked = result.action === "liked";

                // Update text and heart color
                if (btn.classList.contains("like-btn")) {
                    btn.textContent = liked ? "Liked" : "Like";
                    btn.dataset.liked = liked;
                }

                if (btn.classList.contains("like-button") && heartIcon) {
                    heartIcon.classList.toggle("text-danger", liked);
                    heartIcon.classList.toggle("bi-heart-fill", liked);
                    heartIcon.classList.toggle("bi-heart", !liked);
                }

                // Update like count
                if (likeCountSpan) {
                    likeCountSpan.textContent = liked
                        ? currentLikes + 1
                        : Math.max(currentLikes - 1, 0);
                }
            } catch (err) {
                console.error("Failed to like/unlike post", err);
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const editPostModal = new bootstrap.Modal(
        document.getElementById("editPostModal")
    );
    const editContentInput = document.getElementById("editContentInput");
    const editPostIdInput = document.getElementById("editPostId");
    const editMediaPreview = document.getElementById("editMediaPreview");
    const editPrivacyInput = document.getElementById("editPrivacyInput");

    // Open Edit Modal and populate data
    document.querySelectorAll(".edit-post-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const postId = btn.getAttribute("data-post-id");
            const content = btn.getAttribute("data-post-content");
            const image = btn.getAttribute("data-post-image");
            const privacy = btn.getAttribute("data-post-privacy");

            // Populate form fields
            editPostIdInput.value = postId;
            editContentInput.value = content;

            // Privacy
            editPrivacyInput.value = privacy || "public";

            // Media preview
            editMediaPreview.innerHTML = "";
            if (image) {
                const img = document.createElement("img");
                img.src = image;
                img.style.maxWidth = "200px";
                img.style.borderRadius = "8px";
                editMediaPreview.appendChild(img);
            }

            // Show modal
            editPostModal.show();
        });
    });

    // Submit Edit Form
    document
        .getElementById("editPostForm")
        .addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append("postId", editPostIdInput.value);
            formData.append("content", editContentInput.value);
            formData.append("privacy", editPrivacyInput.value); // ✅ Add privacy here

            const newMedia = document.getElementById("editMediaInput").files[0];
            if (newMedia) {
                formData.append("media", newMedia);
            }

            try {
                const res = await fetch(
                    "/forum/edit/" + editPostIdInput.value,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const result = await res.json();

                if (res.ok) {
                    alert("Post updated!");
                    location.reload();
                } else {
                    alert("Error: " + result.message);
                }
            } catch (err) {
                console.error(err);
                alert("Failed to update post.");
            }
        });
});
