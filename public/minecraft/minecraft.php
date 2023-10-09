<?php
    session_start();
    include '../../forras/include/adatbazis.php';
    include '../../forras/include/alap_fuggvenyek.php';

    adatbazis_csatlakozas("", "", "", "");

    die_if( !isset($_SESSION['loggedin']), "Nem vagy belépve.");
    
    if( isset($_GET['felhasznalonev_info'])) {
        $sajat_meghivok = query_futtatas("SELECT minecraft_username FROM hausz_megoszto.users WHERE id = " . $_SESSION['user_id']);

        $result = $sajat_meghivok -> fetch_assoc();
        die_if( $result['minecraft_username'] == NULL, "Nincs jelenleg Minecraft felhasználóneved megadva a rendszerben.");

        exit_ok('"minecraft_username": "'.$result['minecraft_username'].'"');
    }

    if( isset($_GET['felhasznalonev_valtoztatas'])) {
        $uj_felhasznalonev = $_POST['uj_felhasznalonev'];

        die_if( !preg_match('/^([a-zA-Z0-9_]{3,16})$/', $uj_felhasznalonev), "A felhasználónév csak az angol ABC betűit, számokat, és '_' karaktert tartalmazhat, és 3-16 karakter hosszú lehet.");

        $username_check = query_futtatas("SELECT * FROM hausz_megoszto.users WHERE minecraft_username = '".$uj_felhasznalonev."' AND id != " . $_SESSION['user_id']);
        die_if( $username_check -> num_rows > 0, "Már létezik ilyen felhasználónév az adatbázisban.");

        query_futtatas("UPDATE hausz_megoszto.users SET minecraft_username = '" . $uj_felhasznalonev . "' WHERE id = " . $_SESSION['user_id']);

        log_bejegyzes("hausz_alap", "Minecraft felhasználónév változtatás", $uj_felhasznalonev, $_SESSION['username']);
        exit_ok('Felhasználónév változtatás sikeres');
    }

    if( isset($_GET['jatekos_lista'])) {
        $jatekosok = query_futtatas("SELECT username, minecraft_username, minecraft_isLogged, minecraft_lastlogin FROM hausz_megoszto.users WHERE minecraft_lastlogin IS NOT NULL ORDER BY minecraft_isLogged DESC, minecraft_lastlogin DESC");
        
        if( $jatekosok -> num_rows <= 0) {
            exit_ok('"jatekosok_szama": '.$jatekosok -> num_rows.'');
        }
        
        $eredmeny = '"jatekosok": [';
            
        $jatekos = $jatekosok -> fetch_assoc();
        $eredmeny .= '{"username": "'.$jatekos['username'].'", "minecraft_username": "'.$jatekos['minecraft_username'].'", "minecraft_isLogged": '.$jatekos['minecraft_isLogged'].', "minecraft_lastlogin": '.$jatekos['minecraft_lastlogin'].'}';
        while( $jatekos = $jatekosok -> fetch_assoc() ) {
            $eredmeny .= ', {"username": "'.$jatekos['username'].'", "minecraft_username": "'.$jatekos['minecraft_username'].'", "minecraft_isLogged": '.$jatekos['minecraft_isLogged'].', "minecraft_lastlogin": '.$jatekos['minecraft_lastlogin'].'}';
        }

        $eredmeny .= ']';

        exit_ok($eredmeny);
    }
?>