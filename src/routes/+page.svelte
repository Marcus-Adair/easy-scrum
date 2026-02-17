<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import Label from "$lib/components/ui/label/label.svelte";

    let newScrumName = $state<string | undefined>();

    // TODO: add progressive enhancement to do something if no name
</script>

<form method="POST" class="flex flex-col gap-8 py-5 pb-8 px-4 max-w-lg bg-card border border-border rounded-md mt-6 h-fit">
    <div class="flex flex-col gap-2.5 text-center">
        <h1 class="font-bold text-xl tracking-wide underline-offset-5 underline text-center">Welcome to Easy-Scrum!</h1>
        <p class="text-sm"><span class="font-bold underline underline-offset-2">About</span>: Easy-Scrum is a free tool for creating free, online scrum boards.</p>
        <p class="text-sm">Name your session, create it, and then share the link with others to track tasks, makes notes, and more!</p>
    </div>

    <div class="flex flex-col gap-2 mt-2">
        <Label for="newScrumName">New Scrum-Board Name:</Label>
        <Input
            bind:value={newScrumName}
            name="newScrumName"
            id="newScrumName"
            placeholder="Name..."
            required
        />
    </div>

    <div class="flex gap-3 items-center justify-center">
        <span class="text-lg font-bold">Ready?</span>
        <Button title="Create Scrum Board" type="submit" disabled={!newScrumName?.trim()}>
            Create Scrum Board
        </Button>
    </div>
</form>
