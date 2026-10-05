document.addEventListener("DOMContentLoaded", () => {

    const progressBar = document.querySelector(".progress-bar");

    if (progressBar) {
        progressBar.style.width = "0%";

        setTimeout(() => {
            progressBar.style.width = "85%";
        }, 300);
    }

});