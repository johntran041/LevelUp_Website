const studentsEnrolledInput = document.getElementById("studentsEnrolledInput");
const studentSelect = document.getElementById("student-select");
const addStudentBtn = document.getElementById("add-student-btn");
const studentTableBody = document.querySelector("#student-table tbody");

const students = <%- JSON.stringify(course.studentsEnrolled.map(s => ({
    id: s._id,
    name: s.firstName + " " + s.lastName,
    email: s.email
}))) %>;

addStudentBtn.addEventListener("click", () => {
    const selectedOption = studentSelect.options[studentSelect.selectedIndex];
    const id = selectedOption.value;
    const name = selectedOption.textContent
        .replace("(Already Added)", "")
        .trim();
    const email = selectedOption.dataset.email;

    if (!id || students.some((s) => s.id === id)) return;

    students.push({ id, name, email });
    selectedOption.disabled = true;
    updateStudentTable();
});

function updateStudentTable() {
    studentTableBody.innerHTML = "";
    students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeStudent('${
                        student.id
                    }')">Remove</button>
                </td>`;
        studentTableBody.appendChild(row);
    });

    studentsEnrolledInput.value = students.map((s) => s.id).join(",");
    document.getElementById("student-count").textContent = students.length;
}

function removeStudent(id) {
    const index = students.findIndex((s) => s.id === id);
    if (index !== -1) {
        students.splice(index, 1);
        const option = [...studentSelect.options].find((o) => o.value === id);
        if (option) option.disabled = false;
        updateStudentTable();
    }
}

updateStudentTable();

// ✅ DELETE FUNCTION WORKING HERE
const deleteBtn = document.getElementById("delete-course-btn");

if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
        const courseId = deleteBtn.dataset.id;
        if (!courseId) return;

        if (confirm("Are you sure you want to delete this course?")) {
            fetch(`/admin/courses/delete/${courseId}`, {
                method: "POST",
            })
                .then((res) => {
                    if (res.ok) {
                        window.location.href = "/admin/courses";
                    } else {
                        alert("Failed to delete the course.");
                    }
                })
                .catch((err) => {
                    console.error("Delete error:", err);
                    alert("Something went wrong while deleting.");
                });
        }
    });
}
