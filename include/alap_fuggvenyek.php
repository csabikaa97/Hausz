<?php
    function printLn($string) { 
        echo $string . "\n";
    }

    function debug($data) { 
        echo "<script>console.log('Debug: " . $data . "' );</script>"; 
    }

    function die_if($feltetel, $szoveg) {
        if($feltetel) {
            echo($szoveg);
            die();
        }
    }

    function exit_ok($szoveg) {
        echo($szoveg);
        die();
    }

    function query_futtatas($query) {
        global $conn;
        $result = $conn->query($query);
        die_if( !$result, 'HIBA:Query hiba: '.$query);
        return $result;
    }
?>