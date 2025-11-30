// info_dnia_mechanika.js
// Mechanika wybierania i wyświetlania "informacji dnia" pod tytułem strony

function getInfoDniaIndexForToday() {
    if (!Array.isArray(INFO_DNIA_CSHARP) || INFO_DNIA_CSHARP.length === 0) {
        return -1;
    }

    const today = new Date();
    const year = today.getFullYear();      // np. 2025
    const month = today.getMonth() + 1;    // 1..12
    const day = today.getDate();           // 1..31

    // Prosta liczba z daty, np. 2025-11-30 -> 20251130
    const dateNumber = year * 10000 + month * 100 + day;

    // Indeks w zakresie 0..(INFO_DNIA.length - 1)
    const index = dateNumber % INFO_DNIA_CSHARP.length;
    return index;
}

function renderInfoDnia() {
    const opisEl = document.getElementById("info-dnia-opis");
    const kodEl = document.getElementById("info-dnia-kod");

    // Jeśli na stronie nie ma potrzebnych elementów, kończymy
    if (!opisEl || !kodEl) {
        return;
    }

    const index = getInfoDniaIndexForToday();
    if (index === -1) {
        opisEl.textContent = "Brak zdefiniowanych przekazów dnia.";
        kodEl.textContent = "";
        return;
    }

    const info = INFO_DNIA_CSHARP[index];

    // Opis
    opisEl.textContent = info.description || "";

    // Kod – pokazujemy dokładnie tak, jak jest w polu code
    kodEl.textContent = info.code || "";
}

// Uruchom po załadowaniu DOM
document.addEventListener("DOMContentLoaded", renderInfoDnia);
