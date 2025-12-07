document.addEventListener("DOMContentLoaded", () => {
const services = ["Carpenter", "Painter", "Electrician", "Plumber"];
const tagInput = document.getElementById("tag-input");
const tagsContainer = document.getElementById("tags");
const suggestionsBox = document.getElementById("suggestions");
const hiddenInput = document.getElementById("hidden-input");
let selectedTags = [];

if (!tagInput || !tagsContainer || !suggestionsBox || !hiddenInput) {
    return; // Exit if elements don't exist
}

tagInput.addEventListener("input", () => {
    const input = tagInput.value.toLowerCase();
    suggestionsBox.innerHTML = "";
    if (input) {
        const filtered = services.filter(s => s.toLowerCase().includes(input) && !selectedTags.includes(s));
        if (filtered.length > 0) {
            filtered.forEach(service => {
                const div = document.createElement("div");
                div.textContent = service;
                div.onclick = () => addTag(service);
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.classList.add("show");
        } else {
            suggestionsBox.classList.remove("show");
        }
    } else {
        suggestionsBox.classList.remove("show");
    }
});

function addTag(service) {
    selectedTags.push(service);
    const li = document.createElement("li");
    li.textContent = service;
    const removeBtn = document.createElement("span");
    removeBtn.textContent = "×";
    removeBtn.classList.add("remove-tag");
    removeBtn.onclick = () => removeTag(service, li);
    li.appendChild(removeBtn);
    tagsContainer.appendChild(li);
    tagInput.value = "";
    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.remove("show");
}

function removeTag(service, element) {
    selectedTags = selectedTags.filter(tag => tag !== service);
    tagsContainer.removeChild(element);
}

function prepareSubmission() {
    hiddenInput.value = selectedTags.join(",");
}

// Close suggestions when clicking outside
document.addEventListener("click", (e) => {
    if (!tagInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.remove("show");
    }
});

// Handle form submission
const searchForm = document.getElementById("search-form");
if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        prepareSubmission();
        if (selectedTags.length > 0) {
            searchForm.submit();
        }
    });
}
});