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
?>