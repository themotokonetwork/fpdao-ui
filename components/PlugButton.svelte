<script lang="ts">
  import { onMount } from "svelte";
  import { AuthStore } from '../auth-store';

  import spinner from "../images/loading.gif";
  import Button from "./Button.svelte";

  export let authStore: AuthStore;
  export let loading;
  export let toggleModal;

  onMount(async () => {
    const connected = await window.ic?.plug?.isConnected();
    if (connected) {
      console.log("plug connection detected");
      authStore.plugConnect();
    }
  });

  async function connect() {
    loading = "plug";
    await authStore.plugConnect();
    loading = "";
    toggleModal();
  }
</script>

<Button
  on:click={connect}
  disabled={loading}
  style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}
>
  {#if loading === "plug"}
    <img class="h-6 block" src={spinner} alt="loading animation" />
  {:else}
    plug
  {/if}
</Button>
