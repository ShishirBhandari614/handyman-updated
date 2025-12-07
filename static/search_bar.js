const services = ["Carpenter", "Painter", "Electrician", "Plumber"];
const tagInput = document.getElementById("tag-input");
const tagsContainer = document.getElementById("tags");
const suggestionsBox = document.getElementById("suggestions");
const hiddenInput = document.getElementById("hidden-input");
let selectedTags = [];

tagInput.addEventListener("input", () => {
    const input = tagInput.value.toLowerCase();
    suggestionsBox.innerHTML = "";
    if (input) {
        const filtered = services.filter(s => s.toLowerCase().includes(input) && !selectedTags.includes(s));
        filtered.forEach(service => {
            const div = document.createElement("div");
            div.textContent = service;
            div.onclick = () => addTag(service);
            suggestionsBox.appendChild(div);
        });
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
}

function removeTag(service, element) {
    selectedTags = selectedTags.filter(tag => tag !== service);
    tagsContainer.removeChild(element);
}

function prepareSubmission() {
    hiddenInput.value = selectedTags.join(",");
}