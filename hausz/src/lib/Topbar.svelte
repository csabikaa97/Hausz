<script lang="ts">
    import Linkgomb from "./Linkgomb.svelte";
    import ListaLinkgomb from "./ListaLinkgomb.svelte";
    import { közös_admin, közös_loggedin, közös_username } from "./BeleptetoRendszer";
    import { browser } from "$app/environment";

    let loggedin = false;
    let username = "";
    let admin = false;
    közös_loggedin.subscribe((uj_ertek) => { loggedin = uj_ertek; })
    közös_username.subscribe((uj_ertek) => { username = uj_ertek; })
    közös_admin.subscribe((uj_ertek) => { admin = uj_ertek; })

    if(browser) {
        document.onclick = (event) => {
            let menure_kattintott = false;
            event.composedPath().forEach(element => {
                let id = (<HTMLElement>element).id;
                if( id === "menu_div" || id === "menu_div_gomb" ) {
                    menure_kattintott = true;
                }
            });
    
            if(!menure_kattintott && topbar_lista_aktivalva) {
                topbar_lista_aktivalva = false;
            }
        }

        document.head.innerHTML += '<meta name="theme-color" media="(prefers-color-scheme: light)" content="rgb(245,245,245)">';
        document.head.innerHTML += '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="rgb(30,30,30)">';
    }

    let topbar_lista_aktivalva = false;
    let fiok_panel_aktivalva = false;
</script>

<div class="szint-1 zindex-1" style="position: fixed; top: 0; left: 0; width: 100%; padding: 10px;">
    <div class="mobilon-tiltas kozepre fit-content">
        <Linkgomb link="/" felirat="Főoldal" />
        <Linkgomb link="/hauszkft/" felirat="Hausz Kft ismertető" />
        <Linkgomb link="/webjosda/" felirat="WebJósda" />
        <Linkgomb link="/teamspeak/" felirat="TeamSpeak" />
        <Linkgomb link="/megoszto/" felirat="Megosztó" />
        <Linkgomb link="/minecraft/" felirat="Minecraft" />
    </div>
    <button id="menu_div_gomb" class="nagy-kepernyon-tiltas szint-2 gomb kerekites-15 topbar_menu fit-content" on:click={e => {topbar_lista_aktivalva = !topbar_lista_aktivalva}}>
        <img alt="hausz_logo" src="/favicon.png" width="16px"/> Hausz oldalak
    </button>
    <button class="nagy-kepernyon-tiltas szint-2 gomb kerekites-15 topbar_menu fit-content" style="float: right; margin-right: 20px" on:click={e => {fiok_panel_aktivalva = !fiok_panel_aktivalva}}>
        {#if loggedin}
            Fiók
        {:else}
            Belépés
        {/if}
    </button>
</div>
{#if topbar_lista_aktivalva}
    <div id="menu_div" class="szint-1 zindex-2 kerekites-15" style="top: 15px; left: 15px; max-height: 317px; overflow: hidden; padding: 5px; position: fixed">
        <ListaLinkgomb link="/" felirat="Főoldal" />
        <ListaLinkgomb link="/hauszkft/" felirat="Hausz Kft ismertető" />
        <ListaLinkgomb link="/webjosda/" felirat="WebJósda" />
        <ListaLinkgomb link="/teamspeak/" felirat="TeamSpeak" />
        <ListaLinkgomb link="/megoszto/" felirat="Megosztó" />
        <ListaLinkgomb link="/minecraft/" felirat="Minecraft" />
    </div>
{/if}