<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");


/* =========================================================
   AUTHENTICATION
========================================================= */

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Please login before using threat detection."
    ]);

    exit;
}


/* =========================================================
   GET HASH
========================================================= */

$hash = trim($_POST["hash"] ?? "");


if ($hash === "") {

    echo json_encode([
        "success" => false,
        "message" => "Please enter a file hash."
    ]);

    exit;
}


/* =========================================================
   BASIC VALIDATION
========================================================= */

$hash = strtolower($hash);


if (!ctype_xdigit($hash)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid hash. A hash must contain hexadecimal characters only."
    ]);

    exit;
}


/* =========================================================
   DETERMINE HASH TYPE
========================================================= */

$hashLength = strlen($hash);

$hashType = "Unknown";


switch ($hashLength) {

    case 32:
        $hashType = "MD5";
        break;

    case 40:
        $hashType = "SHA-1";
        break;

    case 64:
        $hashType = "SHA-256";
        break;
}


/* =========================================================
   CHECK HASH TYPE
========================================================= */

if ($hashType === "Unknown") {

    echo json_encode([
        "success" => false,
        "message" =>
            "Unsupported hash length. Supported formats are MD5, SHA-1 and SHA-256."
    ]);

    exit;
}


/* =========================================================
   INDICATORS
========================================================= */

$indicators = [];

$indicators[] =
    "Valid hexadecimal hash format detected.";

$indicators[] =
    $hashType . " hash identified.";

$indicators[] =
    "No external threat intelligence database was queried.";


/* =========================================================
   RISK
========================================================= */

$risk = "Low";

$message =
    "The hash format was identified successfully. " .
    "A valid hash does not by itself indicate that a file is malicious. " .
    "No external threat intelligence database was queried.";


/* =========================================================
   THREAT FILE
========================================================= */

$threatFile = __DIR__ . "/../data/threats.json";

$threats = [];


/* =========================================================
   LOAD EXISTING THREATS
========================================================= */

if (file_exists($threatFile)) {

    $existingData = file_get_contents($threatFile);

    if (
        $existingData !== false &&
        trim($existingData) !== ""
    ) {

        $decoded = json_decode(
            $existingData,
            true
        );

        if (is_array($decoded)) {
            $threats = $decoded;
        }
    }
}


/* =========================================================
   CREATE UNIQUE RECORD ID
========================================================= */

$nextId = 1;

foreach ($threats as $threat) {

    if (
        is_array($threat) &&
        isset($threat["id"]) &&
        is_numeric($threat["id"])
    ) {

        $nextId = max(
            $nextId,
            (int)$threat["id"] + 1
        );
    }
}


/* =========================================================
   ADD THREAT RECORD
========================================================= */

$threats[] = [

    "id" =>
        $nextId,

    "user_id" =>
        $_SESSION["user_id"],

    "type" =>
        "Hash Analysis",

    "target" =>
        $hash,

    "risk_level" =>
        $risk,

    "risk_score" =>
        0,

    "indicators" =>
        $indicators,

    "detected_at" =>
        date("Y-m-d H:i:s")

];


/* =========================================================
   SAVE JSON
========================================================= */

$json = json_encode(
    $threats,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
);


if (
    $json === false ||
    file_put_contents(
        $threatFile,
        $json,
        LOCK_EX
    ) === false
) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to save hash analysis result."
    ]);

    exit;
}


/* =========================================================
   RESPONSE
========================================================= */

echo json_encode([

    "success" =>
        true,

    "hash" =>
        $hash,

    "hash_type" =>
        $hashType,

    "hash_length" =>
        $hashLength,

    "risk_level" =>
        $risk,

    "message" =>
        $message,

    "indicators" =>
        $indicators

]);

exit;

?>