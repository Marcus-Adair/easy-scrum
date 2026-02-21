<script lang="ts">
	import type { ColorOption, NoteCategory, Topic } from "$lib/types";
	import { ChevronsLeft, ChevronsRight, Pencil, Plus, Trash2, Palette } from "@lucide/svelte";
	import { Button, buttonVariants } from "./ui/button";
	import Note from "./Note.svelte";
	import { Dialog, DialogFooter, DialogTitle, DialogClose, DialogContent, DialogTrigger } from "$lib/components/ui/dialog";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { updateTopicName, updateTopicColor, deleteTopicById, shiftTopicRowIndices } from "$lib/remote-functions/topic.remote";
	import { createNewNote } from "$lib/remote-functions/note.remote";
	import { toast } from "svelte-sonner";
	import { invalidateAll } from "$app/navigation";
	import { Textarea } from "./ui/textarea";
	import { colorBgMap, colorBorderBgMap, colorBorderMap } from "$lib/consts";
	import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "./ui/alert-dialog";
	import TopicColorSwitches from "./TopicColorSwitches.svelte";
	import NoteCategorySwitches from "./NoteCategorySwitches.svelte";

    interface Props {
        topic: Topic
        allTopics: Topic[];
        noteCategories: NoteCategory[];
    }
    let { topic, allTopics, noteCategories }: Props = $props();
    let topicsLength = $derived(allTopics.length);


 
    // svelte-ignore state_referenced_locally
    let editTopicColor = $state<ColorOption>(topic.color);
    $inspect("edit topic color is:", editTopicColor)
    $effect(() => {
        editTopicColor = topic.color; 
    })
    let isEditColorOpen = $state(false);

    
    // 
    let newNoteTitle = $state<string | undefined>();
    let newNoteCategoryId = $state<string | undefined>();
    let newNote = $state<string | undefined>();
    let isNewNoteOpen = $state(false);
    $effect(() => {
        if (isNewNoteOpen) {
            newNoteTitle = undefined; 
            newNote = undefined; 
        }

    })

    //
    // 
    let editTopicName = $state('');
    $effect(() => {
        editTopicName = topic.topicName; // Update on load
    })
    let isEditNameOpen = $state(false);
    $effect(() => {
        if (isEditNameOpen) editTopicName = topic.topicName; // Input value starts fresh
    })

    async function saveTopicName() {
        if (!editTopicName.trim()) {
            toast.error("Name cannot be empty!");
            return;
        }

        try {
            await updateTopicName({ id: topic.id, topicName: editTopicName.trim() });
            isEditNameOpen = false;
            invalidateAll();
        } catch (e) {
            console.error("Failed to update topic name:", e);
            toast.error("Failed to update topic name");
        }
    }

    async function saveTopicColor() {
        if (!editTopicColor) {
            toast.error("Please select a color!");
            return;
        }

        try {
            await updateTopicColor({ id: topic.id, color: editTopicColor });
            isEditColorOpen = false;
            invalidateAll();
        } catch (e) {
            console.error("Failed to update topic color:", e);
            toast.error("Failed to update topic color");
        }
    }

    let isDeleteTopicOpen = $state(false);
    async function deleteTopic() {
        try {
            await deleteTopicById({ id: topic.id });
            isDeleteTopicOpen = false;
            invalidateAll();
            toast.success("Topic deleted");
        } catch (e) {
            console.error("Failed to delete topic:", e);
            toast.error("Failed to delete topic");
        }
    }

    async function postNote() {
        if (!newNoteTitle?.trim() || !newNote?.trim()) {
            toast.error("Title and note are required!");
            return;
        }
        if (!newNoteCategoryId) {
            toast.error("Please select a note category!");
            return;
        }

        try {
            await createNewNote({
                topicId: topic.id,
                header: newNoteTitle.trim(),
                notes: newNote.trim(),
                noteCategoryId: newNoteCategoryId,
                colIdx: topic.notes.length,
            });
            isNewNoteOpen = false;
            invalidateAll();
            toast.success("Note created");
        } catch (e) {
            console.error("Failed to create note:", e);
            toast.error("Failed to create note");
        }
    }

    let isHoveringTitle = $state(false);
    let showBannerButtons = $derived (isHoveringTitle || isEditNameOpen)

    async function shiftTopicsLeft() {
        // Circular shift left: each topic's index decreases by 1, first wraps to last
        const updates = allTopics.map(t => ({
            id: t.id,
            rowIdx: (t.rowIdx - 1 + topicsLength) % topicsLength
        }));
        try {
            await shiftTopicRowIndices({ updates });
            invalidateAll();
        } catch (e) {
            console.error("Failed to shift topics:", e);
            toast.error("Failed to shift topics");
        }
    }

    async function shiftTopicsRight() {
        // Circular shift right: each topic's index increases by 1, last wraps to first
        const updates = allTopics.map(t => ({
            id: t.id,
            rowIdx: (t.rowIdx + 1) % topicsLength
        }));
        try {
            await shiftTopicRowIndices({ updates });
            invalidateAll();
        } catch (e) {
            console.error("Failed to shift topics:", e);
            toast.error("Failed to shift topics");
        }
    }
</script>

     
<!-- colorBgMap[topic.color] -->
<div class={["flex flex-col rounded-md border-2 min-w-[360px] max-w-[360px] min-h-[250px] text-card-foreground", "bg-card", colorBorderMap[topic.color]]}>
    <div
        class={["flex items-center justify-between px-1 py-1", colorBgMap[topic.color]]}
        onmouseenter={() => isHoveringTitle = true}
        onmouseleave={() => isHoveringTitle = false}
        role="banner"
    >

        <!-- Move Left -->
        <Button size="icon-sm" variant="ghost" title="Shift Left" class={["transition-opacity duration-200", showBannerButtons ? "opacity-100" : "opacity-0"]} onclick={shiftTopicsLeft}>
            <ChevronsLeft/>
        </Button>

        <span class="text-lg font-bold text-center break-all px-1 max-w-[280px] text-pastel-foreground">
            {topic.topicName}
        </span>

        <!-- Move Right -->
        <Button size="icon-sm" variant="ghost" title="Shift Right" class={["transition-opacity duration-200", showBannerButtons ? "opacity-100" : "opacity-0"]} onclick={shiftTopicsRight}>
            <ChevronsRight/>
        </Button>
    </div>

    <div class={["h-[2px] w-full", colorBorderBgMap[topic.color]]}></div>

    <div class="flex gap-1 mx-4 mt-2 justify-center">
        <Dialog bind:open={isEditNameOpen}>
            <DialogTrigger
                class={[buttonVariants({ variant: "secondary", size: "sm" })]}
                title="Edit Name"
            >
                Name<Pencil class="size-3.5"/>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle>Edit Topic Name</DialogTitle>
                <div class="flex flex-col gap-2 mt-2">
                    <Label for="editTopicName">Topic Name:</Label>
                    <Input
                        bind:value={editTopicName}
                        name="editTopicName"
                        id="editTopicName"
                        placeholder="Name..."
                        required
                    />
                </div>
                <DialogFooter>
                    <DialogClose class={buttonVariants({ variant: "outline" })}>
                        Cancel
                    </DialogClose>
                    <Button onclick={saveTopicName} disabled={!editTopicName}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog bind:open={isEditColorOpen}>
            <DialogTrigger
                class={[buttonVariants({ variant: "secondary", size: "sm" })]}
                title="Edit Color"
            >
                Color<Palette/>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Edit Topic Color</DialogTitle>


                <TopicColorSwitches bind:topicColor={editTopicColor} dialogOpen={isEditColorOpen}/>
                
                <DialogFooter>
                    <DialogClose class={buttonVariants({ variant: "outline" })}>
                        Cancel
                    </DialogClose>
                    <Button onclick={saveTopicColor} disabled={!editTopicColor}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <AlertDialog bind:open={isDeleteTopicOpen}>
            <DialogTrigger
                class={[buttonVariants({ variant: "secondary", size: "sm" })]}
                title="Delete"
            >
                Delete<Trash2 class="text-destructive"/>
            </DialogTrigger>
            <AlertDialogContent>
                <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
                <span id="editTopicColor">Are you sure you want to delete this topic? This will delete all associated notes, comments, etc.</span>

                <AlertDialogFooter>
                    <DialogClose class={buttonVariants({ variant: "outline" })}>
                        Cancel
                    </DialogClose>
                    <Button onclick={deleteTopic}>Confirm</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog bind:open={isNewNoteOpen}>
            <DialogTrigger
                class={[buttonVariants({ variant: "secondary", size: "sm" })]}
                title="Post Note"
            >
                Post<Plus/>
            </DialogTrigger>
            <DialogContent class="gap-7">
                <DialogTitle>New Note</DialogTitle>
                <div class="flex flex-col gap-2 mt-2">
                    <Label for="newNoteTitle">Title:</Label>
                    <Input
                        bind:value={newNoteTitle}
                        name="newNoteTitle"
                        id="newNoteTitle"
                        required
                    />
                </div>

                <NoteCategorySwitches {noteCategories} bind:noteCategoryId={newNoteCategoryId} dialogOpen={isNewNoteOpen}/>

                <div class="flex flex-col gap-2">
                    <Label for="newNote">Note:</Label>
                    <Textarea
                        bind:value={newNote}
                        class="h-16"
                        name="newNote"
                        id="newNote"
                        placeholder="..."
                        required
                    />
                </div>
                <DialogFooter>
                    <DialogClose class={buttonVariants({ variant: "outline" })}>
                        Cancel
                    </DialogClose>
                    <Button onclick={postNote} disabled={!newNoteTitle || !newNote || !newNoteCategoryId}>Post Note</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>

    <div class="flex flex-col gap-4 px-4 py-4.5">
        {#if topic.notes.length}
            {#each topic.notes.sort((a, b) => a.colIdx - b.colIdx) as note}
                <Note {note} allNotes={topic.notes} {allTopics} {noteCategories}/>
            {/each}
        {:else}
            <div class="flex flex-col gap-1 px-4 mt-4">
                <span class="text-center text-card-foreground">No Notes</span>
                <span class="text-center text-sm text-muted-foreground">Post a Note</span>
            </div>
        {/if}
    </div>
</div>