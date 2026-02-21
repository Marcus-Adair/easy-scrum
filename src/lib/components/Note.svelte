<script lang="ts">
	import type { Note, NoteCategory } from "$lib/types";
    import { Dialog, DialogFooter, DialogTitle, DialogClose, DialogContent, DialogTrigger } from "$lib/components/ui/dialog";
	import { Button, buttonVariants } from "./ui/button";
	import { formatDate } from "$lib/utils";
	import { ChevronsDown, ChevronsUp, StickyNote, MessageSquarePlus, Pencil, Trash2 } from "@lucide/svelte";
	import { Textarea } from "./ui/textarea";
	import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "./ui/alert-dialog";
	import { Label } from "./ui/label";
	import { Input } from "./ui/input";
	import { toast } from "svelte-sonner";
	import { invalidateAll } from "$app/navigation";
	import { updateNoteHeader, deleteNoteById, updateNoteCategory } from "$lib/remote-functions/note.remote";
	import { createNewComment } from "$lib/remote-functions/comment.remote";
	import NoteCategorySwitches from "./NoteCategorySwitches.svelte";
	import { ScrollArea } from "./ui/scroll-area";

    interface Props {
        note: Note;
        noteCategories: NoteCategory[];
    }
    let { note, noteCategories }: Props = $props();

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

    // Add comment
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
</script>

<!-- Note: Dialog for creating a note should be a textarea so i can do multiple lines in a comment -->

<Dialog bind:open={isNoteModalOpen}>
    <DialogTrigger title="See/Edit Note">
        <!-- , colorBgMap[note.noteCategory?.color ?? "yellow"] -->
        <div
            bind:this={noteDiv}
            class={["flex flex-col gap-2 rounded-md border border-border cursor-pointer transition-all duration-150 ease-in", scaleNote && "scale-[1.025] shadow-xs", "bg-card"]}
            onmouseenter={hoverNote}
            onmouseleave={stopHoverNote}
            role="banner"
        >
            <div class="flex flex-col">
                <span class="pt-2 pb-1.5 px-3 text-start">{note.header}</span>
                <div class="w-full h-px bg-border"></div>
            </div>
            <span class="text-sm pb-3 pt-1 px-3 text-start">{note.notes}</span>
        </div>
    </DialogTrigger>
    <DialogContent>
        <DialogTitle>
                <div class="flex items-center gap-1.5">
                    <span>{note.header}</span>
                    <div class="flex mr-1.5">
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
                                    <DialogClose class={buttonVariants({ variant: "outline" })}>
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
                                    <DialogClose class={buttonVariants({ variant: "outline" })}>
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
                                    <DialogClose class={buttonVariants({ variant: "outline" })}>
                                        Cancel
                                    </DialogClose>
                                    <Button onclick={deleteNote}>Confirm</Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button size="icon" variant="ghost" title="Shift Note Up"><ChevronsUp class="size-4"/></Button>
                        <Button size="icon" variant="ghost" title="Shift Note Down"><ChevronsDown class="size-4"/></Button>  
                    </div>
                </div>
        </DialogTitle>

        <div class="flex flex-col gap-2 mt-2">
            <div class="flex flex-col gap-0.5">
                <span class="text-sm text-muted-foreground">Note:</span>
                <div class="w-full h-px bg-border mb-1"></div>
                <span>{note.notes}</span>
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
                            <span>{comment.content}</span>

                            <!-- TODO: add createdBy in comment ... refers to a user -->
                            <span class="text-xs text-end text-muted-foreground">- Todo</span>
                        </div>
                    {/each}
                </ScrollArea>
                <div class="flex gap-2">
                    <Textarea bind:value={newCommentContent} placeholder="Add comment..."/>
                    <Button size="icon" variant="ghost" title="Add Comment" onclick={addComment} disabled={!newCommentContent.trim()}>
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
            <DialogClose class={buttonVariants({ variant: "outline" })}>
                Close
            </DialogClose>
        </DialogFooter>
    </DialogContent>
</Dialog>