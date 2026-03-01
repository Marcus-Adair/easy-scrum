<script lang="ts">
	import type { Note, NoteCategory, Topic } from "$lib/types";
    import { Dialog, DialogFooter, DialogTitle, DialogClose, DialogContent, DialogTrigger } from "$lib/components/ui/dialog";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button, buttonVariants } from "./ui/button";
	import { formatDate } from "$lib/utils";
	import { ChevronsDown, ChevronsUp, StickyNote, MessageSquarePlus, Pencil, Trash2, NotebookPen } from "@lucide/svelte";
	import { Textarea } from "./ui/textarea";
	import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "./ui/alert-dialog";
	import { Label } from "./ui/label";
	import { Input } from "./ui/input";
	import { toast } from "svelte-sonner";
	import { invalidateAll } from "$app/navigation";
	import { updateNoteHeader, updateNoteContent, deleteNoteById, updateNoteCategory, shiftNoteColIndices, moveNoteToTopic } from "$lib/remote-functions/note.remote";
	import { createNewComment } from "$lib/remote-functions/comment.remote";
	import NoteCategorySwitches from "./NoteCategorySwitches.svelte";
	import { ScrollArea } from "./ui/scroll-area";
	import { hoverColorBgMap, colorBgMap } from "$lib/consts"; // colorBorderMap, colorBorderBgMap
	import { Badge } from "./ui/badge";

    interface Props {
        note: Note;
        allNotes: Note[];
        allTopics: Topic[];
        noteCategories: NoteCategory[];
    }
    let { note, allNotes, allTopics, noteCategories }: Props = $props();
    let notesLength = $derived(allNotes.length);

    // Modal stuff
    let isNoteModalOpen = $state(false);
    let noteDiv: HTMLDivElement;
    let isHoveringNote = $state(false);
    function hoverNote() {
        isHoveringNote = true;
    }
    function stopHoverNote() {
        isHoveringNote = false;
    }
    let scaleNote = $derived (isHoveringNote || isNoteModalOpen )

    // Sticky note rotation based on colIdx
    const rotations = ['rotate-1', '-rotate-1', 'rotate-1'];
    let noteRotation = $derived(rotations[note.colIdx % rotations.length]);


    // Edit stuff
    let editHeaderDialogOpen = $state(false);
    let editNoteHeader = $state('');
    $effect(() => {
        editNoteHeader = note.header; // Update on load
    })
    let isEditNameOpen = $state(false);
    $effect(() => {
        if (isEditNameOpen) editNoteHeader = note.header; // Input value starts fresh
    })
    async function saveNoteHeader() {
        if (!editNoteHeader.trim()) {
            toast.error("Header cannot be empty!");
            return;
        }
        try {
            await updateNoteHeader({ id: note.id, header: editNoteHeader.trim() });
            isEditNameOpen = false;
            invalidateAll();
        } catch (e) {
            console.error("Failed to update note header:", e);
            toast.error("Failed to update note header");
        }
        editHeaderDialogOpen = false;
    }

    // Edit note content
    let editContentDialogOpen = $state(false);
    let editNoteContent = $state('');
    $effect(() => {
        editNoteContent = note.notes ?? '';
    });
    $effect(() => {
        if (editContentDialogOpen) editNoteContent = note.notes ?? '';
    });
    async function saveNoteContent() {
        if (!editNoteContent.trim()) {
            toast.error("Note content cannot be empty!");
            return;
        }
        try {
            await updateNoteContent({ id: note.id, notes: editNoteContent.trim() });
            editContentDialogOpen = false;
            invalidateAll();
        } catch (e) {
            console.error("Failed to update note content:", e);
            toast.error("Failed to update note content");
        }
    }

    // Delete note
    let isDeleteNoteOpen = $state(false);
    async function deleteNote() {
        try {
            await deleteNoteById({ id: note.id });
            isDeleteNoteOpen = false;
            isNoteModalOpen = false;
            invalidateAll();
            toast.success("Note deleted");
        } catch (e) {
            console.error("Failed to delete note:", e);
            toast.error("Failed to delete note");
        }
    }

    // Edit note category
    let isEditCategoryOpen = $state(false);
    let editNoteCategoryId = $state<string | undefined>(note.noteCategoryId ?? undefined);
    $effect(() => {
        if (isEditCategoryOpen) {
            editNoteCategoryId = note.noteCategoryId ?? undefined;
        }
    });
    async function saveNoteCategory() {
        try {
            await updateNoteCategory({ id: note.id, noteCategoryId: editNoteCategoryId ?? null });
            isEditCategoryOpen = false;
            invalidateAll();
            toast.success("Category updated");
        } catch (e) {
            console.error("Failed to update note category:", e);
            toast.error("Failed to update note category");
        }
    }

    let newCommentContent = $state('');
    async function addComment() {
        if (!newCommentContent.trim()) {
            toast.error("Comment cannot be empty!");
            return;
        }
        try {
            await createNewComment({ noteId: note.id, content: newCommentContent.trim() });
            newCommentContent = '';
            invalidateAll();
            toast.success("Comment added");
        } catch (e) {
            console.error("Failed to add comment:", e);
            toast.error("Failed to add comment");
        }
    }

    async function shiftNotesUp() {
        // Circular shift up: each note's index decreases by 1, first wraps to last
        const updates = allNotes.map(n => ({
            id: n.id,
            colIdx: (n.colIdx - 1 + notesLength) % notesLength
        }));
        try {
            await shiftNoteColIndices({ updates });
            invalidateAll();
        } catch (e) {
            console.error("Failed to shift notes:", e);
            toast.error("Failed to shift notes");
        }
    }

    async function shiftNotesDown() {
        // Circular shift down: each note's index increases by 1, last wraps to first
        const updates = allNotes.map(n => ({
            id: n.id,
            colIdx: (n.colIdx + 1) % notesLength
        }));
        try {
            await shiftNoteColIndices({ updates });
            invalidateAll();
        } catch (e) {
            console.error("Failed to shift notes:", e);
            toast.error("Failed to shift notes");
        }
    }

    async function moveToTopic(targetTopic: Topic) {
        if (targetTopic.id === note.topicId) return;
        try {
            await moveNoteToTopic({
                id: note.id,
                topicId: targetTopic.id,
                colIdx: targetTopic.notes.length
            });
            isNoteModalOpen = false;
            invalidateAll();
            toast.success(`Moved to "${targetTopic.topicName}"`);
        } catch (e) {
            console.error("Failed to move note:", e);
            toast.error("Failed to move note");
        }
    }
</script>

<Dialog bind:open={isNoteModalOpen}>
    <DialogTrigger title="See/Edit Note">
        <div
            bind:this={noteDiv}
            class={["sticky-note flex flex-col gap-2 cursor-pointer transition-all duration-150 ease-in", scaleNote && "scale-[1.025]", noteRotation, "text-pastel-foreground", colorBgMap[note.noteCategory?.color!]]}
            onmouseenter={hoverNote}
            onmouseleave={stopHoverNote}
            role="banner"
        >
            <div class="flex flex-col">
                <span class="pt-2 px-3 text-start wrap-break-word font-semibold">{note.header}</span>

                <!-- <div class={["w-full h-[2px]", colorBorderBgMap[note.noteCategory?.color!]]}></div> -->
            </div>
            <span class="text-sm pb-3 pt-1 px-3 text-start wrap-break-word">{note.notes}</span>
        </div>
    </DialogTrigger>
    <DialogContent class="overflow-hidden">
        <DialogTitle class="w-full overflow-hidden">
                <div class="flex flex-col gap-2 w-full">
                    <span class="break-all">{note.header}</span>
                    <div class="flex justify-between gap-2 items-center">
                        <div class="flex flex-wrap gap-0.5">
                            <Dialog bind:open={editHeaderDialogOpen}>
                            <DialogTrigger
                                class={[buttonVariants({ variant: "ghost", size: "icon" })]}
                                title="Edit Header"
                            >
                                <Pencil class="size-4"/>
                            </DialogTrigger>

                            <DialogContent noOverlay class="w-[450px]">
                                <DialogTitle>Edit Note Header</DialogTitle>
                                <div class="flex flex-col gap-2 mt-2">
                                    <Label for="editNoteHeader">Note Header:</Label>
                                    <Input
                                        bind:value={editNoteHeader}
                                        name="editNoteHeader"
                                        id="editNoteHeader"
                                        placeholder="Header..."
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <DialogClose class={buttonVariants({ variant: "ghost" })}>
                                        Cancel
                                    </DialogClose>
                                    <Button onclick={saveNoteHeader} disabled={!editNoteHeader}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog bind:open={isEditCategoryOpen}>
                            <DialogTrigger
                                class={[buttonVariants({ variant: "ghost", size: "icon" })]}
                                title="Edit Note Category"
                            >
                                <StickyNote class="size-4"/>
                            </DialogTrigger>
                            <DialogContent noOverlay class="w-[450px]">
                                <DialogTitle>Edit Note Category</DialogTitle>
                                <NoteCategorySwitches {noteCategories} bind:noteCategoryId={editNoteCategoryId} dialogOpen={isEditCategoryOpen}/>
                                <DialogFooter>
                                    <DialogClose class={buttonVariants({ variant: "ghost" })}>
                                        Cancel
                                    </DialogClose>
                                    <Button onclick={saveNoteCategory}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <AlertDialog bind:open={isDeleteNoteOpen}>
                            <DialogTrigger
                                class={[buttonVariants({ variant: "ghost", size: "icon" })]}
                                title="Delete Note"
                            >
                                <Trash2 class="text-destructive size-4"/>
                            </DialogTrigger>
                            <AlertDialogContent noOverlay class="w-[450px]">
                                <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                                <span>Are you sure you want to delete this note? This will delete all associated comments.</span>

                                <AlertDialogFooter>
                                    <DialogClose class={buttonVariants({ variant: "ghost" })}>
                                        Cancel
                                    </DialogClose>
                                    <Button onclick={deleteNote}>Confirm</Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {#if notesLength > 1}
                            <Button size="icon" variant="ghost" title="Shift Note Up" onclick={shiftNotesUp}><ChevronsUp class="size-4"/></Button>
                            <Button size="icon" variant="ghost" title="Shift Note Down" onclick={shiftNotesDown}><ChevronsDown class="size-4"/></Button>
                        {/if}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger class={[buttonVariants({ variant: "ghost", size: "icon" })]} title="Move to Topic">
                                <NotebookPen class="size-4"/>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Group>
                                    {#each allTopics.sort((a, b) => a.rowIdx - b.rowIdx) as targetTopic}
                                        <DropdownMenu.Item
                                            class={[hoverColorBgMap[targetTopic.color], "break-words max-w-[200px] data-highlighted:text-pastel-foreground"]}
                                            onclick={() => moveToTopic(targetTopic)}
                                            disabled={targetTopic.id === note.topicId}
                                        >
                                            {targetTopic.topicName}
                                        </DropdownMenu.Item>
                                    {/each}
                                </DropdownMenu.Group>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                        </div>
                        {#if note.noteCategory}
                            <Badge variant={note.noteCategory.color}>{note.noteCategory.categoryName}</Badge>
                        {/if}
                    </div>
                </div>
        </DialogTitle>

        <div class="flex flex-col gap-2 mt-2">
            <div class="flex flex-col gap-0.5">
                <div class="flex items-end justify-between gap-1">
                    <span class="text-sm text-muted-foreground">Note:</span>
                    <Dialog bind:open={editContentDialogOpen}>
                        <DialogTrigger
                            class={[buttonVariants({ variant: "ghost", size: "icon-sm" })]}
                            title="Edit Note Content"
                        >
                            <Pencil class="size-3.5"/>
                        </DialogTrigger>
                        <DialogContent noOverlay class="w-[500px]">
                            <DialogTitle>Edit Note Content</DialogTitle>
                            <div class="flex flex-col gap-2 mt-2">
                                <Label for="editNoteContent">Note:</Label>
                                <Textarea
                                    bind:value={editNoteContent}
                                    name="editNoteContent"
                                    id="editNoteContent"
                                    placeholder="Note content..."
                                    class="min-h-[120px]"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose class={buttonVariants({ variant: "ghost" })}>
                                    Cancel
                                </DialogClose>
                                <Button onclick={saveNoteContent} disabled={!editNoteContent.trim()}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div class="w-full h-px bg-border mb-1"></div>
                <span class="wrap-break-word">{note.notes}</span>
                <!-- TODO: add createdBy in comment ... refers to a user -->
                <span class="text-xs text-end text-muted-foreground">- Todo</span>
            </div>
         

            <!-- Comments Section -->
            <div class="flex flex-col gap-1.5 text-sm mt-4.5">
                <div class="flex justify-between items-end">
                    <span class="text-muted-foreground">Comments:</span>
                    <!-- <Button size="icon-sm" variant="ghost" title="Add Comment"><MessageSquarePlus/></Button> -->
                </div>
                
                <div class="w-full h-px bg-border mb-1"></div>

                <ScrollArea class="space-y-2 max-h-64 w-full rounded-md border">
                    {#each note.comments as comment}
                        <div class="border border-border rounded-md flex flex-col p-1.5 m-1.5">
                            <span class="break-words">{comment.content}</span>

                            <!-- TODO: add createdBy in comment ... refers to a user -->
                            <span class="text-xs text-end text-muted-foreground">- Todo</span>
                        </div>
                    {/each}
                </ScrollArea>
                <div class="flex gap-2">
                    <Textarea bind:value={newCommentContent} placeholder="Add comment..."/>
                    <Button size="icon" variant="outline" title="Add Comment" onclick={addComment} disabled={!newCommentContent.trim()}>
                        <MessageSquarePlus class="size-4"/>
                    </Button>
                </div>
            </div>

            <div class="flex gap-1.5 mt-3">
                <!-- TODO: add time , not just date -->
                <span class="text-xs text-muted-foreground">Posted: {formatDate(new Date(note.createdAt))},</span>
                <span class="text-xs text-muted-foreground">Edited: {formatDate(new Date(note.updatedAt))}</span>
            </div>
        </div>
        <DialogFooter>
            <DialogClose class={buttonVariants({ variant: "ghost" })}>
                Close
            </DialogClose>
        </DialogFooter>
    </DialogContent>
</Dialog>