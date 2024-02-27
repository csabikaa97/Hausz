<script lang="ts">
    import BeleptetoRendszer from "$lib/BeleptetoRendszer.svelte";
    import Uzenet from "$lib/Uzenet.svelte";
    import { ujitas_lista } from "$lib/Konstansok";
    import Topbar from "$lib/Topbar.svelte";
</script>

<div style="height: 25vh"></div>

<Topbar />
<BeleptetoRendszer />
<Uzenet />

<div>
    <div>
        <div class="kozepre">
            <img style="max-width: 500px" id="hausz_logo" class="kozepre max-szelesseg" src="/index/hausz.svg" alt="Hausz logo">
            <br>
            <form class="kozepre" method="get" name="searchform" action="https://www.google.com/search">
                <input class="kozepre szint-2 gomb no-border kerekites-15 padding-15" style="max-width: 500px; width:90%" autocomplete="off" name="q" placeholder="Mit szeretnél megtalálni?" required type="text">
                <br>
                <div class="fit-content kozepre">
                    <button class="szint-2 gomb kerekites-15 no-border merettol-fuggoen-inline-block kozepre padding-10" style="margin-top: 5px; margin-bottom: 5px" type="submit">Keresés</button>
                    <button class="szint-2 gomb kerekites-15 no-border merettol-fuggoen-inline-block kozepre padding-10" style="margin-top: 5px; margin-bottom: 5px" on:click={e=>{alert('Az jó he!')}}>Jó napom van!</button>
                </div>
            </form>
            <br><br><br><br><br><br><br><br><br><br>
            <div id="ujitasok_doboz" class="szint-1 mobilon-tiltas kozepre kerekites-15" style="padding-top: 1px; max-width: 45%">
                <h3 class="kozepre-szoveg">Újítások a Hauszon</h3>
                <ul id="ujitasok">
                    {#each ujitas_lista as ujitas_elem}
                        <p class="tab-1">{Object.keys(ujitas_elem)[0]}</p>
                        {#each Object.values(ujitas_elem)[0] as ujitas}
                            <p class="tab-2">{ujitas}</p>
                        {/each}
                    {/each}
                </ul>
            </div>
            <br><br><br><br><br><br><br><br>
        </div>
    </div>
</div>