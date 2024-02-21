<script lang="ts">
    import { belepes, statusz_lekerese } from "./BeleptetoRendszer";
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

<div style="background-color: cyan">
    {#if loggedin}
        Belépve mint: {username}
        {#if admin}
            <button on:click={e => {location.href="/admin/admin.html"}}>Admin felület</button>
        {/if}
    {:else}
        <input type="text" bind:value={bemenet_felhasználónév} placeholder="Felhasználónév">
        <input type="password" bind:value={bemenet_jelszó} placeholder="Jelszó">
        <button on:click={e => {belepes(bemenet_felhasználónév, bemenet_jelszó)}}>Belépés</button>
    {/if}
</div>