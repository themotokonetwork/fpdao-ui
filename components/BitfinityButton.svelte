<script lang="ts">
  import { AuthStore } from '../auth-store';
  import spinner from "../images/loading.gif";
  import Button from "./Button.svelte";

  export let authStore: AuthStore;
  export let loading;
  export let toggleModal;

  async function connect() {
    loading = "bitfinity";
    await authStore.bitfinityConnect();
    loading = "";
    toggleModal();
  }
</script>

<Button
  on:click={connect}
  disabled={loading}
  style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}
>
  {#if loading === "bitfinity"}
    <img class="h-6 block" src={spinner} alt="loading animation" />
  {:else}
    bitfinity
  {/if}
</Button>
