<script lang="ts">
    import { jelenleg_lathato, jelenlegi_valasz } from "./Uzenet";

    let jelenleg_lathato_helyi: boolean;
    let jelenlegi_valasz_helyi: string;
    jelenleg_lathato.subscribe((uj_ertek) => { jelenleg_lathato_helyi = uj_ertek; })
    jelenlegi_valasz.subscribe((uj_ertek) => { jelenlegi_valasz_helyi = uj_ertek; })
</script>

<div id="valasz_uzenet" class={(jelenleg_lathato_helyi ? "" : "nodisplay ") + "fit-content kerekites-10"} style="z-index: 2; bottom: 5px; left: 5px; max-width: 300px; position: fixed; padding: 10px; text-shadow: 1px 1px rgb(70,70,70), -1px -1px rgb(70,70,70), 1px -1px rgb(70,70,70), -1px 1px rgb(70,70,70)">
    <p style="color: rgb(240,240,240)">{jelenlegi_valasz_helyi}</p>
</div>