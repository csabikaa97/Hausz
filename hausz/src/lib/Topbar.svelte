<script lang="ts">
    import Linkgomb from "./Linkgomb.svelte";
    import ListaLinkgomb from "./ListaLinkgomb.svelte";
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
    <div class="nagy-kepernyon-tiltas inline-block szint-2 gomb kerekites-15 topbar_menu fit-content"><img src="/index/favicon.png" width="16px" /> Hausz oldalak</div>
    <div class="nagy-kepernyon-tiltas mobilon-inline nodisplay szint-2 gomb kerekites-15 topbar_menu fit-content" style="float: right; margin-right: 20px" onclick='topbar_fiok_gomb_kattintas()'>Belépés</div>
    <div class="nagy-kepernyon-tiltas mobilon-inline nodisplay szint-2 gomb kerekites-15 topbar_menu fit-content" style="float: right; margin-right: 20px" onclick='topbar_fiok_gomb_kattintas()'></div>
</div>
<div class="lathatatlan szint-1 zindex-2 kerekites-15" style="top: 15px; left: 15px; max-height: 317px; overflow: hidden; padding: 5px; position: fixed">
    <ListaLinkgomb link="/" felirat="Főoldal" />
    <ListaLinkgomb link="/hauszkft/" felirat="Hausz Kft ismertető" />
    <ListaLinkgomb link="/webjosda/" felirat="WebJósda" />
    <ListaLinkgomb link="/teamspeak/" felirat="TeamSpeak" />
    <ListaLinkgomb link="/megoszto/" felirat="Megosztó" />
    <ListaLinkgomb link="/minecraft/" felirat="Minecraft" />
</div>
<div style="height: 52px; width: 100%; display: block"></div>