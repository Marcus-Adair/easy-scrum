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

    function getDefaultCategoryState(): Record<string, boolean> {
        const state: Record<string, boolean> = {};
        // If no category selected and we have categories, select the first one
        const selectedId = noteCategoryId ?? noteCategories[0]?.id;
        for (const cat of noteCategories) {
            state[cat.id] = cat.id === selectedId;
        }
        return state;
    }

    let categoryChosenState = $state<Record<string, boolean>>(getDefaultCategoryState());
    $effect(() => {
        if (dialogOpen) {
            // Auto-select first category if none selected
            if (!noteCategoryId && noteCategories.length > 0) {
                noteCategoryId = noteCategories[0].id;
            }
            categoryChosenState = getDefaultCategoryState();
        }
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
        {#if noteCategories.length}
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
        {:else}
            <span class="text-sm text-muted-foreground">Create at least 1 Note Category first!</span>
        {/if}
    </div>
</div>