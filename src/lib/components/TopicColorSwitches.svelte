<script lang="ts">
	import { colorOptions, switchColorBgMap } from "$lib/consts";
	import type { ColorOption } from "$lib/types";
	import { upperCaseFirstLetter } from "$lib/utils";
	import type { Snippet } from "svelte";
	import { Label } from "./ui/label";
	import { Switch } from "./ui/switch";

    interface Props {
        topicColor?: ColorOption,
        dialogOpen: boolean
    }
    let { topicColor = $bindable(), dialogOpen}: Props = $props();

    const defaultColorChosenState = {
        pink: true,
        yellow: false,
        orange: false,
        salmon: false,
        blue: false
    };
    let colorChosenState = $state<Record<ColorOption, boolean>>(defaultColorChosenState);
    $effect(() => {
        if (dialogOpen) colorChosenState = defaultColorChosenState
    })
    function setColorState(color: ColorOption) {
        if (!colorChosenState[color]) {
            for (const option of colorOptions) {
                if (option !== color) colorChosenState[option] = false;
            }
            topicColor = color;
                                                        
        } else {
            topicColor = undefined
        }
    }
</script>

<div class="flex flex-col gap-2">
    <Label for="topic-color">Topic Color:</Label>
    <div class="flex gap-5 flex-wrap" id="topic-color">
        {#each colorOptions as color}
            <div class="flex flex-col gap-1">
                <Label>{upperCaseFirstLetter(color)}:</Label>
                <Switch
                    bind:checked={colorChosenState[color]}
                    id={`${color}-switch`}
                    class={switchColorBgMap[color]}
                    onclick={() => setColorState(color)}
                />
            </div>
        {/each}
    </div>
</div>