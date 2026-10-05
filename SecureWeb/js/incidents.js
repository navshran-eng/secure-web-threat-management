/* =========================================================
   SECURE WEB
   INCIDENT MANAGEMENT
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const totalThreats =
    document.getElementById("totalThreats");

const lowThreats =
    document.getElementById("lowThreats");

const mediumThreats =
    document.getElementById("mediumThreats");

const highThreats =
    document.getElementById("highThreats");

const criticalThreats =
    document.getElementById("criticalThreats");

const refreshIncidents =
    document.getElementById("refreshIncidents");

const searchIncident =
    document.getElementById("searchIncident");

const riskFilter =
    document.getElementById("riskFilter");

const incidentStatus =
    document.getElementById("incidentStatus");

const incidentTableBody =
    document.getElementById("incidentTableBody");

const emptyIncidents =
    document.getElementById("emptyIncidents");


/* =========================================================
   INCIDENT DATA
========================================================= */

let incidents = [];


/* =========================================================
   LOAD INCIDENTS
========================================================= */

async function loadIncidents() {

    setStatus("Loading incident records...");

    try {

        const response =
            await fetch("php/incidents.php", {
                method: "GET",
                cache: "no-store"
            });

        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }

        const data =
            await response.json();

        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data.message ||
                "Unable to load incident records."
            );

        }

        if (Array.isArray(data.incidents)) {

            incidents = data.incidents;

        } else {

            incidents = [];

        }

        updateStatistics();

        displayIncidents();

        setStatus(
            incidents.length +
            " incident record" +
            (incidents.length === 1 ? "" : "s") +
            " found."
        );

    } catch (error) {

        console.error(
            "Incident loading error:",
            error
        );

        incidents = [];

        updateStatistics();

        incidentTableBody.innerHTML = "";

        showEmptyState(
            "Unable to load incidents.",
            "Please check the server and try again."
        );

        setStatus(
            "Unable to load incident records."
        );

    }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    let low = 0;
    let medium = 0;
    let high = 0;
    let critical = 0;

    incidents.forEach(function (incident) {

        const risk =
            String(
                incident.risk_level || ""
            ).toLowerCase();

        if (risk === "low") {

            low++;

        } else if (risk === "medium") {

            medium++;

        } else if (risk === "high") {

            high++;

        } else if (risk === "critical") {

            critical++;

        }

    });

    totalThreats.textContent =
        incidents.length;

    lowThreats.textContent =
        low;

    mediumThreats.textContent =
        medium;

    highThreats.textContent =
        high;

    criticalThreats.textContent =
        critical;

}


/* =========================================================
   DISPLAY INCIDENTS
========================================================= */

function displayIncidents() {

    const searchTerm =
        searchIncident.value
            .trim()
            .toLowerCase();

    const selectedRisk =
        riskFilter.value
            .trim()
            .toLowerCase();

    const filteredIncidents =
        incidents.filter(function (incident) {

            const type =
                String(
                    incident.threat_type || ""
                ).toLowerCase();

            const target =
                String(
                    incident.target || ""
                ).toLowerCase();

            const message =
                String(
                    incident.message || ""
                ).toLowerCase();

            const risk =
                String(
                    incident.risk_level || ""
                ).toLowerCase();

            const matchesSearch =
                searchTerm === "" ||
                type.includes(searchTerm) ||
                target.includes(searchTerm) ||
                message.includes(searchTerm) ||
                risk.includes(searchTerm);

            const matchesRisk =
    selectedRisk === "all" ||
    selectedRisk === "" ||
    risk === selectedRisk;

            return (
                matchesSearch &&
                matchesRisk
            );

        });

    renderIncidentRows(
        filteredIncidents
    );

    if (filteredIncidents.length === 0) {

        if (incidents.length === 0) {

            showEmptyState(
                "No incidents detected.",
                "Threat records will appear here after security detection activities."
            );

        } else {

            showEmptyState(
                "No matching incidents.",
                "Try changing the search text or risk filter."
            );

        }

    } else {

        hideEmptyState();

    }

}


/* =========================================================
   RENDER TABLE ROWS
========================================================= */

function renderIncidentRows(records) {

    incidentTableBody.innerHTML = "";

    records.forEach(function (incident) {

        const row =
            document.createElement("tr");

        const threatType =
            escapeHTML(
                formatThreatType(
                    incident.threat_type
                )
            );

        const target =
            escapeHTML(
                incident.target ||
                "N/A"
            );

        const risk =
            String(
                incident.risk_level ||
                "Unknown"
            );

        const score =
            incident.score !== undefined &&
            incident.score !== null
                ? escapeHTML(
                    String(incident.score)
                )
                : "—";

        const date =
            escapeHTML(
                formatDate(
                    incident.created_at
                )
            );

        const riskClass =
            getRiskClass(risk);

        row.innerHTML = `

            <td>
                <span class="threat-type">
                    ${threatType}
                </span>
            </td>

            <td>
                <span
                    class="threat-target"
                    title="${target}"
                >
                    ${target}
                </span>
            </td>

            <td>
                <span
                    class="risk-badge ${riskClass}"
                >
                    ${escapeHTML(risk)}
                </span>
            </td>

            <td>
                <span class="threat-score">
                    ${score}
                </span>
            </td>

            <td>
                <span class="threat-date">
                    ${date}
                </span>
            </td>

        `;

        incidentTableBody.appendChild(row);

    });

}


/* =========================================================
   THREAT TYPE FORMATTER
========================================================= */

function formatThreatType(type) {

    if (!type) {

        return "Unknown";

    }

    const value =
        String(type)
            .replace(/[_-]+/g, " ")
            .trim();

    return value
        .split(" ")
        .map(function (word) {

            if (!word) {
                return "";
            }

            return (
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
            );

        })
        .join(" ");

}


/* =========================================================
   RISK CLASS
========================================================= */

function getRiskClass(risk) {

    const value =
        String(risk)
            .toLowerCase();

    if (value === "low") {

        return "risk-low";

    }

    if (value === "medium") {

        return "risk-medium";

    }

    if (value === "high") {

        return "risk-high";

    }

    if (value === "critical") {

        return "risk-critical";

    }

    return "";

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "Unknown";

    }

    const date =
        new Date(
            String(dateValue)
                .replace(" ", "T")
        );

    if (Number.isNaN(date.getTime())) {

        return String(dateValue);

    }

    return date.toLocaleString();

}


/* =========================================================
   EMPTY STATE
========================================================= */

function showEmptyState(
    title,
    message
) {

    const heading =
        emptyIncidents.querySelector("h3");

    const paragraph =
        emptyIncidents.querySelector("p");

    if (heading) {

        heading.textContent =
            title;

    }

    if (paragraph) {

        paragraph.textContent =
            message;

    }

    emptyIncidents.style.display =
        "block";

}


function hideEmptyState() {

    emptyIncidents.style.display =
        "none";

}


/* =========================================================
   STATUS MESSAGE
========================================================= */

function setStatus(message) {

    if (incidentStatus) {

        incidentStatus.textContent =
            message;

    }

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}


/* =========================================================
   SEARCH
========================================================= */

if (searchIncident) {

    searchIncident.addEventListener(
        "input",
        function () {

            displayIncidents();

        }
    );

}


/* =========================================================
   RISK FILTER
========================================================= */

if (riskFilter) {

    riskFilter.addEventListener(
        "change",
        function () {

            displayIncidents();

        }
    );

}


/* =========================================================
   REFRESH
========================================================= */

if (refreshIncidents) {

    refreshIncidents.addEventListener(
        "click",
        function () {

            loadIncidents();

        }
    );

}


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadIncidents();

    }
);