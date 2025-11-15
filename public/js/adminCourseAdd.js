const studentSelect = document.getElementById("student-select");
const addStudentBtn = document.getElementById("add-student-btn");
const studentTableBody = document.querySelector("#student-table tbody");
const studentsEnrolledInput = document.getElementById("studentsEnrolledInput");

const students = [];

addStudentBtn.addEventListener("click", () => {
    const selectedOption = studentSelect.options[studentSelect.selectedIndex];
    const id = selectedOption.value;
    const name = selectedOption.textContent;
    const email = selectedOption.dataset.email;

    if (!id || students.some((s) => s.id === id)) return;

    students.push({ id, name, email });

    // Mark as (Added)
    selectedOption.textContent = name.replace(" (Added)", "") + " (Added)";

    updateTable();
});

const updateTable = () => {
    studentTableBody.innerHTML = "";

    students.forEach((student, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${i + 1}</td>
                <td>${student.name.replace(" (Added)", "")}</td>
                <td>${student.email || "unknown"}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="removeStudent('${
                        student.id
                    }')">Remove</button>
                </td>
            `;
        studentTableBody.appendChild(row);
    });

    // Set hidden input value to comma-separated IDs
    studentsEnrolledInput.value = students.map((s) => s.id).join(",");
};

const removeStudent = (id) => {
    const index = students.findIndex((s) => s.id === id);
    if (index > -1) {
        students.splice(index, 1);

        const studentOption = [...studentSelect.options].find(
            (o) => o.value === id
        );
        if (studentOption) {
            studentOption.textContent = studentOption.textContent
                .replace(" (Added)", "")
                .trim();
        }

        updateTable();
    }
};

document.getElementById("course-form").addEventListener("submit", () => {
    studentsEnrolledInput.value = students.map((s) => s.id).join(",");
});
