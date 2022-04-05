<?php
    session_start();
    if( isset( $_SESSION['STARTED'] ) ) {
        debug("Debug: Session already started");
    } else {
        debug("Debug: Session not started yet: " . $_SESSION['STARTED']);
        $_SESSION['STARTED'] = "1";
    }
?>

<!DOCTYPE html>
<html lang="hu">
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="/index/style.css" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png"/>
        <title id="title">Hausz YouTube letöltő Alpha xdddáű</title>
    </head>
    <body>
        <script>
			fetch("/index/topbar.html")
				.then(response => response.text())
				.then(text => document.body.innerHTML = text + document.body.innerHTML)
		</script>
        <div id="FoDoboz">
            <center>
                <h1 id="utasitas"></h1>
                <form action="youtube-downloader.php" method="post">
                    <?php
                        function debug($data) {
                            echo "<script>console.log('Debug: " . $data . "' );</script>";
                        }

                        function debugAll() {
                            debug('Submit gomb: "' . $_POST['submit'] . '"');
                            debug('InputSzoveg: "' . $_POST['InputSzoveg'] . '"');
                            debug('SessionLink: "' . $_SESSION['link'] . '"');
                            debug('Token: "' . $_SESSION['VideoToken'] . '"');
                            debug('Session ID: "' . session_id() . '"');
                        }
                        
                        function changeUtasitas($uzenet) {
                            echo '<script>document.querySelector("#utasitas").innerHTML = "' . $uzenet . '";</script>';
                        }

                        if($_SERVER['REQUEST_METHOD'] != "POST" and !isset($_POST['submit'])) {
                            // ELSO LEPES: link beillesztes
                            changeUtasitas("Illessz be egy YouTube linket");
                            echo '<input type="text" placeholder="Link helye" class="InputSzoveg" name="InputSzoveg" />';
                            echo '<br>';
                            echo '<br>';
                            echo '<button class="Gombok ReteknagyGombok KekHatter" name="submit" type="submit" value="Kimenet" id="SubmitGomb" class="ReteknagyGombok KekHatter">Konvertálás</button>';
                            echo '<script>document.querySelector("#FoDoboz").classList.add("FuggolegesCenter")</script>';
                            echo '<script>document.querySelector("#FoDoboz").classList.add("FullDoboz")</script>';
                            session_regenerate_id();
                        } else {
                            // MAOSDIK LEPES: felbontas valsztasa
                            if( $_POST['submit'] == "Kimenet" ) {
                                $_SESSION['link'] = $_POST['InputSzoveg'];
                                changeUtasitas("Válassz egy fájlt");

                                echo '<p class="KicsiSzoveg">"' . exec('youtube-dl "' .  $_SESSION["link"] . '" --get-title --restrict-filenames') . '"</p>';
                                $_SESSION['ThumbnailLink'] = 'https://img.youtube.com/vi/' . exec('linkmester "' . $_SESSION['link'] . '"') . '/mqdefault.jpg';
                                echo '<img width="320" height="180" src="' . $_SESSION["ThumbnailLink"] . '" alt="thumbnail"/>';
                                exec('youtube-dl "' . $_POST['InputSzoveg'] . '" -F > "./logok/' . session_id() . '.txt"');

                                echo '<br><button class="Gombok ZoldHatter" name="submit" type="submit" id="' . $FormatCode . '" value="bestaudio" >Zene letöltés</button>';
                                echo '<button class="Gombok ZoldHatter" name="submit" type="submit" id="' . $FormatCode . '" value="best" >Videó letöltés</button><br>';

                                echo '<table id="tabla1">';
                                exec('varazslas "' . session_id() . '"', $output);
                                echo '<tr style="background-color: rgb(220,220,220)">
                                        <td><p>Formátumkód</p></td>
                                        <td><p class="SzovegJobbra">Felbontás</p></td>
                                        <td><p>FPS</p></td>
                                        <td><p>Container</p></td>
                                        <td><p>Codec</p></td>
                                        <td><p>Média</p></td>
                                        <td><p class="SzovegJobbra">Bitráta (Kbit/s)</p></td>
                                        <td><p class="SzovegJobbra">Fájlméret</p></td>
                                        <td></td>
                                    </tr>';
                                foreach ($output as $line) {
                                    $FormatCode = exec('echo "' . $line . '" | elsoszamok');
                                    echo '<tr>';
                                    exec('VideoInfo1 "' . $line . '"', $output4);
                                    echo '<td><p>' . $FormatCode . '</p></td>';                        // formatcode
                                    echo '<td><p class="SzovegJobbra">' . $output4[0] . '</p></td>';    // felbontas
                                    echo '<td><p>' . $output4[1] . '</p></td>';                        // FPS
                                    echo '<td><p>' . $output4[2] . '</p></td>';                        // container
                                    echo '<td><p>' . $output4[3] . '</p></td>';                        // codec
                                    echo '<td><p>' . $output4[4] . '</p></td>';                        // media tipus
                                    echo '<td><p class="SzovegJobbra">' . $output4[5] . '</p></td>';   // bitráta
                                    echo '<td><p class="SzovegJobbra">' . $output4[6] . '</p></td>';    // fajlmeret

                                    echo '
                                        <td class="LetoltoGombHelyek">
                                            <button class="Gombok KekHatter PiciGombok" name="submit" type="submit" id="' . $FormatCode . '" value="' . $FormatCode . '" >Letöltés</button>
                                        </td></tr>';
                                    unset($output4);
                                }
                                echo '</table>';

                                echo '<input type="text" value="" name="CustomFormat" placeholder="saját formátum ( pl: 343+120 )" /><button name="submit" type="submit" value="CustomFormatLetoltes">Letöltés</button>';
                            } else {
                                // HAMRADIK LEPES: letoltes
                                $token = exec('youtube-dl "' .  $_SESSION['link'] . '" --get-title --restrict-filenames | nevatalakito');

                                if( strlen( $_POST['CustomFormat'] ) > 0 and $_POST['submit'] == "CustomFormatLetoltes" ) {
                                    changeUtasitas("Töltsd le a videót (custom format)");
                                    $letoltendoFormat = $_POST['CustomFormat'];
                                    $kiterjesztes = exec('extensionkereso "' . exec('varazslas "' . session_id() . '" | grep ' . exec('echo "' . $_POST['CustomFormat'] . '" | elsoszamok' )) . '"');
                                } else {
                                    changeUtasitas("Töltsd le a videót");
                                    $letoltendoFormat = $_POST['submit'];
                                    $kiterjesztes = exec('extensionkereso "' . exec('varazslas "' . session_id() . '" | grep ' . $_POST['submit'] ) . '"');
                                }

                                exec('youtube-dl "' . $_SESSION['link'] . '" -f ' . $letoltendoFormat . ' --external-downloader aria2c --external-downloader-args "-x 16 -s 16 -k 1M" -o "' . session_id() . '"', $output3);
                                if( $_POST['submit'] == "bestaudio" ) {
                                    changeUtasitas("Töltsd le a hangfájlt");
                                    exec('ls | grep "' . session_id() . '"', $output5);
                                    echo( exec('mv ' . $output5[0] . ' "kesz/' . session_id() . '"' ) . '<br>');
                                    exec('ffmpeg -i "kesz/' . session_id() . '" -c:a libmp3lame -ac 2 -b:a 320k audio.mp3 > audiolog.txt');
                                    exec('rm "' . $output5[0] . '"');
                                    $kiterjesztes = "mp3";
                                    exec('mv "audio.mp3" "kesz/' . $token . '.' . $kiterjesztes . '"');
                                } else {
                                    exec('ls | grep "' . session_id() . '"', $output5);
                                    echo( exec('mv ' . $output5[0] . ' "kesz/' . $token . '.' . $kiterjesztes . '"' ) . '<br>');
                                }

                                echo('<a href="/ytdownloader/kesz/' . $token . '.' . $kiterjesztes . '" download ><button type="button" class="Gombok ReteknagyGombok KekHatter">Letöltés</button></a><br>');
                                echo('<a href="/ytdownloader/kesz/' . $token . '.' . $kiterjesztes . '"  ><button type="button" class="Gombok ReteknagyGombok ZoldHatter">Lejátszás</button></a><br>');
                                if( $_POST['submit'] == "bestaudio" ) {
                                    echo('<audio controls>
                                        <source src="/ytdownloader/kesz/' . $token . '.' . $kiterjesztes . '" type="audio/mpeg">
                                    </audio>');
                                } else {
                                    echo '<video controls poster="' . $_SESSION['ThumbnailLink'] . '" preload="none">';
                                    echo '<source src="/ytdownloader/kesz/' . $token . '.' . $kiterjesztes . '" type="video/' . $kiterjesztes . '" >';
                                    // <source src="movie.mp4" type="video/mp4">
                                    echo '</video>';
                                }
                            }
                        }
                        debugAll();
                    ?>

                </form>
            </center>
        </div>
    </body>
</html>
