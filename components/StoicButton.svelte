<script lang="ts">
  import { AuthStore } from '../auth-store';

  import Button from "./Button.svelte";
  import spinner from "../images/loading.gif";

  export let authStore: AuthStore;
  export let loading;
  export let toggleModal;

  async function connect() {
    loading = "stoic";
    await authStore.stoicConnect();
    loading = "";
    toggleModal();
  }
</script>

<Button
  on:click={connect}
  disabled={loading}
  style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}
>
  {#if loading === "stoic"}
    <img class="h-6 block h-" src={spinner} alt="loading animation" />
  {:else}
    stoic
  {/if}
</Button>
