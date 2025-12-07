document.addEventListener("DOMContentLoaded", function () {
    const profileIcon = document.getElementById("profile");
    const dropdownMenu = document.getElementById("dropdown");
  
    console.log("Profile icon:", profileIcon);
    console.log("Dropdown menu:", dropdownMenu);

    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (event) {
        if (!profileIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});

