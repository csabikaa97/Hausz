<script lang="ts">
    let valami = 0;
</script>

<h1>megosztó</h1>

<button on:click={e => {valami += 1}}>Ennyiszer nyomtál meg: {valami}</button>