document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const adminStatus = document.getElementById("adminStatus");
    const refreshAdmin = document.getElementById("refreshAdmin");

    // Statistics
    const totalUsers = document.getElementById("totalUsers");
    const totalThreats = document.getElementById("totalThreats");
    const criticalThreats = document.getElementById("criticalThreats");
    const highThreats = document.getElementById("highThreats");
    const totalAssessments = document.getElementById("totalAssessments");
    const averageScore = document.getElementById("averageScore");

    // Users
    const userSearch = document.getElementById("userSearch");
    const userTableBody = document.getElementById("userTableBody");
    const emptyUsers = document.getElementById("emptyUsers");

    // Threats
    const threatRiskFilter = document.getElementById("threatRiskFilter");
    const threatTableBody = document.getElementById("threatTableBody");
    const emptyThreats = document.getElementById("emptyThreats");

    // Assessments
    const assessmentTableBody =
        document.getElementById("assessmentTableBody");

    const emptyAssessments =
        document.getElementById("emptyAssessments");

    // ==========================================
    // DATA
    // ==========================================

    let adminData = {
        admin: {},
        statistics: {},
        users: [],
        threats: [],
        assessments: [],
        activity: []
    };

    // ==========================================
    // LOAD ADMIN DATA
    // ==========================================

    async function loadAdminData() {

        setStatus("Loading administrator data...");

        try {

            const response = await fetch(
                "php/admin.php",
                {
                    method: "GET",
                    cache: "no-store",
                    credentials: "same-origin"
                }
            );

            const data = await response.json();

            if (!response.ok || data.success !== true) {

                throw new Error(
                    data.message ||
                    "Server returned HTTP " + response.status
                );
            }

            adminData = {

                admin:
                    data.admin || {},

                statistics:
                    data.statistics || {},

                users:
                    Array.isArray(data.users)
                        ? data.users
                        : [],

                threats:
                    Array.isArray(data.threats)
                        ? data.threats
                        : [],

                assessments:
                    Array.isArray(data.assessments)
                        ? data.assessments
                        : [],

                activity:
                    Array.isArray(data.activity)
                        ? data.activity
                        : []
            };

            updateAdminStatus();
            updateStatistics();
            displayUsers();
            displayThreats();
            displayAssessments();

        } catch (error) {

            console.error(
                "Admin loading error:",
                error
            );

            showAdminError(
                error.message ||
                "Unable to load administrator data."
            );
        }
    }

    // ==========================================
    // ADMIN STATUS
    // ==========================================

    function updateAdminStatus() {

        if (!adminStatus) {
            return;
        }

        const name =
            adminData.admin.name ||
            adminData.admin.username ||
            "Administrator";

        const role =
            adminData.admin.role ||
            "admin";

        adminStatus.textContent =
            "Signed in as " +
            name +
            " (" +
            role +
            ")";

        adminStatus.classList.remove(
            "admin-error"
        );
    }

    // ==========================================
    // STATISTICS
    // ==========================================

    function updateStatistics() {

        const stats =
            adminData.statistics || {};

        if (totalUsers) {
            totalUsers.textContent =
                formatNumber(stats.total_users);
        }

        if (totalThreats) {
            totalThreats.textContent =
                formatNumber(stats.total_threats);
        }

        if (criticalThreats) {
            criticalThreats.textContent =
                formatNumber(
                    stats.critical_threats
                );
        }

        if (highThreats) {
            highThreats.textContent =
                formatNumber(
                    stats.high_threats
                );
        }

        if (totalAssessments) {
            totalAssessments.textContent =
                formatNumber(
                    stats.total_assessments
                );
        }

        if (averageScore) {

            const score =
                Number(
                    stats.average_score
                );

            averageScore.textContent =
                Number.isFinite(score)
                    ? Math.round(score) + "%"
                    : "0%";
        }
    }

    // ==========================================
    // USERS
    // ==========================================

    function displayUsers() {

        if (!userTableBody) {
            return;
        }

        const searchTerm =
            userSearch
                ? userSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const users =
            adminData.users.filter(user => {

                if (!searchTerm) {
                    return true;
                }

                const name =
                    String(
                        user.name || ""
                    ).toLowerCase();

                const username =
                    String(
                        user.username || ""
                    ).toLowerCase();

                const email =
                    String(
                        user.email || ""
                    ).toLowerCase();

                const role =
                    String(
                        user.role || ""
                    ).toLowerCase();

                const status =
                    String(
                        user.status || ""
                    ).toLowerCase();

                return (
                    name.includes(searchTerm) ||
                    username.includes(searchTerm) ||
                    email.includes(searchTerm) ||
                    role.includes(searchTerm) ||
                    status.includes(searchTerm)
                );
            });

        userTableBody.innerHTML = "";

        if (users.length === 0) {

            showEmpty(
                emptyUsers,
                true
            );

            return;
        }

        showEmpty(
            emptyUsers,
            false
        );

        users.forEach(user => {

            const row =
                document.createElement("tr");

            const userId =
                getUserId(user);

            const name =
                user.name ||
                user.username ||
                "Unknown User";

            const username =
                user.username ||
                "-";

            const email =
                user.email ||
                "-";

            const role =
                String(
                    user.role || "user"
                ).toLowerCase();

            const status =
                String(
                    user.status || "active"
                ).toLowerCase();

            const createdAt =
                user.created_at ||
                user.created ||
                "";

            const isCurrentUser =
                String(userId) ===
                String(
                    adminData.admin.user_id ||
                    adminData.admin.id ||
                    ""
                );

            row.innerHTML = `

                <td>

                    <div class="admin-user">

                        <div class="admin-user-avatar">
                            ${escapeHTML(
                                getInitials(name)
                            )}
                        </div>

                        <div class="admin-user-info">

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <span>
                                ${escapeHTML(username)}
                            </span>

                        </div>

                    </div>

                </td>

                <td>
                    ${escapeHTML(email)}
                </td>

                <td>

                    <select
                        class="user-role-select"
                        data-user-id="${escapeHTML(
                            String(userId)
                        )}"
                        ${isCurrentUser ? "disabled" : ""}
                    >

                        <option
                            value="user"
                            ${role === "user" ? "selected" : ""}
                        >
                            User
                        </option>

                        <option
                            value="admin"
                            ${role === "admin" ? "selected" : ""}
                        >
                            Admin
                        </option>

                    </select>

                </td>

                <td>

                    <select
                        class="user-status-select"
                        data-user-id="${escapeHTML(
                            String(userId)
                        )}"
                        ${isCurrentUser ? "disabled" : ""}
                    >

                        <option
                            value="active"
                            ${status === "active" ? "selected" : ""}
                        >
                            Active
                        </option>

                        <option
                            value="inactive"
                            ${status === "inactive" ? "selected" : ""}
                        >
                            Inactive
                        </option>

                        <option
                            value="blocked"
                            ${status === "blocked" ? "selected" : ""}
                        >
                            Blocked
                        </option>

                        <option
                            value="suspended"
                            ${status === "suspended" ? "selected" : ""}
                        >
                            Suspended
                        </option>

                    </select>

                </td>

                <td>

                    <span class="admin-date">
                        ${escapeHTML(
                            formatDate(createdAt)
                        )}
                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="admin-user-delete"
                        data-user-id="${escapeHTML(
                            String(userId)
                        )}"
                        ${isCurrentUser ? "disabled" : ""}
                    >
                        Delete
                    </button>

                </td>
            `;

            userTableBody.appendChild(row);
        });

        attachUserControls();
    }

    // ==========================================
    // USER CONTROLS
    // ==========================================

    function attachUserControls() {

        document
            .querySelectorAll(".user-role-select")
            .forEach(select => {

                select.addEventListener(
                    "change",
                    async event => {

                        const userId =
                            event.target.dataset.userId;

                        const role =
                            event.target.value;

                        await updateUser(
                            userId,
                            {
                                role: role
                            }
                        );
                    }
                );
            });

        document
            .querySelectorAll(".user-status-select")
            .forEach(select => {

                select.addEventListener(
                    "change",
                    async event => {

                        const userId =
                            event.target.dataset.userId;

                        const status =
                            event.target.value;

                        await updateUser(
                            userId,
                            {
                                status: status
                            }
                        );
                    }
                );
            });

        document
            .querySelectorAll(".admin-user-delete")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async event => {

                        const userId =
                            event.currentTarget
                                .dataset.userId;

                        const user =
                            adminData.users.find(
                                item =>
                                    String(
                                        getUserId(item)
                                    ) ===
                                    String(userId)
                            );

                        const name =
                            user
                                ? (
                                    user.name ||
                                    user.username ||
                                    "this user"
                                )
                                : "this user";

                        if (
                            !window.confirm(
                                "Delete " +
                                name +
                                "? This action cannot be undone."
                            )
                        ) {
                            return;
                        }

                        await deleteUser(userId);
                    }
                );
            });
    }

    // ==========================================
    // UPDATE USER
    // ==========================================

    async function updateUser(
        userId,
        changes
    ) {

        try {

            setStatus(
                "Saving user changes..."
            );

            const response =
                await fetch(
                    "php/user-management.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "same-origin",

                        body: JSON.stringify({
                            action: "update",
                            user_id: userId,
                            ...changes
                        })
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to update user."
                );
            }

            const index =
                adminData.users.findIndex(
                    user =>
                        String(
                            getUserId(user)
                        ) === String(userId)
                );

            if (index !== -1) {

                adminData.users[index] = {
                    ...adminData.users[index],
                    ...data.user
                };
            }

            displayUsers();

            setStatus(
                data.message ||
                "User updated successfully."
            );

        } catch (error) {

            console.error(
                "User update error:",
                error
            );

            alert(
                error.message ||
                "Unable to update user."
            );

            await loadAdminData();
        }
    }

    // ==========================================
    // DELETE USER
    // ==========================================

    async function deleteUser(
        userId
    ) {

        try {

            setStatus(
                "Deleting user..."
            );

            const response =
                await fetch(
                    "php/user-management.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "same-origin",

                        body: JSON.stringify({
                            action: "delete",
                            user_id: userId
                        })
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to delete user."
                );
            }

            adminData.users =
                adminData.users.filter(
                    user =>
                        String(
                            getUserId(user)
                        ) !== String(userId)
                );

            updateStatistics();
            displayUsers();

            setStatus(
                data.message ||
                "User deleted successfully."
            );

        } catch (error) {

            console.error(
                "User deletion error:",
                error
            );

            alert(
                error.message ||
                "Unable to delete user."
            );

            await loadAdminData();
        }
    }

    // ==========================================
    // THREATS
    // ==========================================

    function displayThreats() {

        if (!threatTableBody) {
            return;
        }

        const selectedRisk =
            threatRiskFilter
                ? threatRiskFilter.value
                    .toLowerCase()
                : "all";

        const threats =
            adminData.threats.filter(
                threat => {

                    const risk =
                        String(
                            threat.risk_level ||
                            threat.risk ||
                            "low"
                        ).toLowerCase();

                    return (
                        selectedRisk === "all" ||
                        selectedRisk === "" ||
                        risk === selectedRisk
                    );
                }
            );

        threatTableBody.innerHTML = "";

        if (threats.length === 0) {

            showEmpty(
                emptyThreats,
                true
            );

            return;
        }

        showEmpty(
            emptyThreats,
            false
        );

        threats.forEach(threat => {

            const row =
                document.createElement("tr");

            const user =
                adminData.users.find(
                    item =>
                        String(
                            getUserId(item)
                        ) ===
                        String(
                            threat.user_id || ""
                        )
                );

            const userName =
                user
                    ? (
                        user.name ||
                        user.username ||
                        "Unknown User"
                    )
                    : (
                        threat.user_id ||
                        "Unknown User"
                    );

            const type =
                threat.type ||
                threat.threat_type ||
                "Unknown";

            const target =
                threat.target ||
                threat.url ||
                threat.domain ||
                threat.ip ||
                threat.hash ||
                "-";

            const risk =
                threat.risk_level ||
                threat.risk ||
                "Low";

            const score =
                threat.risk_score !== undefined
                    ? threat.risk_score
                    : threat.score !== undefined
                        ? threat.score
                        : 0;

            const detectedAt =
                threat.created_at ||
                threat.detected_at ||
                "";

            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        String(userName)
                    )}
                </td>

                <td>

                    <span class="admin-threat-type">
                        ${escapeHTML(
                            formatThreatType(type)
                        )}
                    </span>

                </td>

                <td>

                    <span
                        class="admin-threat-target"
                        title="${escapeHTML(
                            String(target)
                        )}"
                    >
                        ${escapeHTML(
                            truncateText(
                                target,
                                55
                            )
                        )}
                    </span>

                </td>

                <td>

                    <span
                        class="admin-risk ${getRiskClass(risk)}"
                    >
                        ${escapeHTML(
                            capitalize(risk)
                        )}
                    </span>

                </td>

                <td>

                    <span
                        class="admin-score ${getScoreClass(risk)}"
                    >
                        ${escapeHTML(
                            String(score)
                        )}
                    </span>

                </td>

                <td>

                    <span class="admin-date">
                        ${escapeHTML(
                            formatDate(detectedAt)
                        )}
                    </span>

                </td>
            `;

            threatTableBody.appendChild(row);
        });
    }

    // ==========================================
    // ASSESSMENTS
    // ==========================================

    function displayAssessments() {

        if (!assessmentTableBody) {
            return;
        }

        assessmentTableBody.innerHTML = "";

        const assessments =
            adminData.assessments;

        if (assessments.length === 0) {

            showEmpty(
                emptyAssessments,
                true
            );

            return;
        }

        showEmpty(
            emptyAssessments,
            false
        );

        assessments.forEach(
            assessment => {

                const row =
                    document.createElement("tr");

                const user =
                    adminData.users.find(
                        item =>
                            String(
                                getUserId(item)
                            ) ===
                            String(
                                assessment.user_id ||
                                ""
                            )
                    );

                const userName =
                    user
                        ? (
                            user.name ||
                            user.username
                        )
                        : (
                            assessment.user_name ||
                            assessment.username ||
                            assessment.user_id ||
                            "Unknown User"
                        );

                const quizScore =
                    Number(
                        assessment.quiz_score || 0
                    );

                const checklistScore =
                    Number(
                        assessment.checklist_score || 0
                    );

                const overallScore =
                    Number(
                        assessment.overall_score || 0
                    );

                const level =
                    assessment.assessment_level ||
                    getAssessmentLevel(
                        overallScore
                    );

                const createdAt =
                    assessment.created_at ||
                    assessment.timestamp ||
                    "";

                row.innerHTML = `

                    <td>

                        <div class="admin-user">

                            <div class="admin-user-avatar">
                                ${escapeHTML(
                                    getInitials(
                                        userName
                                    )
                                )}
                            </div>

                            <div class="admin-user-info">

                                <strong>
                                    ${escapeHTML(
                                        String(
                                            userName
                                        )
                                    )}
                                </strong>

                                <span>
                                    Quiz + Checklist
                                </span>

                            </div>

                        </div>

                    </td>

                    <td>

                        <span class="admin-score">
                            ${Math.round(
                                quizScore
                            )}%
                        </span>

                    </td>

                    <td>

                        <span class="admin-score">
                            ${Math.round(
                                checklistScore
                            )}%
                        </span>

                    </td>

                    <td>

                        <span
                            class="admin-score ${getAssessmentScoreClass(
                                overallScore
                            )}"
                        >
                            ${Math.round(
                                overallScore
                            )}%
                        </span>

                    </td>

                    <td>

                        <span
                            class="assessment-level ${getAssessmentLevelClass(
                                level
                            )}"
                        >
                            ${escapeHTML(
                                String(level)
                            )}
                        </span>

                    </td>

                    <td>

                        <span class="admin-date">
                            ${escapeHTML(
                                formatDate(
                                    createdAt
                                )
                            )}
                        </span>

                    </td>

                `;

                assessmentTableBody.appendChild(row);
            }
        );
    }

    // ==========================================
    // SEARCH
    // ==========================================

    if (userSearch) {

        userSearch.addEventListener(
            "input",
            displayUsers
        );
    }

    // ==========================================
    // RISK FILTER
    // ==========================================

    if (threatRiskFilter) {

        threatRiskFilter.addEventListener(
            "change",
            displayThreats
        );
    }

    // ==========================================
    // REFRESH
    // ==========================================

    if (refreshAdmin) {

        refreshAdmin.addEventListener(
            "click",
            async () => {

                refreshAdmin.disabled = true;

                const originalText =
                    refreshAdmin.textContent;

                refreshAdmin.textContent =
                    "Refreshing...";

                await loadAdminData();

                refreshAdmin.disabled = false;

                refreshAdmin.textContent =
                    originalText ||
                    "Refresh";
            }
        );
    }

    // ==========================================
    // STATUS
    // ==========================================

    function setStatus(message) {

        if (!adminStatus) {
            return;
        }

        adminStatus.textContent =
            message;

        adminStatus.classList.remove(
            "admin-error"
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    function showAdminError(
        message
    ) {

        if (adminStatus) {

            adminStatus.textContent =
                message;

            adminStatus.classList.add(
                "admin-error"
            );
        }

        if (userTableBody) {
            userTableBody.innerHTML = "";
        }

        if (threatTableBody) {
            threatTableBody.innerHTML = "";
        }

        if (assessmentTableBody) {
            assessmentTableBody.innerHTML = "";
        }
    }

    // ==========================================
    // EMPTY STATE
    // ==========================================

    function showEmpty(
        element,
        visible
    ) {

        if (!element) {
            return;
        }

        element.style.display =
            visible ? "" : "none";
    }

    // ==========================================
    // USER ID
    // ==========================================

    function getUserId(user) {

        if (
            user &&
            user.id !== undefined
        ) {
            return user.id;
        }

        if (
            user &&
            user.user_id !== undefined
        ) {
            return user.user_id;
        }

        if (
            user &&
            user.username !== undefined
        ) {
            return user.username;
        }

        return "";
    }

    // ==========================================
    // NUMBER FORMAT
    // ==========================================

    function formatNumber(value) {

        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return number.toLocaleString();
    }

    // ==========================================
    // CAPITALIZE
    // ==========================================

    function capitalize(value) {

        if (!value) {
            return "";
        }

        const text =
            String(value);

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1).toLowerCase()
        );
    }

    // ==========================================
    // THREAT TYPE
    // ==========================================

    function formatThreatType(type) {

        return String(type)
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );
    }

    // ==========================================
    // TRUNCATE
    // ==========================================

    function truncateText(
        text,
        maxLength
    ) {

        const value =
            String(text || "");

        if (
            value.length <= maxLength
        ) {
            return value;
        }

        return (
            value.substring(
                0,
                maxLength - 3
            ) + "..."
        );
    }

    // ==========================================
    // DATE
    // ==========================================

    function formatDate(
        dateValue
    ) {

        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(
                dateValue
            );
        }

        return date.toLocaleString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }

    // ==========================================
    // INITIALS
    // ==========================================

    function getInitials(name) {

        const value =
            String(name || "")
                .trim();

        if (!value) {
            return "U";
        }

        const parts =
            value.split(/\s+/);

        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[
                parts.length - 1
            ].charAt(0)
        ).toUpperCase();
    }

    // ==========================================
    // RISK CLASS
    // ==========================================

    function getRiskClass(risk) {

        const value =
            String(
                risk || "low"
            ).toLowerCase();

        switch (value) {

            case "critical":
                return "risk-critical";

            case "high":
                return "risk-high";

            case "medium":
                return "risk-medium";

            case "low":
            default:
                return "risk-low";
        }
    }

    // ==========================================
    // SCORE CLASS
    // ==========================================

    function getScoreClass(risk) {

        const value =
            String(
                risk || "low"
            ).toLowerCase();

        switch (value) {

            case "critical":
                return "score-critical";

            case "high":
                return "score-high";

            case "medium":
                return "score-medium";

            case "low":
            default:
                return "score-low";
        }
    }

    // ==========================================
    // ASSESSMENT LEVEL
    // ==========================================

    function getAssessmentLevel(
        score
    ) {

        const value =
            Number(score);

        if (value >= 90) {
            return "Excellent";
        }

        if (value >= 75) {
            return "Good";
        }

        if (value >= 50) {
            return "Needs Improvement";
        }

        return "High Attention Required";
    }

    function getAssessmentLevelClass(
        level
    ) {

        const value =
            String(
                level || ""
            ).toLowerCase();

        if (
            value.includes(
                "excellent"
            )
        ) {
            return "level-excellent";
        }

        if (
            value === "good"
        ) {
            return "level-good";
        }

        if (
            value.includes(
                "needs improvement"
            )
        ) {
            return "level-improvement";
        }

        if (
            value.includes(
                "high attention"
            )
        ) {
            return "level-high";
        }

        return "";
    }

    function getAssessmentScoreClass(
        score
    ) {

        const value =
            Number(score);

        if (value >= 90) {
            return "score-excellent";
        }

        if (value >= 75) {
            return "score-good";
        }

        if (value >= 50) {
            return "score-improvement";
        }

        return "score-high";
    }

    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    // ==========================================
    // START
    // ==========================================

    loadAdminData();

});