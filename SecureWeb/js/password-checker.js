const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const strengthText = document.getElementById("strengthText");
const strengthProgress = document.getElementById("strengthProgress");


togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "Show";

    }

});


passwordInput.addEventListener("input", () => {

    const password = passwordInput.value;

    const checks = {

        length:
            password.length >= 8,

        upper:
            /[A-Z]/.test(password),

        lower:
            /[a-z]/.test(password),

        number:
            /[0-9]/.test(password),

        special:
            /[^A-Za-z0-9]/.test(password)

    };


    updateRequirement(
        "lengthCheck",
        checks.length
    );

    updateRequirement(
        "upperCheck",
        checks.upper
    );

    updateRequirement(
        "lowerCheck",
        checks.lower
    );

    updateRequirement(
        "numberCheck",
        checks.number
    );

    updateRequirement(
        "specialCheck",
        checks.special
    );


    let score = 0;

    Object.values(checks).forEach(
        valid => {
            if (valid) score++;
        }
    );


    updateStrength(score);

});


function updateRequirement(id, valid) {

    const element = document.getElementById(id);

    const icon = element.querySelector("span");

    if (valid) {

        element.classList.add("valid");
        icon.textContent = "✓";

    } else {

        element.classList.remove("valid");
        icon.textContent = "○";

    }

}


function updateStrength(score) {

    if (score === 0) {

        strengthProgress.style.width = "0%";
        strengthText.textContent = "Not evaluated";

        return;
    }


    const levels = {

        1: {
            text: "Very Weak",
            width: "20%"
        },

        2: {
            text: "Weak",
            width: "40%"
        },

        3: {
            text: "Medium",
            width: "60%"
        },

        4: {
            text: "Strong",
            width: "80%"
        },

        5: {
            text: "Very Strong",
            width: "100%"
        }

    };


    const result = levels[score];

    strengthText.textContent = result.text;

    strengthProgress.style.width = result.width;

}