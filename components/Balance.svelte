<script lang="ts">
  import { AuthStore } from '../auth-store';
  import spinner from "../images/loading.gif";

  export let authStore: AuthStore;
</script>

<div
  class="flex items-center justify-center font-mono italic -ml-0.5 -mt-0.5 text-xl bg-white dark:bg-black border-black dark:border-white dark:text-white border-2  py-1 "
>
  <div class="">balance:&nbsp;</div>
  {#if $authStore.isLoading}
    <img class="h-6" src={spinner} alt="loading animation" />
  {:else}
    {$authStore.balance.toFixed(2)} ICP
  {/if}
</div>
