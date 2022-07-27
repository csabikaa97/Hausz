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

    function exit_ok($szoveg) {
        echo('{"eredmeny": "ok", ');
        if($szoveg[0] != '"' && $szoveg[0] != "'" && $szoveg[0] != '[') {
            echo('"valasz":"'.$szoveg.'"}');
        } else {
            echo($szoveg.'}');
        }
        die();
    }

    function query_futtatas($query) {
        global $conn;
        $result = $conn->query($query);
        die_if( !$result, 'Query '.$query);
        return $result;
    }
?>