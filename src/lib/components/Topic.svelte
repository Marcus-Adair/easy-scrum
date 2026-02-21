<script lang="ts">
	import type { ColorOption, NoteCategory, Topic } from "$lib/types";
	import { ChevronsLeft, ChevronsRight, Pencil, Plus, Trash2, Palette } from "@lucide/svelte";
	import { Button, buttonVariants } from "./ui/button";
	import Note from "./Note.svelte";
	import { Dialog, DialogFooter, DialogTitle, DialogClose, DialogContent, DialogTrigger } from "$lib/components/ui/dialog";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { updateTopicName, updateTopicColor, deleteTopicById } from "$lib/remote-functions/topic.remote";
	import { createNewNote } from "$lib/remote-functions/note.remote";
	import { toast } from "svelte-sonner";
	import { invalidateAll } from "$app/navigation";
	import { Textarea } from "./ui/textarea";
	import { colorBgMap } from "$lib/consts";
	import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "./ui/alert-dialog";
	import TopicColorSwitches from "./TopicColorSwitches.svelte";
	import NoteCategorySwitches from "./NoteCategorySwitches.svelte";

    interface Props {
        topic: Topic
        topicsLength: number;
        noteCategories: NoteCategory[];
    }
    let { topic, topicsLength, noteCategories }: Props = $props();


 
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
</script>

<!--     style={`background-color: ${topic.color},`}              -->

<div class={["flex flex-col rounded-md border border-border min-w-[360px] max-w-[360px] min-h-[250px]", colorBgMap[topic.color]]}>
    <div
        class="flex items-center justify-between px-1 py-1"
        onmouseenter={() => isHoveringTitle = true}
        onmouseleave={() => isHoveringTitle = false}
        role="banner"
    >

        <!-- Move Left -->
        {#if topic.rowIdx !== 0}
            <Button size="icon-sm" variant="ghost" title="Shift Left" class={["transition-opacity duration-200", showBannerButtons ? "opacity-100" : "opacity-0"]}>
                <ChevronsLeft/>
            </Button>
        {:else}
            <div></div>
        {/if}

        <span class="text-lg font-bold">
            {topic.topicName}
        </span>
     
        <!-- Move Right -->
        {#if topic.rowIdx !== topicsLength - 1}
            <Button size="icon-sm" variant="ghost" title="Shift Right" class={["transition-opacity duration-200", showBannerButtons ? "opacity-100" : "opacity-0"]}>
                <ChevronsRight/>
            </Button>
        {:else}
            <div></div>
        {/if}
    </div>
    <div class="h-px w-full bg-border"></div>

    <div class="flex gap-1 mx-4 mt-2 justify-center">
        <Dialog bind:open={isEditNameOpen}>
            <DialogTrigger
                class={[buttonVariants({ variant: "outline", size: "sm" })]}
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
                class={[buttonVariants({ variant: "outline", size: "sm" })]}
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
                class={[buttonVariants({ variant: "outline", size: "sm" })]}
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
                class={[buttonVariants({ variant: "outline", size: "sm" })]}
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

    <div class="flex flex-col gap-2 px-4 py-2">
        {#if topic.notes.length}
            {#each topic.notes as note}
                <Note {note} {noteCategories}/>
            {/each}
        {:else}
            <div class="flex flex-col gap-1 px-4 mt-4">
                <span class="text-center">No Notes</span>
                <span class="text-center text-sm text-muted-foreground">Post a Note</span>
            </div>
        {/if}
    </div>
</div>