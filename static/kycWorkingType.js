// Working type checkboxes and amount fields logic
document.addEventListener("DOMContentLoaded", function () {
    const hourlyCheckbox = document.getElementById("hourly-checkbox");
    const onetimeCheckbox = document.getElementById("onetime-checkbox");
    const hourlyAmountContainer = document.getElementById("hourly-amount-container");
    const onetimeAmountContainer = document.getElementById("onetime-amount-container");
    const hourlyAmountInput = document.getElementById("hourly-amount");
    const onetimeAmountInput = document.getElementById("onetime-amount");
    const workingTypeInput = document.getElementById("working-type");

    // Function to update working type value
    function updateWorkingType() {
        const selectedTypes = [];
        
        if (hourlyCheckbox && hourlyCheckbox.checked) {
            const hourlyAmount = hourlyAmountInput.value.trim();
            if (hourlyAmount) {
                selectedTypes.push(`Hourly - Rs ${hourlyAmount}`);
            } else {
                selectedTypes.push("Hourly");
            }
        }
        
        if (onetimeCheckbox && onetimeCheckbox.checked) {
            const onetimeAmount = onetimeAmountInput.value.trim();
            if (onetimeAmount) {
                selectedTypes.push(`One Time - Rs ${onetimeAmount}`);
            } else {
                selectedTypes.push("One Time");
            }
        }
        
        if (workingTypeInput) {
            workingTypeInput.value = selectedTypes.join(", ");
            
            // Make field required only if at least one checkbox is checked
            if (selectedTypes.length > 0) {
                workingTypeInput.removeAttribute("required");
            } else {
                workingTypeInput.setAttribute("required", "required");
            }
        }
    }

    // Expose updateWorkingType function globally so it can be called from the form submission
    window.updateWorkingType = updateWorkingType;

    // Show/hide hourly amount field based on hourly checkbox
    if (hourlyCheckbox) {
        hourlyCheckbox.addEventListener("change", function() {
            if (this.checked) {
                if (hourlyAmountContainer) {
                    hourlyAmountContainer.style.display = "flex";
                }
                if (hourlyAmountInput) {
                    hourlyAmountInput.setAttribute("required", "required");
                }
            } else {
                if (hourlyAmountContainer) {
                    hourlyAmountContainer.style.display = "none";
                }
                if (hourlyAmountInput) {
                    hourlyAmountInput.removeAttribute("required");
                    hourlyAmountInput.value = "";
                }
            }
            updateWorkingType();
        });
    }

    // Show/hide onetime amount field based on onetime checkbox
    if (onetimeCheckbox) {
        onetimeCheckbox.addEventListener("change", function() {
            if (this.checked) {
                if (onetimeAmountContainer) {
                    onetimeAmountContainer.style.display = "flex";
                }
                if (onetimeAmountInput) {
                    onetimeAmountInput.setAttribute("required", "required");
                }
            } else {
                if (onetimeAmountContainer) {
                    onetimeAmountContainer.style.display = "none";
                }
                if (onetimeAmountInput) {
                    onetimeAmountInput.removeAttribute("required");
                    onetimeAmountInput.value = "";
                }
            }
            updateWorkingType();
        });
    }

    // Update working type when amount inputs change
    if (hourlyAmountInput) {
        hourlyAmountInput.addEventListener("input", function() {
            updateWorkingType();
        });
    }

    if (onetimeAmountInput) {
        onetimeAmountInput.addEventListener("input", function() {
            updateWorkingType();
        });
    }

    // Scroll to top when submit button is clicked
    const form = document.getElementById("kyc-form");
    if (form) {
        form.addEventListener("submit", function() {
            // Scroll to top immediately when form is submitted
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

