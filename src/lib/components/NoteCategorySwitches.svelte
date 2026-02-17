<script lang="ts">
	import { switchColorBgMap } from "$lib/consts";
	import type { NoteCategory } from "$lib/types";
	import { upperCaseFirstLetter } from "$lib/utils";
	import { Label } from "./ui/label";
	import { Switch } from "./ui/switch";

    interface Props {
        noteCategories: NoteCategory[],
        noteCategoryId?: string,
        dialogOpen: boolean
    }
    let { noteCategories, noteCategoryId = $bindable(), dialogOpen}: Props = $props();

    const defaultCategoryState: Record<string, boolean> = {};
    // svelte-ignore state_referenced_locally
    for (const cat of noteCategories) {
        defaultCategoryState[cat.id] = noteCategoryId === cat.id
    }
    let categoryChosenState = $state<Record<string, boolean>>(defaultCategoryState);
    $effect(() => {
        if (dialogOpen) categoryChosenState = defaultCategoryState
    })
    function setCategoryState(id: string) {
        if (!categoryChosenState[id]) {
            for (const option of noteCategories) {
                if (option.id !== id) categoryChosenState[option.id] = false;
            }
            noteCategoryId = id;
                                                        
        } else {
            noteCategoryId = undefined
        }
    }
</script>

<div class="flex flex-col gap-2">
    <Label for="note-category">Note Category:</Label>
    <div class="flex gap-4 flex-wrap" id="note-category">
        {#each noteCategories as noteCategory}
            <div class="flex gap-2">
                <Label>{upperCaseFirstLetter(noteCategory.categoryName)}:</Label>
                <Switch
                    bind:checked={categoryChosenState[noteCategory.id]}
                    id={`${noteCategory.id}-switch`}
                    class={switchColorBgMap[noteCategory.color]}
                    onclick={() => setCategoryState(noteCategory.id)}
                />
            </div>
        {/each}
    </div>
</div>