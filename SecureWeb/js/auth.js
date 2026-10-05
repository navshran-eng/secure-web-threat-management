function togglePassword(id) {

    const input = document.getElementById(id);

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}


function showMessage(message, type) {

    const box = document.getElementById("message");

    box.textContent = message;

    box.className =
        type === "success"
            ? "message-success"
            : "message-error";
}


function checkPasswordStrength(password) {

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const bar = document.getElementById("strengthBar");
    const text = document.getElementById("strengthText");

    if (!bar || !text) return;

    const levels = [
        ["Very Weak", "20%"],
        ["Weak", "40%"],
        ["Medium", "60%"],
        ["Strong", "80%"],
        ["Very Strong", "100%"]
    ];

    if (score === 0) {
        bar.style.width = "0%";
        text.textContent = "";
        return;
    }

    bar.style.width = levels[score - 1][1];
    text.textContent = levels[score - 1][0];
}


const passwordInput = document.getElementById("password");

if (passwordInput) {

    passwordInput.addEventListener("input", function () {
        checkPasswordStrength(this.value);
    });

}


const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }

        if (password.length < 8) {

            showMessage(
                "Password must contain at least 8 characters.",
                "error"
            );

            return;
        }

        const formData = new FormData(this);

        try {

            const response = await fetch(
                "php/register.php",
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.json();

            if (result.success) {

                showMessage(
                    result.message,
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1200);

            } else {

                showMessage(
                    result.message,
                    "error"
                );

            }

        } catch (error) {

            showMessage(
                "Unable to connect to the server.",
                "error"
            );

        }

    });

}


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const formData = new FormData(this);

        try {

            const response = await fetch(
                "php/login.php",
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.json();

            if (result.success) {

                showMessage(
                    "Login successful. Redirecting...",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "dashboard.php";
                }, 800);

            } else {

                showMessage(
                    result.message,
                    "error"
                );

            }

        } catch (error) {

            showMessage(
                "Unable to connect to the server.",
                "error"
            );

        }

    });

}
