<script lang="ts">
    import BeleptetoRendszer from "$lib/BeleptetoRendszer.svelte";
    import Topbar from "$lib/Topbar.svelte";

    import { közös_admin, közös_loggedin, közös_username, közös_statusz_lekerve } from "$lib/BeleptetoRendszer";
    import { domain } from "$lib/Konstansok";
    import type { Uzenet } from "$lib/Tipusok";
    import { szinkron_keres, masolas } from "$lib/alap_fuggvenyek";

    let loggedin = false;
    let username = "";
    let admin = false;
    közös_loggedin.subscribe((uj_ertek) => { loggedin = uj_ertek; })
    közös_username.subscribe((uj_ertek) => { username = uj_ertek; })
    közös_admin.subscribe((uj_ertek) => { admin = uj_ertek; })
    közös_statusz_lekerve.subscribe((uj_ertek) => {
        if(uj_ertek) {
            felhasznalok_frissitese();
            token_informaciok_frissitese();
            szerver_statusz_frissitese();
        }
    })

    let van_token = false;
    let token: string = "";
    let jogosult_tokenre = false;
    let van_online_felhasznalo = false;
    let online_felhasznalok_lista: Array<{felhasznalonev: string}> = [];
    let szerver_statusz_szoveg = "";

    function uj_token_igenylese() {
        szinkron_keres("/teamspeak/teamspeak.🦀?uj_token_igenylese", "", (uzenet: Uzenet<string>) => {
            if( uzenet.eredmeny == 'ok' ) {
                token_informaciok_frissitese();
            }
        });
    }

    function token_informaciok_frissitese() {
        szinkron_keres("/teamspeak/teamspeak.🦀?token_informacio", "", (uzenet: Uzenet<{token: string, jogosult_uj_token_keresere: string} | string>) => {
            if( typeof uzenet.valasz !== "string" ) {
                van_token = true;
                token = uzenet.valasz.token;
                jogosult_tokenre = uzenet.valasz.jogosult_uj_token_keresere === "igen";
            } else {
                if( uzenet.valasz == 'Jelenleg nincs jogosultsági tokened.' ) {
                    van_token = false;
                }
            }
        });
    }

    function felhasznalok_frissitese() {
        szinkron_keres("/teamspeak/teamspeak.🦀?felhasznalok", "", (uzenet: Uzenet<{felhasznalok: [{felhasznalonev: string}] | number} | string>) => {
            if( typeof uzenet.valasz !== "string" ) {
                if( typeof uzenet.valasz.felhasznalok === "number") {
                    if( uzenet.valasz.felhasznalok == 0 ) {
                        van_online_felhasznalo = false;
                        return;
                    }
                } else {
                    online_felhasznalok_lista = uzenet.valasz.felhasznalok;
                }
            }
        });
    }

    function szerver_statusz_frissitese() {
        szinkron_keres("/teamspeak/teamspeak.🦀?szerver_statusz", "", (uzenet: {
            eredmeny: string,
            processzor_1perc: number,
            processzor_5perc: number,
            processzor_15perc: number,
            folyamat_ok: boolean,
            telnet_ok: boolean,
            memoria_hasznalat: number,
            swap_hasznalat: number,
            lemez_hasznalat: number
        }) => {
            if(uzenet.eredmeny != 'ok') {
                return;
            }

            let buffer = "";

            const processzor_hasznalat_figyelmeztetes = 0.75;
            const memoria_hasznalat_elfogadhato = 0.75;
            const memoria_hasznalat_figyelmezetetes = 0.85;
            const memoria_hasznalat_kritikus = 0.95;
            const swap_hasznalat_elfogadhato = 0.65;
            const swap_hasznalat_figyelmezetetes = 0.75;
            const swap_hasznalat_kritikus = 0.85;
            const lemez_hasznalat_elfogadhato = 0.75;
            const lemez_hasznalat_figyelmeztetes = 0.85;
            const lemez_hasznalat_kritikus = 0.95;

            if( uzenet.folyamat_ok
                && uzenet.telnet_ok
                && uzenet.processzor_1perc < processzor_hasznalat_figyelmeztetes
                && uzenet.processzor_5perc < processzor_hasznalat_figyelmeztetes
                && uzenet.processzor_15perc < processzor_hasznalat_figyelmeztetes
                && uzenet.memoria_hasznalat < memoria_hasznalat_elfogadhato
                && uzenet.swap_hasznalat < swap_hasznalat_elfogadhato
                && uzenet.lemez_hasznalat < lemez_hasznalat_elfogadhato ) {

                buffer += '<p>A szerver állapota jelenleg kifogástalan 🥳</p>';
            } else {
                if( uzenet.folyamat_ok ) { buffer += '<p>🟩 TeamSpeak szerver folyamat fut</p>'; }
                else { buffer += '<p>🟥 TeamSpeak szerver folyamat nem fut</p>'; }

                if( !uzenet.telnet_ok ) { buffer += '<p>🟥 Serverquery nem elérhető</p>'; } 
                else { buffer += '<p>🟩 Serverquery elérhető</p>'; }

                if( uzenet.processzor_15perc >= processzor_hasznalat_figyelmeztetes ) {
                    if( uzenet.processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                        buffer += '<p>🟥 Processzor terhelés - magas körülbelül 15 perce</p>';
                    } else {
                        if( uzenet.processzor_5perc < processzor_hasznalat_figyelmeztetes ) {
                            buffer += '<p>🟨 Processzor terhelés - magas volt körülbelül 15 perce, de már lecsökkent</p>';
                        } else {
                            buffer += '<p>🟧 Processzor terhelés - magas volt körülbelül 5 perce, de már kezd lecsökkenni</p>';
                        }
                    }
                } else {
                    if( uzenet.processzor_5perc >= processzor_hasznalat_figyelmeztetes ) {
                        if( uzenet.processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                            buffer += '<p>🟧 Processzor terhelés - magas körülbelül 5 perce</p>';
                        } else {
                            buffer += '<p>🟨 Processzor terhelés - magas volt körülbelül 5 perce, de most alacsony</p>';
                        }
                    } else {
                        if( uzenet.processzor_1perc >= processzor_hasznalat_figyelmeztetes ) {
                            buffer += '<p>🟨 Processzor terhelés - elfogadható</p>';
                        } else {
                            buffer += '<p>🟩 Processzor terhelés - optimális</p>';
                        }
                    }
                }

                if( uzenet.memoria_hasznalat >= memoria_hasznalat_kritikus) {
                    buffer += '<p>🟥 Memória használat - nagyon magas</p>';
                } else {
                    if( uzenet.memoria_hasznalat >= memoria_hasznalat_figyelmezetetes) {
                        buffer += '<p>🟧 Memória használat - magas</p>';
                    } else {
                        if( uzenet.memoria_hasznalat >= memoria_hasznalat_elfogadhato) {
                            buffer += '<p>🟨 Memória használat - elfogadható</p>';
                        } else {
                            buffer += '<p>🟩 Memória használat - optimális</p>';
                        }
                    }
                }

                if( uzenet.swap_hasznalat >= swap_hasznalat_elfogadhato) {
                    buffer += '<p>🟥 Virtuális memória használat - nagyon magas</p>';
                } else {
                    if( uzenet.swap_hasznalat >= swap_hasznalat_figyelmezetetes) {
                        buffer += '<p>🟧 Virtuális memória használat - magas</p>';
                    } else {
                        if( uzenet.swap_hasznalat >= swap_hasznalat_elfogadhato) {
                            buffer += '<p>🟨 Virtuális memória használat - elfogadható</p>';
                        } else {
                            buffer += '<p>🟩 Virtuális memória használat - optimális</p>';
                        }
                    }
                }

                if( uzenet.lemez_hasznalat >= lemez_hasznalat_kritikus) {
                    buffer += '<p>🟥 Lemezterület kihasználtság - nagyon magas</p>';
                } else {
                    if( uzenet.lemez_hasznalat >= lemez_hasznalat_figyelmeztetes) {
                        buffer += '<p>🟧 Lemezterület kihasználtság - magas</p>';
                    } else {
                        if( uzenet.lemez_hasznalat >= lemez_hasznalat_elfogadhato) {
                            buffer += '<p>🟨 Lemezterület kihasználtság - elfogadható</p>';
                        } else {
                            buffer += '<p>🟩 Lemezterület kihasználtság - optimális</p>';
                        }
                    }
                }
            }

            szerver_statusz_szoveg = buffer;
        });
    }
</script>

<BeleptetoRendszer />
<Topbar />

<br><br><br>
<h1 class="kozepre-szoveg">Hausz keresztény TeamSpeak szerver</h1>
<div class="kozepre" style="max-width: 800px; width: 90%">
    <h2>Lépések a csatlakozáshoz</h2>
    <div class="tab-1">
        <h3>1. Töltsd le a TeamSpeak 3 kliens szoftvert, és telepítsd az eszközödre.</h3>
        <div class="tab-2">
            Windows: <button class="gomb szint-2 kerekites-15 inline" on:click={e => {window.open('https://www.teamspeak.com/en/downloads/')}}>TeamSpeak3-Client-win64-3.5.6.exe</button>
            <br><br>
            MacOS: <button class="gomb szint-2 kerekites-15  inline" on:click={e => {window.open('/megoszto/megoszto.🦀?letoltes&file_id=343')}}>TeamSpeak3-Client-macosx-3.5.7.dmg</button>
        </div>
        <h3>2. Kattints rá a következő gombra a csatlakozáshoz:</h3>
        <button class="tab-2 gomb szint-2 kerekites-15 inline" on:click={e => {location.href = `ts3server://${domain}/?port=9987&nickname=${username}`;}}>Csatlakozás a Hausz TS szerverhez</button>
        {#if loggedin}
            <div>
                <h3>3. Használd fel a jogosultsági tokened</h3>
                <div class="tab-2">
                    {#if van_token}
                        <div>
                            Jelenlegi jogosultsági tokened: <abbr class="linkDekoracioTiltas" title="Kattints a tokenre a másoláshoz"><button on:click={e => {masolas(e)}}>{token}</button></abbr>
                            <p>Windows:  Az ablak tetején Permissions > Use Privilege Key</p>
                            <p>MacOS:       Menü bar > Permissions > Use Privilege Key</p>
                            <p>A lehetőség kiválasztásakor felugró ablakba kell beillesztened a fenti tokent ami megadja számodra a "Szabad ember" jogosultsági szintet.</p>
                        </div>
                    {:else}
                        <div>
                            Jelenleg nincs jogosultsági tokened <button class="gomb szint-2 kerekites-15 inline" on:click={e => {uj_token_igenylese()}}>Új token igénylése</button>
                        </div>
                    {/if}
                    {#if jogosult_tokenre}
                        <div>
                            Jogosult vagy új token kérésére, mert a jelenlegi tokened több mint 5 napja készült: 
                            <br><br><button class="gomb szint-2 kerekites-15 inline" on:click={e => {uj_token_igenylese()}}>Új token igénylése</button>
                        </div>
                    {/if}
                </div>
            </div>
            <div>
                <h3>4. Korábbi fiókokból származó jogosultságok visszaállítása (opcionális)</h3>
                <button class="gomb szint-2 kerekites-15 inline tab-2" on:click={e => {location.href='/beallitasok'}}>Beállítások - Fiók varázsló</button>
            </div>
        {:else}
            <div>
                <h3>3. Lépj be jogosultság igényléséhez</h3>
                <div class="tab-2">
                    Ha nem rendelkezel Hausz fiókkal, akkor meg kell várnod hogy adjon jogosultságot valaki aki online van. Abban az esetben ha regisztrálsz magadnak fiókot a jobb alsó sarokban található gombbal, akkor a jogosultságot meg tudod adni magadnak, és az online felhasználók listáját is láthatod erről a weboldalról.
                </div>
            </div>
        {/if}
    </div>
    <br><br>
    
    {#if loggedin}
    <div>
        <div>
            {#if van_online_felhasznalo}
                <div>
                    <h2>Online felhasználók</h2>
                    <ul class="tab-2">
                        {#each online_felhasznalok_lista as felhasznalo}
                            <li>{felhasznalo.felhasznalonev}</li>
                        {/each}
                    </ul>
                </div>
            {:else}
                <div>
                    <h2>Online felhasználók</h2>
                    <p class="tab-2">Jelenleg senki nincs csatlakozva a szerverhez.</p>
                </div>
            {/if}
        </div>
    </div>
    <br><br>

    <div>
        <h2>Szerver státusz</h2>
        <div class="tab-2">
            {@html szerver_statusz_szoveg}
        </div>
    </div>
    {/if}
    <br><br><br><br><br>
</div>