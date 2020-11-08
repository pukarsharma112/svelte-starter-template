<script lang="ts">
  export let name: string;
</script>

<h1>Hello, {name}!</h1>

<style>
  :global(body) {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    background: #f0f0f0;
  }
  h1 {
    color: dodgerBlue;
  }
</style>
