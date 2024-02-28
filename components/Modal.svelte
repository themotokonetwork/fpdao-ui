<script lang="ts">
  import Card from "./Card.svelte";

  export let toggleModal;
  export let title;
  export let closable = true;
</script>

<div
  class="fixed flex justify-center items-center z-10 inset-0 bg-opacity-10 backdrop-blur-sm"
>
  <Card style="flex flex-col lg:w-1/2 w-full mx-2 pt-4 pb-6 px-4 max-h-[90vh] overflow-auto">
    <div class="flex flex-row justify-between dark:text-white">
      <p class="font-everett-medium text-3xl 2xl:text-4xl">{title}</p>
      <div
        class="close-button hover:shadow dark:hover:shadow-white cursor-pointer flex justify-center items-center font-mono text-lg rounded-full border-2 border-black dark:border-white  w-10 h-10"
        hidden={!closable}
        on:click={toggleModal}
      >
        x
      </div>
    </div>
    <div class="pt-10 pb-5 overflow-auto">
      <slot />
    </div>
  </Card>
</div>

<style>
  .close-button[hidden] {
    display: none !important;
  }
</style>
