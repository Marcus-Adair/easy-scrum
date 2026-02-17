<script lang="ts">
	import { NotebookPen, Palette, Pencil, Plus, StickyNote, Trash2 } from '@lucide/svelte';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import type { PageProps } from './$types';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
    import { createNewTopic as createNewTopicApi } from '$lib/remote-functions/topic.remote';
    import { createNewNoteCategory, updateNoteCategoryName, updateNoteCategoryColor, deleteNoteCategoryById } from '$lib/remote-functions/noteCategory.remote';
	import { Dialog, DialogFooter } from '$lib/components/ui/dialog';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import DialogClose from '$lib/components/ui/dialog/dialog-close.svelte';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogTrigger from '$lib/components/ui/dialog/dialog-trigger.svelte';
    import { toast } from "svelte-sonner";
	import { invalidateAll } from '$app/navigation';
	import Topic from '$lib/components/Topic.svelte';
	import type { ColorOption, NoteCategory } from '$lib/types';
	import TopicColorSwitches from '$lib/components/TopicColorSwitches.svelte';
	import NoteCategorySwitches from '$lib/components/NoteCategorySwitches.svelte';
	import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from '$lib/components/ui/alert-dialog';

    let { data }: PageProps = $props();
    let scrumSession = $derived(data.session);

    let newTopicName = $state<string | undefined>();
    async function createNewTopic() {
        if (!newTopicName) {
            toast.error("Name cannot be empty!");
            return;
        }

        try {
            await createNewTopicApi({
                scrumSessionId: scrumSession.id,
                topicName: newTopicName,
                color: newTopicColor,
                rowIdx: scrumSession.topics.length
            });
            createTopicDialogOpen = false;
            newTopicName = undefined;
            invalidateAll();
            toast.success("Topic created");
        } catch (e) {
            console.error("Failed to create topic:", e);
            toast.error("Failed to create topic");
        }
    }

    let createTopicDialogOpen = $state(false);
    let newTopicColor = $state<ColorOption>("pink");

    // New Note Category
    let isNewCategoryModalOpen = $state(false);
    let newCategoryName = $state('');
    let newCategoryColor = $state<ColorOption>("pink");
    $effect(() => {
        if (isNewCategoryModalOpen) {
            newCategoryName = '';
            newCategoryColor = "pink";
        }
    });
    async function createCategory() {
        if (!newCategoryName.trim()) {
            toast.error("Category name is required!");
            return;
        }
        try {
            await createNewNoteCategory({
                scrumSessionId: scrumSession.id,
                categoryName: newCategoryName.trim(),
                color: newCategoryColor,
            });
            isNewCategoryModalOpen = false;
            invalidateAll();
            toast.success("Category created");
        } catch (e) {
            console.error("Failed to create category:", e);
            toast.error("Failed to create category");
        }
    }

    // Edit Category Name
    let isEditCategoryNameOpen = $state(false);
    let editingCategory = $state<NoteCategory | null>(null);
    let editCategoryName = $state('');
    function openEditCategoryName(category: NoteCategory) {
        editingCategory = category;
        editCategoryName = category.categoryName;
        isEditCategoryNameOpen = true;
    }
    async function saveCategoryName() {
        if (!editingCategory || !editCategoryName.trim()) {
            toast.error("Category name is required!");
            return;
        }
        try {
            await updateNoteCategoryName({ id: editingCategory.id, categoryName: editCategoryName.trim() });
            isEditCategoryNameOpen = false;
            invalidateAll();
            toast.success("Category name updated");
        } catch (e) {
            console.error("Failed to update category name:", e);
            toast.error("Failed to update category name");
        }
    }

    // Edit Category Color
    let isEditCategoryColorOpen = $state(false);
    let editCategoryColor = $state<ColorOption>("pink");
    function openEditCategoryColor(category: NoteCategory) {
        editingCategory = category;
        editCategoryColor = category.color;
        isEditCategoryColorOpen = true;
    }
    async function saveCategoryColor() {
        if (!editingCategory) return;
        try {
            await updateNoteCategoryColor({ id: editingCategory.id, color: editCategoryColor });
            isEditCategoryColorOpen = false;
            invalidateAll();
            toast.success("Category color updated");
        } catch (e) {
            console.error("Failed to update category color:", e);
            toast.error("Failed to update category color");
        }
    }

    // Delete Category
    let isDeleteCategoryOpen = $state(false);
    function openDeleteCategory(category: NoteCategory) {
        editingCategory = category;
        isDeleteCategoryOpen = true;
    }
    async function deleteCategory() {
        if (!editingCategory) return;
        try {
            await deleteNoteCategoryById({ id: editingCategory.id });
            isDeleteCategoryOpen = false;
            invalidateAll();
            toast.success("Category deleted");
        } catch (e) {
            console.error("Failed to delete category:", e);
            toast.error("Failed to delete category");
        }
    }
</script>


<div class="flex flex-col items-center gap-8 py-4 w-screen p-4">

    <!-- Scrum Board-->
    <div class="flex flex-col gap-2 border border-border rounded-md bg-card min-w-xl max-w-full overflow-x-scroll">
        <div class="sticky top-0 left-0 z-10">
            <div class="relative flex justify-center items-center border-b border-border px-2 py-3">
                <Dialog bind:open={createTopicDialogOpen}>
                    <DialogTrigger class={["absolute left-5", buttonVariants({ variant: "outline", size: "sm" })]} title="Create Topic">
                        Create Topic
                        <NotebookPen/>
                    </DialogTrigger>
                    <DialogContent class="gap-8">
                        <DialogTitle>New Topic</DialogTitle>
                
                        <div class="flex flex-col gap-2 mt-2">
                            <Label for="newTopicName">New Topic Name:</Label>
                            <Input
                                bind:value={newTopicName}
                                name="newTopicName"
                                id="newTopicName"
                                placeholder="Name..."
                                required
                            />
                        </div>

                        <TopicColorSwitches bind:topicColor={newTopicColor} dialogOpen={createTopicDialogOpen}/>

                        <DialogFooter>
                            <DialogClose class={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
                            <Button onclick={ () =>  createNewTopic()} disabled={!newTopicColor}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <h1 class="text-primary font-bold text-lg mb-1">{scrumSession.name}</h1>
                <Dialog bind:open={isNewCategoryModalOpen}>
                    <DialogContent class="gap-8">
                        <DialogTitle>New Note Category</DialogTitle>

                        <div class="flex flex-col gap-2">
                            <Label for="newNoteCategory">Category Name:</Label>
                            <Input
                                bind:value={newCategoryName}
                                name="newNoteCategory"
                                id="newNoteCategory"
                                placeholder="Name..."
                                required
                            />
                        </div>

                        <TopicColorSwitches bind:topicColor={newCategoryColor} dialogOpen={isNewCategoryModalOpen}/>

                        <DialogFooter>
                            <DialogClose class={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
                            <Button onclick={createCategory} disabled={!newCategoryName.trim()}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger
                        class={["absolute right-5", buttonVariants({ variant: "outline", size: "sm" })]}
                    >
                        Note Categories <StickyNote/>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Group>
                            {#each scrumSession.noteCategories as noteCategory}
                                <DropdownMenu.Sub>
                                    <DropdownMenu.SubTrigger>{noteCategory.categoryName}</DropdownMenu.SubTrigger>
                                    <DropdownMenu.SubContent>
                                        <DropdownMenu.Item title="Edit Name" onclick={() => openEditCategoryName(noteCategory)}>Edit Name<Pencil/></DropdownMenu.Item>
                                        <DropdownMenu.Item title="Edit Color" onclick={() => openEditCategoryColor(noteCategory)}>Edit Color<Palette/></DropdownMenu.Item>
                                        <DropdownMenu.Item title="Delete" onclick={() => openDeleteCategory(noteCategory)}>Delete<Trash2 class="text-destructive"/></DropdownMenu.Item>
                                    </DropdownMenu.SubContent>
                                </DropdownMenu.Sub>
                            {/each}
                            {#if scrumSession.noteCategories.length}
                                <DropdownMenu.Separator />
                            {/if}

                            <DropdownMenu.Item title="New Note Category" class="justify-between" onclick={() => isNewCategoryModalOpen = true}>
                                New Category<Plus/>
                            </DropdownMenu.Item>
                        </DropdownMenu.Group>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <!-- Edit Category Name Dialog -->
                <Dialog bind:open={isEditCategoryNameOpen}>
                    <DialogContent class="gap-6">
                        <DialogTitle>Edit Category Name</DialogTitle>
                        <div class="flex flex-col gap-2">
                            <Label for="editCategoryName">Category Name:</Label>
                            <Input
                                bind:value={editCategoryName}
                                name="editCategoryName"
                                id="editCategoryName"
                                placeholder="Name..."
                                required
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose class={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
                            <Button onclick={saveCategoryName} disabled={!editCategoryName.trim()}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <!-- Edit Category Color Dialog -->
                <Dialog bind:open={isEditCategoryColorOpen}>
                    <DialogContent class="gap-6">
                        <DialogTitle>Edit Category Color</DialogTitle>
                        <TopicColorSwitches bind:topicColor={editCategoryColor} dialogOpen={isEditCategoryColorOpen}/>
                        <DialogFooter>
                            <DialogClose class={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
                            <Button onclick={saveCategoryColor}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <!-- Delete Category AlertDialog -->
                <AlertDialog bind:open={isDeleteCategoryOpen}>
                    <AlertDialogContent>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <span>Are you sure you want to delete "{editingCategory?.categoryName}"? Notes using this category will lose their category assignment.</span>
                        <AlertDialogFooter>
                            <DialogClose class={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
                            <Button onclick={deleteCategory}>Confirm</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

        <div class="flex justify-center gap-3 p-5">
            {#if scrumSession.topics.length}
                {#each scrumSession.topics.sort((a, b) => a.rowIdx - b.rowIdx) as topic}
                    <Topic {topic} topicsLength={scrumSession.topics.length} noteCategories={scrumSession.noteCategories}/>
                {/each}
               
            {:else}
                <div class="flex flex-col gap-0 px-4">
                    <span class="text-lg text-center">No Topics</span>
                    <span class="text-center text-sm text-muted-foreground">Create a topic to start adding notes to it</span>
                </div>
            {/if}
        </div>
    </div>
</div>


