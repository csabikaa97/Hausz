<!DOCTYPE html>
<html lang="hu">
	<head>
		<meta charset="utf8">
		<title>TeamSpeak audio bot indító</title>
		<link rel="stylesheet" type="text/css" href="/index/style.css" />
	</head>
	<body>
		<script>
			fetch("/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
		</script>
        <?php

        function debug($data) {
            echo "<script>console.log('Debug: " . $data . "' );</script>";
        }

        function execdebug($parancs) {
            echo("> ".$parancs."<br>");
            unset($tempOutputExechez);
            exec($parancs, $tempOutputExechez);
            foreach($tempOutputExechez as $line) {
                echo('"' . $line . '"<br>');
            }
            echo("<br>");
        }

        exec('pgrep -l "dotnet"', $output);
        debug('pid: "'. $output[0].'"');

        if( $output[0] == "" ) {
            echo "<center><h2>Há' mi a dik van??? Nem megy a zenedoboz már megint?</h2></center>";
            echo "<center><h2>Na várjá', indítom...</h2></center>";
            chdir("/home/csabikaa97/ts3audiobot");
            execdebug("service --status-all");
            execdebug("pwd");
            execdebug("whoami");
            //execdebug("ls -l");
            execdebug("/snap/bin/dotnet-runtime-22.dotnet ./TS3AudioBot.dll > log.txt");
            execdebug("more log.txt");
            execdebug('pgrep -l dotnet');
            
        } else {
            echo("van ts bot elvileg");
        }

        ?>
	</body>
</html>
