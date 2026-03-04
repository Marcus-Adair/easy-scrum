<script lang="ts">
	import type { Note, NoteCategory, Topic, SignedInUser } from "$lib/types";
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
	import { createNewComment, updateCommentContent, deleteCommentById } from "$lib/remote-functions/comment.remote";
	import type { Comment } from "$lib/types";
	import NoteCategorySwitches from "./NoteCategorySwitches.svelte";
	import { ScrollArea } from "./ui/scroll-area";
	import { hoverColorBgMap, colorBgMap } from "$lib/consts"; // colorBorderMap, colorBorderBgMap
	import { Badge } from "./ui/badge";

    interface Props {
        note: Note;
        allNotes: Note[];
        allTopics: Topic[];
        noteCategories: NoteCategory[];
        currentUser?: SignedInUser;
    }
    let { note, allNotes, allTopics, noteCategories, currentUser }: Props = $props();
    let notesLength = $derived(allNotes.length);
    let isNoteCreator = $derived(currentUser?.id === note.createdById);

    // Shift constraints - can't shift past boundaries
    let canShiftUp = $derived(note.colIdx > 0);
    let canShiftDown = $derived(note.colIdx < notesLength - 1);

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
            await updateNoteHeader({ id: note.id, header: editNoteHeader.trim(), userId: currentUser!.id });
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
            await updateNoteContent({ id: note.id, notes: editNoteContent.trim(), userId: currentUser!.id });
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
            await deleteNoteById({ id: note.id, userId: currentUser!.id });
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
            await createNewComment({ noteId: note.id, content: newCommentContent.trim(), createdById: currentUser?.id });
            newCommentContent = '';
            invalidateAll();
            toast.success("Comment added");
        } catch (e) {
            console.error("Failed to add comment:", e);
            toast.error("Failed to add comment");
        }
    }

    // Edit comment
    let editingComment = $state<Comment | null>(null);
    let editCommentContent = $state('');
    let isEditCommentOpen = $state(false);
    function openEditComment(comment: Comment) {
        editingComment = comment;
        editCommentContent = comment.content;
        isEditCommentOpen = true;
    }
    async function saveCommentContent() {
        if (!editingComment || !editCommentContent.trim()) {
            toast.error("Comment cannot be empty!");
            return;
        }
        try {
            await updateCommentContent({ id: editingComment.id, content: editCommentContent.trim(), userId: currentUser!.id });
            isEditCommentOpen = false;
            editingComment = null;
            invalidateAll();
            toast.success("Comment updated");
        } catch (e) {
            console.error("Failed to update comment:", e);
            toast.error("Failed to update comment");
        }
    }

    // Delete comment
    let isDeleteCommentOpen = $state(false);
    let deletingComment = $state<Comment | null>(null);
    function openDeleteComment(comment: Comment) {
        deletingComment = comment;
        isDeleteCommentOpen = true;
    }
    async function deleteComment() {
        if (!deletingComment) return;
        try {
            await deleteCommentById({ id: deletingComment.id, userId: currentUser!.id });
            isDeleteCommentOpen = false;
            deletingComment = null;
            invalidateAll();
            toast.success("Comment deleted");
        } catch (e) {
            console.error("Failed to delete comment:", e);
            toast.error("Failed to delete comment");
        }
    }

    async function shiftNoteUp() {
        if (!canShiftUp) return;
        // Swap with the note above (colIdx - 1)
        const noteAbove = allNotes.find(n => n.colIdx === note.colIdx - 1);
        if (!noteAbove) return;
        const updates = [
            { id: note.id, colIdx: note.colIdx - 1 },
            { id: noteAbove.id, colIdx: note.colIdx }
        ];
        try {
            await shiftNoteColIndices({ updates });
            invalidateAll();
        } catch (e) {
            console.error("Failed to shift note:", e);
            toast.error("Failed to shift note");
        }
    }

    async function shiftNoteDown() {
        if (!canShiftDown) return;
        // Swap with the note below (colIdx + 1)
        const noteBelow = allNotes.find(n => n.colIdx === note.colIdx + 1);
        if (!noteBelow) return;
        const updates = [
            { id: note.id, colIdx: note.colIdx + 1 },
            { id: noteBelow.id, colIdx: note.colIdx }
        ];
        try {
            await shiftNoteColIndices({ updates });
            invalidateAll();
        } catch (e) {
            console.error("Failed to shift note:", e);
            toast.error("Failed to shift note");
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
            class={["sticky-note flex flex-col gap-2 cursor-pointer transition-all duration-150 ease-in", scaleNote && "scale-[1.025]", noteRotation, "text-pastel-foreground", colorBgMap[note.noteCategory?.color ?? 'yellow']]}
            onmouseenter={hoverNote}
            onmouseleave={stopHoverNote}
            role="banner"
        >
            <div class="flex flex-col">
                <span class="pt-2 px-3 text-start wrap-break-word font-semibold font-serif">{note.header}</span>
            </div>
            <span class="text-sm pb-3 pt-1 px-3 text-start wrap-break-word font-serif">{note.notes}</span>
        </div>
    </DialogTrigger>
    <DialogContent class="overflow-hidden min-w-[650px]">
        <DialogTitle class="w-full overflow-hidden">
                <div class="flex flex-col gap-2 w-full">
                    <span class="break-all">{note.header}</span>
                    <div class="flex justify-between gap-2 items-center">
                        <div class="flex flex-wrap gap-0.5">
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
                            {#if isNoteCreator}
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
                            {/if}
                        {#if canShiftUp}
                            <DialogClose class={buttonVariants({ variant: "ghost", size: "icon" })} title="Shift Note Up" onclick={shiftNoteUp}><ChevronsUp class="size-4"/></DialogClose>
                        {/if}
                        {#if canShiftDown}
                            <DialogClose class={buttonVariants({ variant: "ghost", size: "icon" })} title="Shift Note Down" onclick={shiftNoteDown}><ChevronsDown class="size-4"/></DialogClose>
                        {/if}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger class={[buttonVariants({ variant: "ghost" })]} title="Move to Topic">
                                <span class="text-xs text-muted-foreground">Move Note</span>
                                <NotebookPen class="size-4"/>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Group>
                                <DropdownMenu.Label>Move to Topic:</DropdownMenu.Label>
                                <DropdownMenu.Separator />
                                    {#each allTopics.sort((a, b) => a.rowIdx - b.rowIdx) as targetTopic}
                                        <DropdownMenu.Item
                                            class={[hoverColorBgMap[targetTopic.color], "wrap-break-word max-w-[200px] data-highlighted:text-pastel-foreground"]}
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
                            <Badge
                                variant={note.noteCategory.color}
                                onclick={() => isEditCategoryOpen = true}
                                class="cursor-pointer"
                                title="Note Category"
                            >
                                {note.noteCategory.categoryName}
                            </Badge>
                        {/if}
                    </div>
                </div>
        </DialogTitle>

        <div class="flex flex-col gap-2 mt-2">
            <div class="flex flex-col gap-0.5">
                <div class="flex items-end justify-between gap-1">
                    <span class="text-sm text-muted-foreground">Note:</span>
                    {#if isNoteCreator}
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
                    {/if}
                </div>
                <div class="w-full h-px bg-border mb-1"></div>
                <span class="wrap-break-word">{note.notes}</span>
                <span class="text-xs text-end text-muted-foreground">- {note.createdBy?.name ?? 'Unknown'}</span>
            </div>
         

            <!-- Comments Section -->
            <div class="flex flex-col gap-1.5 text-sm mt-4.5">
                <div class="flex justify-between items-end">
                    <span class="text-muted-foreground">Comments:</span>
                </div>
                
                <div class="w-full h-px bg-border mb-1"></div>

                {#if note.comments.length}
                    <ScrollArea class="space-y-2 max-h-64 w-full rounded-md border">
                        {#each note.comments as comment}
                            <div class="border border-border rounded-md flex flex-col p-1.5 m-1.5">
                                <span class="wrap-break-word">{comment.content}</span>
                                <div class="flex justify-between items-center mt-1">
                                    <span class="text-xs text-muted-foreground">- {comment.createdBy?.name ?? 'Unknown'}</span>
                                    {#if currentUser?.id === comment.createdById}
                                        <div class="flex gap-0.5">
                                            <Button size="icon-sm" variant="ghost" title="Edit Comment" onclick={() => openEditComment(comment)}>
                                                <Pencil class="size-3.5"/>
                                            </Button>
                                            <Button size="icon-sm" variant="ghost" title="Delete Comment" onclick={() => openDeleteComment(comment)}>
                                                <Trash2 class="size-3.5 text-destructive"/>
                                            </Button>
                                        </div>
                                    {/if}
                                </div>
                                <div class="flex gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                                    <span>Posted: {formatDate(new Date(comment.createdAt))}</span>
                                    {#if comment.updatedAt && new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime()}
                                        <span>|</span>
                                        <span>Edited: {formatDate(new Date(comment.updatedAt))}</span>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </ScrollArea>
                {/if}
                
                <div class="flex gap-2">
                    <Textarea bind:value={newCommentContent} placeholder="Add comment..."/>
                    <Button size="icon" variant="outline" title="Add Comment" onclick={addComment} disabled={!newCommentContent.trim()}>
                        <MessageSquarePlus class="size-4"/>
                    </Button>
                </div>
            </div>

            <!-- Edit Comment Dialog -->
            <Dialog bind:open={isEditCommentOpen}>
                <DialogContent noOverlay class="w-[450px]">
                    <DialogTitle>Edit Comment</DialogTitle>
                    <div class="flex flex-col gap-2 mt-2">
                        <Label for="editCommentContent">Comment:</Label>
                        <Textarea
                            bind:value={editCommentContent}
                            name="editCommentContent"
                            id="editCommentContent"
                            placeholder="Comment..."
                            class="min-h-[100px]"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose class={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
                        <Button onclick={saveCommentContent} disabled={!editCommentContent.trim()}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <!-- Delete Comment AlertDialog -->
            <AlertDialog bind:open={isDeleteCommentOpen}>
                <AlertDialogContent noOverlay class="w-[400px]">
                    <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                    <span>Are you sure you want to delete this comment?</span>
                    <AlertDialogFooter>
                        <DialogClose class={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
                        <Button onclick={deleteComment}>Confirm</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div class="flex gap-1.5 mt-3 flex-wrap text-xs text-muted-foreground">
                <span>Posted: {formatDate(new Date(note.createdAt))}</span>
                {#if new Date(note.updatedAt).getTime() !== new Date(note.createdAt).getTime()}
                    <span>|</span>
                    <span>Edited: {formatDate(new Date(note.updatedAt))}</span>
                {/if}
            </div>
        </div>
        <DialogFooter>
            <DialogClose class={buttonVariants({ variant: "ghost" })}>
                Close
            </DialogClose>
        </DialogFooter>
    </DialogContent>
</Dialog>