<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { ModeWatcher, toggleMode, mode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import { Moon, Sun } from '@lucide/svelte'


	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Easy-Scrum</title>
</svelte:head>

<Toaster/>
<ModeWatcher />
<div class="flex flex-col min-h-screen">
	<header class="flex border-b border-border py-2 px-4 justify-between items-center">
		<a href="/" class="font-bold text-lg text-primary" title="Go Home">Easy-Scrum</a>

		<Button onclick={toggleMode} variant="outline" size="icon" title="Toggle Mode">
			{#if mode.current === "dark"}
				<Moon/>
			{:else}
				<Sun/>
			{/if}
		</Button>
	</header>

	<main class="flex justify-center flex-1">
		{@render children()}
	</main>

	<footer class="flex border-t border-border text-muted-foreground py-2.5 px-4 justify-between items-center">
		<a
			href="/"
			class="text-sm hover:underline hover:underline-offset-2 hover:text-primary cursor-pointer"
			title="Go Home"
		>
			Home
		</a>
		<span class="text-xs">
			Made with love ❤️ by
			<a 
				href="https://marcusadair.com/"
				class=" hover:underline hover:underline-offset-2 hover:text-primary cursor-pointer"
				title="Visit My Site"
				target="_blank"
			>
				Marcus Adair
			</a>
		</span>
	</footer>
</div>