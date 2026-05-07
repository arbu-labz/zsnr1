// =========================================
// Technik Programista AI — wspólny JS
// Na razie prosto: data, aktywne kafle, miejsce
// na późniejsze galerie i projekty uczniów.
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    const yearBox = document.querySelector("[data-year]");
    if (yearBox) {
        yearBox.textContent = new Date().getFullYear();
    }

    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-4px)";
            card.style.transition = "0.2s";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0)";
        });
    });
});
