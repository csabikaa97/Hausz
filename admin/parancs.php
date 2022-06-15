<?php   
    session_start(); 
    if($_SESSION['admin'] != "igen" || $_SESSION['loggedin'] != "yes") {
        die('Nem vagy jogosult');
    }

    if(strlen($_GET['parancs']) <= 0) {
        die('Nem adtál meg parancsot');
    }

    $eredmeny = "";
    exec($_GET['parancs'], $eredmeny, $retval);
    echo '>>> '.$_GET['parancs'].'<br>';
    foreach ($eredmeny as $sor) {
        echo $sor.'<br>';
    }
    echo '<br>';
?>