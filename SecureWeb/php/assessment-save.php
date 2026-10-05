<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";


/* =========================================================
   CHECK LOGIN
========================================================= */

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "User is not logged in."
    ]);

    exit;
}

$userId = $_SESSION["user_id"];


/* =========================================================
   GET FORM DATA
========================================================= */

$quizScore = filter_input(
    INPUT_POST,
    "quiz_score",
    FILTER_VALIDATE_INT
);

$checklistScore = filter_input(
    INPUT_POST,
    "checklist_score",
    FILTER_VALIDATE_INT
);

$checklistItemsRaw =
    $_POST["checklist_items"] ?? "[]";


/* =========================================================
   VALIDATE QUIZ SCORE
========================================================= */

if (
    $quizScore === false ||
    $quizScore === null ||
    $quizScore < 0 ||
    $quizScore > 100
) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid quiz score."
    ]);

    exit;
}


/* =========================================================
   VALIDATE CHECKLIST SCORE
========================================================= */

if (
    $checklistScore === false ||
    $checklistScore === null ||
    $checklistScore < 0 ||
    $checklistScore > 100
) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid checklist score."
    ]);

    exit;
}


/* =========================================================
   ALLOWED CHECKLIST VALUES
========================================================= */

$allowedItems = [

    "password",
    "mfa",
    "updates",
    "phishing",
    "wifi",
    "backup"

];


/* =========================================================
   DECODE CHECKLIST
========================================================= */

$checklistItems = json_decode(
    $checklistItemsRaw,
    true
);

if (!is_array($checklistItems)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid checklist data."
    ]);

    exit;
}


/* =========================================================
   REMOVE INVALID VALUES
========================================================= */

$checklistItems = array_values(
    array_unique(
        array_filter(
            $checklistItems,
            function ($item) use ($allowedItems) {

                return in_array(
                    $item,
                    $allowedItems,
                    true
                );

            }
        )
    )
);


/* =========================================================
   CALCULATE OVERALL SCORE
========================================================= */

$overallScore = (int) round(

    ($quizScore * 0.60) +
    ($checklistScore * 0.40)

);


/* =========================================================
   ASSESSMENT LEVEL
========================================================= */

if ($overallScore >= 90) {

    $assessmentLevel = "Excellent";

} elseif ($overallScore >= 75) {

    $assessmentLevel = "Good";

} elseif ($overallScore >= 50) {

    $assessmentLevel = "Needs Improvement";

} else {

    $assessmentLevel = "High Attention Required";

}


/* =========================================================
   RECOMMENDATIONS
========================================================= */

$recommendationMap = [

    "password" => [

        "title" =>
            "Improve Password Security",

        "message" =>
            "Use long, unique passwords for important accounts and avoid password reuse."

    ],

    "mfa" => [

        "title" =>
            "Enable Multi-Factor Authentication",

        "message" =>
            "Enable MFA on important accounts whenever the service provides it."

    ],

    "updates" => [

        "title" =>
            "Keep Software Updated",

        "message" =>
            "Install security updates for your operating system, browser, and applications."

    ],

    "phishing" => [

        "title" =>
            "Strengthen Phishing Awareness",

        "message" =>
            "Verify unexpected messages, senders, attachments, and URLs before interacting with them."

    ],

    "wifi" => [

        "title" =>
            "Use Public Wi-Fi Carefully",

        "message" =>
            "Avoid sensitive activity on untrusted networks and use appropriate security protections."

    ],

    "backup" => [

        "title" =>
            "Maintain Backups",

        "message" =>
            "Keep important files backed up so they can be recovered after data loss or certain attacks."

    ]

];


$recommendations = [];


foreach ($allowedItems as $item) {

    if (!in_array(
        $item,
        $checklistItems,
        true
    )) {

        $recommendations[] =
            $recommendationMap[$item];

    }

}


/* =========================================================
   CONVERT DATA FOR MYSQL
========================================================= */

$checklistItemsJson = json_encode(
    $checklistItems,
    JSON_UNESCAPED_SLASHES
);

$recommendationsJson = json_encode(
    $recommendations,
    JSON_UNESCAPED_SLASHES
);


/* =========================================================
   SAVE TO MYSQL
========================================================= */

$stmt = $conn->prepare("
    INSERT INTO assessments
    (
        user_id,
        quiz_score,
        checklist_score,
        overall_score,
        assessment_level,
        checklist_items,
        recommendations,
        created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
");


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "SQL prepare error: " . $conn->error
    ]);

    exit;
}


/* =========================================================
   BIND VALUES
========================================================= */

$stmt->bind_param(
    "iiiisss",
    $userId,
    $quizScore,
    $checklistScore,
    $overallScore,
    $assessmentLevel,
    $checklistItemsJson,
    $recommendationsJson
);


/* =========================================================
   EXECUTE
========================================================= */

if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to save assessment: " . $stmt->error
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


/* =========================================================
   GET INSERTED ID
========================================================= */

$assessmentId = $stmt->insert_id;


/* =========================================================
   SUCCESS
========================================================= */

echo json_encode([

    "success" => true,

    "message" =>
        "Assessment saved successfully.",

    "assessment" => [

        "id" =>
            $assessmentId,

        "user_id" =>
            $userId,

        "quiz_score" =>
            $quizScore,

        "checklist_score" =>
            $checklistScore,

        "overall_score" =>
            $overallScore,

        "assessment_level" =>
            $assessmentLevel,

        "checklist_items" =>
            $checklistItems,

        "recommendations" =>
            $recommendations,

        "created_at" =>
            date("Y-m-d H:i:s")

    ]

]);


$stmt->close();
$conn->close();

?>