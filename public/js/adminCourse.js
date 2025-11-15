// Sorting and Searching functionality for the admin course table

document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".admin-table tbody");
    const headers = document.querySelectorAll(".sortable");
    let sortDirection = 1; // 1 = ascending, -1 = descending
    let currentSortKey = "";

    headers.forEach((header) => {
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

            rows.sort((a, b) => {
                const aVal = a
                    .querySelector(`td:nth-child(${getIndex(sortKey)})`)
                    ?.innerText.trim()
                    .toLowerCase();
                const bVal = b
                    .querySelector(`td:nth-child(${getIndex(sortKey)})`)
                    ?.innerText.trim()
                    .toLowerCase();

                if (!aVal || !bVal) return 0;

                if (!isNaN(aVal) && !isNaN(bVal)) {
                    return (
                        (parseFloat(aVal) - parseFloat(bVal)) * sortDirection
                    );
                }

                if (aVal < bVal) return -1 * sortDirection;
                if (aVal > bVal) return 1 * sortDirection;
                return 0;
            });

            rows.forEach((row) => table.appendChild(row));
        });
    });

    function getIndex(key) {
        switch (key) {
            case "name":
                return 1;
            case "author":
                return 2;
            case "students":
                return 3;
            case "price":
                return 4;
            case "status":
                return 5;
            case "created":
                return 6;
            default:
                return 1;
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

    const rows = document.querySelectorAll(".admin-table tbody tr");
    rows.forEach((row) => {
        row.addEventListener("click", () => {
            const courseId = row.dataset.id;
            if (courseId) {
                window.location.href = `/admin/courses/${courseId}`;
            }
        });
    });
});
