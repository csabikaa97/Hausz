<?php
    function printLn($string) { 
        echo $string . "\n";
    }

    function debug($data) { 
        echo "<script>console.log('Debug: " . $data . "' );</script>"; 
    }
?>