<?php
    session_start();
?>
<!DOCTYPE html>
<html>

<head>
    <title>Hausz megosztó</title>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex">
    <link rel="stylesheet" type="text/css" href="/index/style.css" />
    <link rel="shortcut icon" type="image/png" href="/index/favicon.png" />
    <meta name="color-scheme" content="dark light">
</head>

<body>
    <?php readfile("/var/www/html/index/topbar.html"); ?>

    <center>
        <h1>Hausz megosztó jelszó változtatás</h1>
    </center>

    <?php
    $dbname = "hausz_megoszto";
    include '../include/adatbazis.php';
    include '../include/alap_fuggvenyek.php';

    function showPage($reason)
    {
echo <<<END
        <center>
        <p>
END;
echo($reason);
echo <<<END
        </p>
        <div class='register'>
        <form id='password_reset' action='change_password.php' method='post'>
        <input autocomplete='current-password' id='current-password' type='password' name='current-password' placeholder='Jelenlegi jelszó'><br>
        <input autocomplete='new-password' id='new-password' type='password' name='new-password' placeholder='Új jelszó'><br>
        <input autocomplete='new-password-confirm' id='new-password-confirm' type='password' name='new-password-confirm' placeholder='Új jelszó megerősítése'><br>
        <input type='hidden' name='change' value='yes'>
        <br><button type='submit'>Jelszó megváltoztatása</button>
        </form>
        </div>
        <br><br><a href="https://hausz.stream/uploads/feltoltes.php"><- Vissza a Hausz megosztóra</a>
        </center>
END;
        die();
    }

    if ($_GET['register_done'] == '1') {
        showPage('A jelszavad meg lett változtatva');
    }

    if ($_SESSION['loggedin'] != "yes") {
        header("Location: https://hausz.stream/uploads/register.php");
    }

    if ($_POST['change'] != "yes") {
        showPage("");
    }

    $_POST['change'] = '';
    if (strlen($_POST['current-password']) == 0) {                  showPage('Nem adtad meg a jelenlegi jelszavad'); }
    if (strlen($_POST['new-password']) == 0) {                      showPage('Nem adtad meg az új jelszavad'); }
    if (strlen($_POST['new-password-confirm']) == 0) {              showPage('Nem erősítetted meg az új jelszavad'); }
    if (strlen($_POST['new-password']) < 3) {                       showPage('Túl rövid a jelszavad (minimum 3 karakter hosszúnak kell lennie)'); }
    if ($_POST['new-password'] != $_POST['new-password-confirm']) { showPage('Nem egyeznek az új jelszavak'); }

    $query_username_check = "select * from users where username = '" . $_SESSION['username'] . "'";
    $result_username_check = $conn->query($query_username_check);
    $username = "";
    if ($result_username_check) {
        $row = $result_username_check->fetch_assoc();
        if (mysqli_num_rows($result_username_check) > 0) {
            $username = $row['username'];
            if (!password_verify($_POST['current-password'], $row['password'])) {
                showPage('Helytelen jelenlegi jelszót adtál meg.');
            }
        } else {
            showPage('Belső hiba: Nem ellenőrizhető a jelszó (felhasználónév nem létezik)');
        }
    } else {
        showPage('Belső hiba: Hibás query: '.$result_username_check.'<br>'.$query_username_check);
    }

    $query_change = 'update hausz_megoszto.users set password = "' . password_hash($_POST['new-password'], PASSWORD_DEFAULT) . '" where username = "'.$username.'";';
    $result_change = $conn->query($query_change);

    if (!$result_change) {
        showpage('Belső query hiba: "'.$query_change.'"<br>'.$conn->error);
    }

    showPage('A jelszavad sikeresen meg lett változtatva');
    
    ?>
</body>

</html>