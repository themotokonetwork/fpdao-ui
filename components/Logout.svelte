<script lang="ts">
  import { AuthStore } from '../auth-store';

  export let authStore: AuthStore;

  async function logout() {
    await authStore.disconnect();
  }
</script>

<button
  on:click={logout}
  class="hover:shadow dark:hover:shadow-white flex-1 lg:flex-none font-mono -ml-0.5 text-xl lg:text-base 2xl:text-xl bg-white dark:bg-black border-black dark:border-white dark:text-white border-2 rounded-t-3xl lg:rounded-t-none lg:rounded-b-[37px] lg:min-w-[300px]"
  >log out</button
>
