<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="flex flex-col items-center mt-18">
	<h1 class="text-4xl font-bold">{page.status}</h1>
	<p class="text-lg text-muted-foreground">{page.error?.message}</p>
	<Button href="/" title="Go Home" class="mt-6">Go Home</Button>
</div>
