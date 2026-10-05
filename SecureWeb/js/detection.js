/* =========================================================
   URL CHECKER
========================================================= */

const urlForm = document.getElementById("urlForm");

if (urlForm) {

    urlForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const input = document.getElementById("url");
        const resultBox = document.getElementById("urlResult");

        const url = input.value.trim();

        if (!url) {

            showDetectionMessage(
                resultBox,
                "Please enter a URL."
            );

            return;
        }


        resultBox.className = "result-box show";

        resultBox.innerHTML = `
            <div class="result-header">
                <h3>Analyzing URL...</h3>
            </div>

            <p class="result-message">
                Checking URL characteristics.
            </p>
        `;


        const formData = new FormData();

        formData.append("url", url);


        try {

            const response = await fetch(
                "php/url-check.php",
                {
                    method: "POST",
                    body: formData
                }
            );


            const data = await response.json();


            if (!data.success) {

                showDetectionMessage(
                    resultBox,
                    data.message
                );

                return;
            }


            displayURLResult(
                resultBox,
                data
            );


        } catch (error) {

            showDetectionMessage(
                resultBox,
                "Unable to connect to the analysis server."
            );

        }

    });

}



/* =========================================================
   DISPLAY URL RESULT
========================================================= */

function displayURLResult(box, data) {

    const risk = data.risk_level.toLowerCase();


    let indicators = "";


    if (
        data.indicators &&
        data.indicators.length > 0
    ) {

        indicators = `
            <ul class="indicator-list">

                ${data.indicators.map(
                    item => `
                        <li>
                            ${escapeHTML(item)}
                        </li>
                    `
                ).join("")}

            </ul>
        `;

    } else {

        indicators = `
            <p class="result-message">
                No suspicious indicators were detected.
            </p>
        `;

    }


    box.className = "result-box show";


    box.innerHTML = `

        <div class="result-header">

            <h3>
                Analysis Result
            </h3>

            <span class="result-risk ${risk}">
                ${escapeHTML(data.risk_level)}
            </span>

        </div>


        <div class="result-score">
            ${escapeHTML(String(data.score))}/100
        </div>


        <p class="result-message">
            ${escapeHTML(data.message)}
        </p>


        ${indicators}

    `;
}



/* =========================================================
   IP / DOMAIN LOOKUP
========================================================= */

const lookupForm = document.getElementById("lookupForm");


if (lookupForm) {

    lookupForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const input = document.getElementById("lookup");

        const resultBox =
            document.getElementById("lookupResult");


        const value = input.value.trim();


        if (!value) {

            showDetectionMessage(
                resultBox,
                "Please enter an IP address or domain."
            );

            return;
        }


        resultBox.className = "result-box show";


        resultBox.innerHTML = `

            <div class="result-header">

                <h3>
                    Looking up...
                </h3>

            </div>


            <p class="result-message">

                Checking DNS and network information.

            </p>

        `;


        const formData = new FormData();

        formData.append(
            "lookup",
            value
        );


        try {

            const response = await fetch(
                "php/ip-domain-lookup.php",
                {
                    method: "POST",
                    body: formData
                }
            );


            const data = await response.json();


            if (!data.success) {

                showDetectionMessage(
                    resultBox,
                    data.message
                );

                return;
            }


            displayLookupResult(
                resultBox,
                data
            );


        } catch (error) {

            showDetectionMessage(
                resultBox,
                "Unable to connect to the lookup service."
            );

        }

    });

}



/* =========================================================
   DISPLAY LOOKUP RESULT
========================================================= */

function displayLookupResult(box, data) {

    box.className = "result-box show";


    let rows = "";


    if (
        data.records &&
        data.records.length > 0
    ) {

        data.records.forEach(function (record) {

            rows += `

                <div class="lookup-row">

                    <span>
                        ${escapeHTML(record.label)}
                    </span>

                    <strong>
                        ${escapeHTML(record.value)}
                    </strong>

                </div>

            `;

        });

    }


    box.innerHTML = `

        <div class="result-header">

            <h3>
                Lookup Result
            </h3>


            <span class="result-risk ${data.risk_level.toLowerCase()}">

                ${escapeHTML(data.risk_level)}

            </span>

        </div>


        <div class="lookup-results">

            ${rows}

        </div>


        <p class="result-message">

            ${escapeHTML(data.message)}

        </p>

    `;
}



/* =========================================================
   HASH ANALYSIS
========================================================= */

const hashForm = document.getElementById("hashForm");


if (hashForm) {

    hashForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const input =
                document.getElementById("hash");


            const resultBox =
                document.getElementById("hashResult");


            const hash =
                input.value.trim().toLowerCase();


            if (!hash) {

                showDetectionMessage(
                    resultBox,
                    "Please enter a file hash."
                );

                return;
            }


            resultBox.className =
                "result-box show";


            resultBox.innerHTML = `

                <div class="result-header">

                    <h3>
                        Analyzing Hash...
                    </h3>

                </div>


                <p class="result-message">

                    Checking the hash format and
                    analyzing available indicators.

                </p>

            `;


            const formData =
                new FormData();


            formData.append(
                "hash",
                hash
            );


            try {

                const response = await fetch(
                    "php/hash-analysis.php",
                    {
                        method: "POST",
                        body: formData
                    }
                );


                const data =
                    await response.json();


                if (!data.success) {

                    showDetectionMessage(
                        resultBox,
                        data.message
                    );

                    return;
                }


                displayHashResult(
                    resultBox,
                    data
                );


            } catch (error) {

                showDetectionMessage(
                    resultBox,
                    "Unable to connect to the hash analysis service."
                );

            }

        }
    );

}



/* =========================================================
   DISPLAY HASH RESULT
========================================================= */

function displayHashResult(box, data) {

    box.className =
        "result-box show";


    let indicators = "";


    if (
        data.indicators &&
        data.indicators.length > 0
    ) {

        indicators = `

            <ul class="indicator-list">

                ${data.indicators.map(
                    item => `
                        <li>
                            ${escapeHTML(item)}
                        </li>
                    `
                ).join("")}

            </ul>

        `;

    } else {

        indicators = `

            <p class="result-message">

                No suspicious indicators were detected.

            </p>

        `;

    }


    box.innerHTML = `

        <div class="result-header">

            <h3>
                Hash Analysis Result
            </h3>


            <span class="result-risk ${data.risk_level.toLowerCase()}">

                ${escapeHTML(data.risk_level)}

            </span>

        </div>


        <div class="hash-result-details">

            <div class="hash-row">

                <span>
                    Hash Type
                </span>

                <strong>
                    ${escapeHTML(data.hash_type)}
                </strong>

            </div>


            <div class="hash-row">

                <span>
                    Hash Length
                </span>

                <strong>
                    ${escapeHTML(String(data.hash_length))} characters
                </strong>

            </div>


            <div class="hash-row">

                <span>
                    Hash
                </span>

                <strong class="hash-value">

                    ${escapeHTML(data.hash)}

                </strong>

            </div>

        </div>


        <p class="result-message">

            ${escapeHTML(data.message)}

        </p>


        ${indicators}

    `;
}



/* =========================================================
   COMMON MESSAGE
========================================================= */

function showDetectionMessage(box, message) {

    box.className =
        "result-box show";


    box.innerHTML = `

        <p class="result-message">

            ${escapeHTML(message)}

        </p>

    `;
}



/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}



/* =========================================================
   COMING SOON
========================================================= */

function comingSoon(name) {

    alert(
        name +
        " will be available in the next module."
    );

}