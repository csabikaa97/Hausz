<?php
    function printLn($string) {
        echo $string . "\n";
    }

    function die_if($feltetel, $szoveg) {
        if($feltetel) {
            echo('{"eredmeny": "hiba", ');
            if($szoveg[0] == '"' || $szoveg[0] == "'") {
                echo($szoveg.'}');
            } else {
                echo('"valasz":"'.$szoveg.'"}');
            }
            die();
        }
    }
    
    function simpleStringHash($string) {
        // https://linuxhint.com/javascript-hash-function/
        $hash = 0;
        if (strlen($string) == 0) return $hash;
        for ($x = 0; $x < strlen($string); $x++) {
            $ch = ord($string[$x]);
            $hash = (($hash <<5) - $hash) + $ch;
            $hash = $hash & $hash;
        }
        return $hash;
    }

    function exit_ok($szoveg) {
        echo('{"eredmeny": "ok", ');
        if($szoveg[0] != '"' && $szoveg[0] != "'" && $szoveg[0] != '[') {
            echo('"valasz":"'.$szoveg.'"}');
        } else {
            echo($szoveg.'}');
        }
        die();
    }

    function query_futtatas($query, $dbname = "hausz_megoszto") {
        global $conn;
        if( $dbname == "" )
            $dbname = "hausz_megoszto";
        
        $result = $conn[$dbname]->query($query);
        die_if( !$result, 'Query '.$query);
        return $result;
    }
?>