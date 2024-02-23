<script lang="ts">
    import { belepes, kilepes, statusz_lekerese } from "./BeleptetoRendszer";
    import { közös_admin, közös_loggedin, közös_username } from "./BeleptetoRendszer";

    let loggedin = false;
    let username = "";
    let admin = false;
    közös_loggedin.subscribe((uj_ertek) => { loggedin = uj_ertek; })
    közös_username.subscribe((uj_ertek) => { username = uj_ertek; })
    közös_admin.subscribe((uj_ertek) => { admin = uj_ertek; })

    let bemenet_felhasználónév: string;
    let bemenet_jelszó: string;

    statusz_lekerese();
</script>

<div class="szint-1 zindex-1 mobilon-lathatatlan padding-10 kerekites-15" style="position: fixed; bottom: 5px; right: 5px">
    {#if loggedin}
        Belépve mint: {username}<br>
        {#if admin}
            <button on:click={e => {location.href="/admin/admin.html"}}>Admin felület</button><br>
        {/if}
        <button on:click={e => {kilepes()}}>Kilépés</button><br>
    {:else}
        <form on:submit={e => { e.preventDefault(); belepes(bemenet_felhasználónév, bemenet_jelszó); }}>
            <input type="text" bind:value={bemenet_felhasználónév} placeholder="Felhasználónév"><br>
            <input type="password" bind:value={bemenet_jelszó} placeholder="Jelszó"><br>
            <input type="button" on:click={e => { e.preventDefault(); belepes(bemenet_felhasználónév, bemenet_jelszó); }} value="Belépés"/><br>
        </form>
    {/if}
</div>