<?php

/* =========================================================
   SECURE WEB
   ADMIN DASHBOARD BACKEND
========================================================= */

session_start();

header("Content-Type: application/json; charset=UTF-8");


/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

if (!isset($_SESSION["user_id"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authentication required."
    ]);

    exit;
}


if (($_SESSION["role"] ?? "") !== "admin") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Administrator access required."
    ]);

    exit;
}


/* =========================================================
   FILE PATHS
========================================================= */

$usersFile =
    __DIR__ . "/../data/users.json";

$threatsFile =
    __DIR__ . "/../data/threats.json";

$assessmentsFile =
    __DIR__ . "/../data/assessments.json";


/* =========================================================
   JSON FILE READER
========================================================= */

function readJsonFile($file)
{
    if (!file_exists($file)) {
        return [];
    }

    $content = file_get_contents($file);

    if (
        $content === false ||
        trim($content) === ""
    ) {
        return [];
    }

    $data = json_decode($content, true);

    return is_array($data) ? $data : [];
}


/* =========================================================
   LOAD DATA
========================================================= */

$users =
    readJsonFile($usersFile);

$threats =
    readJsonFile($threatsFile);

$assessments =
    readJsonFile($assessmentsFile);


/* =========================================================
   REMOVE SENSITIVE USER INFORMATION
========================================================= */

$safeUsers = [];

foreach ($users as $user) {

    if (!is_array($user)) {
        continue;
    }

    unset($user["password"]);
    unset($user["password_hash"]);

    $safeUsers[] = $user;
}


/* =========================================================
   THREAT STATISTICS
========================================================= */

$totalThreats =
    count($threats);

$lowThreats = 0;
$mediumThreats = 0;
$highThreats = 0;
$criticalThreats = 0;


foreach ($threats as $threat) {

    if (!is_array($threat)) {
        continue;
    }

    $risk = strtolower(
        trim(
            $threat["risk_level"] ??
            $threat["risk"] ??
            ""
        )
    );


    switch ($risk) {

        case "low":
            $lowThreats++;
            break;

        case "medium":
            $mediumThreats++;
            break;

        case "high":
            $highThreats++;
            break;

        case "critical":
            $criticalThreats++;
            break;
    }
}


/* =========================================================
   ASSESSMENT STATISTICS
========================================================= */

$totalAssessments =
    count($assessments);

$totalScore = 0;
$validScores = 0;


foreach ($assessments as $assessment) {

    if (!is_array($assessment)) {
        continue;
    }

    if (
        isset($assessment["overall_score"]) &&
        is_numeric($assessment["overall_score"])
    ) {

        $totalScore +=
            (float)$assessment["overall_score"];

        $validScores++;
    }
}


$averageScore = 0;

if ($validScores > 0) {

    $averageScore = round(
        $totalScore / $validScores,
        1
    );
}


/* =========================================================
   SORT USERS
========================================================= */

usort(
    $safeUsers,
    function ($a, $b) {

        $dateA =
            $a["created_at"] ?? "";

        $dateB =
            $b["created_at"] ?? "";

        return strcmp(
            $dateB,
            $dateA
        );
    }
);


/* =========================================================
   SORT THREATS
========================================================= */

usort(
    $threats,
    function ($a, $b) {

        $dateA =
            $a["created_at"] ??
            $a["detected_at"] ??
            "";

        $dateB =
            $b["created_at"] ??
            $b["detected_at"] ??
            "";

        return strcmp(
            $dateB,
            $dateA
        );
    }
);


/* =========================================================
   SORT ASSESSMENTS
========================================================= */

usort(
    $assessments,
    function ($a, $b) {

        $dateA =
            $a["created_at"] ??
            $a["timestamp"] ??
            "";

        $dateB =
            $b["created_at"] ??
            $b["timestamp"] ??
            "";

        return strcmp(
            $dateB,
            $dateA
        );
    }
);


/* =========================================================
   RECENT DATA
========================================================= */

$recentUsers =
    array_slice(
        $safeUsers,
        0,
        5
    );

$recentThreats =
    array_slice(
        $threats,
        0,
        10
    );

$recentAssessments =
    array_slice(
        $assessments,
        0,
        10
    );


/* =========================================================
   RECENT ACTIVITY
========================================================= */

$activity = [];


/* ---------------------------------------------------------
   USERS
--------------------------------------------------------- */

foreach ($recentUsers as $user) {

    $activity[] = [

        "type" =>
            "user",

        "title" =>
            "User registered",

        "description" =>
            $user["name"] ??
            "Unknown user",

        "created_at" =>
            $user["created_at"] ??
            ""
    ];
}


/* ---------------------------------------------------------
   THREATS
--------------------------------------------------------- */

foreach ($recentThreats as $threat) {

    $activity[] = [

        "type" =>
            "threat",

        "title" =>
            "Threat detected",

        "description" =>
            $threat["threat_type"] ??
            $threat["type"] ??
            "Security check",

        "risk_level" =>
            $threat["risk_level"] ??
            $threat["risk"] ??
            "Low",

        "created_at" =>
            $threat["created_at"] ??
            $threat["detected_at"] ??
            ""
    ];
}


/* ---------------------------------------------------------
   ASSESSMENTS
--------------------------------------------------------- */

foreach ($recentAssessments as $assessment) {

    $activity[] = [

        "type" =>
            "assessment",

        "title" =>
            "Security assessment completed",

        "description" =>
            "Score: " .
            ($assessment["overall_score"] ?? 0) .
            "%",

        "created_at" =>
            $assessment["created_at"] ??
            $assessment["timestamp"] ??
            ""
    ];
}


/* =========================================================
   SORT ACTIVITY
========================================================= */

usort(
    $activity,
    function ($a, $b) {

        return strcmp(
            $b["created_at"] ?? "",
            $a["created_at"] ?? ""
        );
    }
);


/* =========================================================
   LIMIT ACTIVITY
========================================================= */

$activity =
    array_slice(
        $activity,
        0,
        15
    );


/* =========================================================
   RESPONSE
========================================================= */

echo json_encode(

    [

        "success" =>
            true,

        "message" =>
            "Administrator data loaded successfully.",

        "admin" => [

            "user_id" =>
                $_SESSION["user_id"],

            "name" =>
                $_SESSION["name"] ?? "",

            "role" =>
                $_SESSION["role"]
        ],

        "statistics" => [

            "total_users" =>
                count($safeUsers),

            "total_threats" =>
                $totalThreats,

            "low_threats" =>
                $lowThreats,

            "medium_threats" =>
                $mediumThreats,

            "high_threats" =>
                $highThreats,

            "critical_threats" =>
                $criticalThreats,

            "total_assessments" =>
                $totalAssessments,

            "average_score" =>
                $averageScore
        ],

        "users" =>
            $safeUsers,

        "threats" =>
            $threats,

        "assessments" =>
            $assessments,

        "activity" =>
            $activity
    ],

    JSON_PRETTY_PRINT |
    JSON_UNESCAPED_SLASHES
);

exit;

?>