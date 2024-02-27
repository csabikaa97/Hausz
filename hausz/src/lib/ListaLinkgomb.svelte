<script lang="ts">
    export let felirat: string;
    export let link: string;
</script>

<button class="gomb kerekites-10 margin-10 block szint-2" on:click={() => {location.href = link}}>{felirat}</button>