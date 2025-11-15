document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".admin-table tbody");
    const headers = document.querySelectorAll(".sortable");
    let sortDirection = 1;
    let currentSortKey = "";

    headers.forEach((header, index) => {
        header.style.cursor = "pointer";
        header.addEventListener("click", () => {
            const sortKey = header.dataset.sort;
            const rows = Array.from(table.querySelectorAll("tr"));

            if (currentSortKey === sortKey) {
                sortDirection *= -1;
            } else {
                sortDirection = 1;
                currentSortKey = sortKey;
            }

            const columnIndex = getIndex(sortKey);
            rows.sort((a, b) => {
                const aVal = a.children[columnIndex].innerText.toLowerCase();
                const bVal = b.children[columnIndex].innerText.toLowerCase();

                if (aVal < bVal) return -1 * sortDirection;
                if (aVal > bVal) return 1 * sortDirection;
                return 0;
            });

            rows.forEach((row) => table.appendChild(row));
        });
    });

    function getIndex(key) {
        switch (key) {
            case "email":
                return 0;
            case "password":
                return 1;
            case "name":
                return 2;
            case "courses":
                return 3;
            case "instructors":
                return 4;
            case "students":
                return 5;
            case "status":
                return 6;
            case "dateJoined":
                return 7;
            default:
                return 0;
        }
    }

    const searchInput = document.querySelector(".admin-search-input");
    const tableRows = document.querySelectorAll(".admin-table tbody tr");

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();

        tableRows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            const match = Array.from(cells).some((cell) =>
                cell.textContent.toLowerCase().includes(query)
            );
            row.style.display = match ? "" : "none";
        });
    });

    document.querySelectorAll(".admin-table tbody tr").forEach((row) => {
        row.addEventListener("click", () => {
            const id = row.getAttribute("data-id");
            if (id) window.location.href = `/admin/institutions/${id}`;
        });
    });
});
