<?php

require_once "php/auth.php";
require_once "php/db.php";


/* ================= USER ID ================= */

$userId = $_SESSION["user_id"];


/* ================= LOAD USER THREATS FROM MYSQL ================= */

$userThreats = [];

$stmt = $conn->prepare(
    "SELECT
        id,
        user_id,
        type,
        target,
        risk_level,
        risk_score,
        indicators,
        status,
        detected_at,
        updated_at
     FROM threats
     WHERE user_id = ?
     ORDER BY detected_at DESC"
);

$stmt->bind_param(
    "i",
    $userId
);

$stmt->execute();

$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {

    $userThreats[] = $row;

}

$stmt->close();


/* ================= THREAT COUNTS ================= */

$totalThreats = count($userThreats);

$low = 0;
$medium = 0;
$high = 0;
$critical = 0;


foreach ($userThreats as $threat) {

    $risk = strtolower(
        trim(
            $threat["risk_level"] ?? ""
        )
    );

    switch ($risk) {

        case "low":
            $low++;
            break;

        case "medium":
            $medium++;
            break;

        case "high":
            $high++;
            break;

        case "critical":
            $critical++;
            break;
    }
}


/* ================= SECURITY SCORE ================= */

$securityScore = max(
    0,
    100
    - ($high * 10)
    - ($critical * 20)
    - ($medium * 5)
);


/* ================= RECENT THREATS ================= */

$recentThreats = array_slice(
    $userThreats,
    0,
    5
);

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Dashboard | Secure Web</title>

    <link
        rel="stylesheet"
        href="css/style.css"
    >

    <link
        rel="stylesheet"
        href="css/dashboard.css"
    >

</head>


<body>


<!-- ================= DASHBOARD NAVBAR ================= -->

<header class="dashboard-navbar">

    <div class="logo">
        🔐 Secure Web
    </div>


    <div class="user-area">

        <span>

            Welcome,

            <strong>
                <?= htmlspecialchars(
                    $_SESSION["name"] ?? "User"
                ) ?>
            </strong>

        </span>


        <a
            href="php/logout.php"
            class="logout-btn"
        >
            Logout
        </a>

    </div>

</header>



<!-- ================= DASHBOARD LAYOUT ================= -->

<div class="dashboard-layout">


    <!-- ================= SIDEBAR ================= -->

    <aside class="sidebar">


        <a
            href="dashboard.php"
            class="sidebar-link active"
        >
            📊 Dashboard
        </a>


        <a
            href="detection.html"
            class="sidebar-link"
        >
            🛡️ Threat Detection
        </a>


        <a
            href="awareness.html"
            class="sidebar-link"
        >
            🔐 Awareness
        </a>


        <a
            href="assessment.html"
            class="sidebar-link"
        >
            📝 Assessment
        </a>


        <a
    href="incidents.php"
    class="sidebar-link"
>
            🚨 Incidents
        </a>


        <?php if (
            isset($_SESSION["role"]) &&
            $_SESSION["role"] === "admin"
        ): ?>

            <div class="sidebar-divider"></div>


            <a
                href="admin.html"
                class="sidebar-link"
            >
                ⚙️ Admin Panel
            </a>

        <?php endif; ?>


    </aside>



    <!-- ================= MAIN CONTENT ================= -->

    <main class="dashboard-main">


        <!-- ================= HEADING ================= -->

        <div class="dashboard-heading">


            <div>

                <span class="dashboard-label">
                    SECURITY OVERVIEW
                </span>


                <h1>
                    Dashboard
                </h1>


                <p>
                    Monitor your cybersecurity activity
                    and detected threats.
                </p>

            </div>


            <a
                href="detection.html"
                class="btn primary"
            >
                + Scan Threat
            </a>


        </div>



        <!-- ================= STAT CARDS ================= -->

        <section class="stat-grid">


            <!-- TOTAL THREATS -->

            <div class="stat-card">

                <div class="stat-icon blue">
                    🛡️
                </div>


                <div>

                    <span>
                        Total Threats
                    </span>


                    <strong>
                        <?= $totalThreats ?>
                    </strong>

                </div>

            </div>



            <!-- HIGH RISK -->

            <div class="stat-card">

                <div class="stat-icon orange">
                    ⚠️
                </div>


                <div>

                    <span>
                        High Risk
                    </span>


                    <strong>
                        <?= $high ?>
                    </strong>

                </div>

            </div>



            <!-- CRITICAL -->

            <div class="stat-card">

                <div class="stat-icon red">
                    🚨
                </div>


                <div>

                    <span>
                        Critical
                    </span>


                    <strong>
                        <?= $critical ?>
                    </strong>

                </div>

            </div>



            <!-- SECURITY SCORE -->

            <div class="stat-card">

                <div class="stat-icon green">
                    ✓
                </div>


                <div>

                    <span>
                        Security Score
                    </span>


                    <strong>
                        <?= $securityScore ?>%
                    </strong>

                </div>

            </div>


        </section>



        <!-- ================= MAIN GRID ================= -->

        <section class="dashboard-grid">


            <!-- ================= SECURITY SCORE ================= -->

            <div class="dashboard-card score-card">


                <div class="card-header">


                    <div>

                        <h2>
                            Security Score
                        </h2>


                        <p>
                            Your current cybersecurity
                            risk score.
                        </p>

                    </div>


                    <span class="score-number">
                        <?= $securityScore ?>%
                    </span>


                </div>



                <div class="circle-score">


                    <div
                        class="score-circle"
                        style="--score: <?= $securityScore ?>"
                    >

                        <strong>
                            <?= $securityScore ?>
                        </strong>


                        <span>
                            / 100
                        </span>

                    </div>


                </div>



                <div class="score-status">


                    <?php if ($securityScore >= 80): ?>


                        <span class="status-good">
                            ● Good Security
                        </span>


                        <p>
                            Your current security risk
                            is relatively low.
                        </p>


                    <?php elseif ($securityScore >= 50): ?>


                        <span class="status-medium">
                            ● Needs Attention
                        </span>


                        <p>
                            Review your detected threats
                            and security settings.
                        </p>


                    <?php else: ?>


                        <span class="status-danger">
                            ● High Risk
                        </span>


                        <p>
                            Several security issues
                            require attention.
                        </p>


                    <?php endif; ?>


                </div>


            </div>



            <!-- ================= THREAT DISTRIBUTION ================= -->

            <div class="dashboard-card">


                <div class="card-header">


                    <div>

                        <h2>
                            Threat Distribution
                        </h2>


                        <p>
                            Detected threat risk levels.
                        </p>

                    </div>


                </div>



                <div class="threat-bars">


                    <!-- LOW -->

                    <div class="bar-item">


                        <div>

                            <span>
                                Low
                            </span>


                            <strong>
                                <?= $low ?>
                            </strong>

                        </div>


                        <div class="bar">

                            <div
                                class="bar-fill low-fill"
                                style="width: <?= min($low * 10, 100) ?>%"
                            ></div>

                        </div>


                    </div>



                    <!-- MEDIUM -->

                    <div class="bar-item">


                        <div>

                            <span>
                                Medium
                            </span>


                            <strong>
                                <?= $medium ?>
                            </strong>

                        </div>


                        <div class="bar">

                            <div
                                class="bar-fill medium-fill"
                                style="width: <?= min($medium * 10, 100) ?>%"
                            ></div>

                        </div>


                    </div>



                    <!-- HIGH -->

                    <div class="bar-item">


                        <div>

                            <span>
                                High
                            </span>


                            <strong>
                                <?= $high ?>
                            </strong>

                        </div>


                        <div class="bar">

                            <div
                                class="bar-fill high-fill"
                                style="width: <?= min($high * 10, 100) ?>%"
                            ></div>

                        </div>


                    </div>



                    <!-- CRITICAL -->

                    <div class="bar-item">


                        <div>

                            <span>
                                Critical
                            </span>


                            <strong>
                                <?= $critical ?>
                            </strong>

                        </div>


                        <div class="bar">

                            <div
                                class="bar-fill critical-fill"
                                style="width: <?= min($critical * 10, 100) ?>%"
                            ></div>

                        </div>


                    </div>


                </div>


            </div>


        </section>



        <!-- ================= RECENT THREATS ================= -->

        <section class="dashboard-card recent-card">


            <div class="card-header">


                <div>

                    <h2>
                        Recent Threats
                    </h2>


                    <p>
                        Latest security checks performed
                        on your account.
                    </p>

                </div>


                <a
    href="incidents.php"
    class="view-all"
>
                    View All →
                </a>


            </div>



            <?php if (empty($recentThreats)): ?>


                <!-- EMPTY STATE -->

                <div class="empty-state">


                    <div>
                        🛡️
                    </div>


                    <h3>
                        No threats detected
                    </h3>


                    <p>
                        Your recent threat activity
                        will appear here.
                    </p>


                    <a
                        href="detection.html"
                        class="btn primary"
                    >
                        Run Security Check
                    </a>


                </div>


            <?php else: ?>


                <!-- THREAT TABLE -->

                <div class="table-wrapper">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Target
                                </th>

                                <th>
                                    Risk
                                </th>

                                <th>
                                    Date
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                        <?php foreach (
                            $recentThreats
                            as $threat
                        ): ?>


                            <?php

                            $risk = strtolower(
                                trim(
                                    $threat["risk_level"]
                                    ?? "low"
                                )
                            );

                            ?>


                            <tr>


                                <td>

                                    <?= htmlspecialchars(
                                        $threat["type"]
                                        ?? "Unknown"
                                    ) ?>

                                </td>


                                <td>

                                    <?= htmlspecialchars(
                                        $threat["target"]
                                        ?? "-"
                                    ) ?>

                                </td>


                                <td>

                                    <span
                                        class="risk-badge <?= htmlspecialchars($risk) ?>"
                                    >

                                        <?= strtoupper(
                                            htmlspecialchars($risk)
                                        ) ?>

                                    </span>

                                </td>


                                <td>

                                    <?= htmlspecialchars(
                                        $threat["detected_at"]
                                        ?? "-"
                                    ) ?>

                                </td>


                            </tr>


                        <?php endforeach; ?>


                        </tbody>


                    </table>


                </div>


            <?php endif; ?>


        </section>



        <!-- ================= QUICK ACTIONS ================= -->

        <section>


            <div class="section-title">

                <h2>
                    Quick Actions
                </h2>

            </div>



            <div class="quick-grid">


                <!-- CHECK URL -->

                <a
                    href="detection.html"
                    class="quick-card"
                >

                    <span>
                        🔗
                    </span>


                    <div>

                        <h3>
                            Check URL
                        </h3>


                        <p>
                            Analyze a suspicious URL.
                        </p>

                    </div>

                </a>



                <!-- PASSWORD -->

                <a
                    href="password-checker.html"
                    class="quick-card"
                >

                    <span>
                        🔑
                    </span>


                    <div>

                        <h3>
                            Password Check
                        </h3>


                        <p>
                            Test your password strength.
                        </p>

                    </div>

                </a>



                <!-- ASSESSMENT -->

                <a
                    href="assessment.html"
                    class="quick-card"
                >

                    <span>
                        📝
                    </span>


                    <div>

                        <h3>
                            Security Quiz
                        </h3>


                        <p>
                            Test your cybersecurity knowledge.
                        </p>

                    </div>

                </a>



                <!-- AWARENESS -->

                <a
                    href="awareness.html"
                    class="quick-card"
                >

                    <span>
                        📚
                    </span>


                    <div>

                        <h3>
                            Learn Security
                        </h3>


                        <p>
                            Explore cybersecurity topics.
                        </p>

                    </div>

                </a>


            </div>


        </section>


    </main>


</div>


</body>

</html>