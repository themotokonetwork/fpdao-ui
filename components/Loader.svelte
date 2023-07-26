<script lang="ts">
  import spinner from "../images/loading.gif";

  export let loading = true;
</script>

{#if loading}
  <img class="h-6 block {$$props.class}" src={spinner} alt="loading animation" />
{/if}