<?php   
    session_start();

    include '../include/alap_fuggvenyek.php';

    die_if( $_SESSION['admin'] != "igen" || $_SESSION['loggedin'] != "yes", 'Nem vagy jogosult');
    die_if( strlen($_GET['parancs']) <= 0, 'Nem adtál meg parancsot');
    
    $eredmeny = "";
    exec($_GET['parancs'], $eredmeny, $retval);
    echo '>>> '.$_GET['parancs'].'<br>';
    foreach ($eredmeny as $sor) {
        echo $sor.'<br>';
    }
    echo '<br>';
?>