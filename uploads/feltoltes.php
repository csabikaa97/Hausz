<!DOCTYPE html>
<html>
    <head>
		<title>Hausz megosztó</title>
		<meta charset="UTF-8">
		<link rel="stylesheet" type="text/css" href="/index/style.css" />
		<link rel="shortcut icon" type="image/png" href="/favicon.png"/>
	</head>
    <body>
        <script>
			fetch("/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
		</script>
        <form action="feltoltes.php" method="post" enctype="multipart/form-data">
            <h1>Hausz megosztó</h1>
            <p>Válassz ki egy fájlt a feltöltéshez</p>
            <input class="InputSzoveg" type="file" name="fileToUpload" id="fileToUpload">
            <button class="Gombok KekHatter" name="submit" type="submit" value="Kimenet" id="SubmitGomb">Feltöltés</button>
        </form>

        <?php
            function debug($data) {
                echo "<script>console.log('Debug: " . $data . "' );</script>";
            }

            $target_file = "/var/www/html/uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]);
            debug("uploads/fajlok/" . basename($_FILES["fileToUpload"]["name"]));

            if($_GET['delete'] == '1') {
                shell_exec('rm "/var/www/html/uploads/fajlok/'.$_GET['file'].'"');
                echo('rm "/var/www/html/uploads/fajlok/'.$_GET['file'].'"');
                echo '<h1>"'.$_GET['file'].'" törölve.</h1>';
            }

            if(isset($_POST["submit"])) {
                if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
                    echo '<h1>A "' . $_FILES["fileToUpload"]["name"] . '" nevű fájl sikeresen fel lett töltve.</h1>';
                    echo "<a href='http://azure.hausz.stream/uploads/fajlok" . basename( $_FILES["fileToUpload"]["name"] ) . "'>http://azure.hausz.stream/uploads/fajlok/" . basename( $_FILES["fileToUpload"]["name"] ) . "</a>";
                } else {
                    echo '<h1>Sorry, there was an error uploading your file.</h1>';
                }
                unset($_POST["submit"]);
            }

            $ls_output2 = exec("ls -t /var/www/html/uploads/fajlok", $ls_output);
		//var_dump($ls_output);
            print("<table>");
            print("<tr>");
            print("<th>Fájlnév</th>");
            print("<th>Törlés</th>");
            print("</tr>");
            
            foreach($ls_output as $line) {
                print("<tr>");
                print('<td><a href="http://azure.hausz.stream/uploads/fajlok/'.$line.'">'.$line."</a></td>");
                print('<td><a href="http://azure.hausz.stream/uploads/feltoltes.php?delete=1&file='.$line.'">X</a></td>');
                print("</tr>");
            }
            
        ?>
    </body>
</html>
