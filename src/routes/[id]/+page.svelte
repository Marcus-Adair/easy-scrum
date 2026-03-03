<script lang="ts">
	import { NotebookPen, Palette, Pencil, Plus, StickyNote, Trash2, LogIn, LogOut, Link, Check } from '@lucide/svelte';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import type { PageProps } from './$types';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
    import { createNewTopic as createNewTopicApi } from '$lib/remote-functions/topic.remote';
    import { createNewNoteCategory, updateNoteCategoryName, updateNoteCategoryColor, deleteNoteCategoryById } from '$lib/remote-functions/noteCategory.remote';
    import { signIn } from '$lib/remote-functions/scrumSessionUser.remote';
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
	import type { ColorOption, NoteCategory, SignedInUser } from '$lib/types';
	import TopicColorSwitches from '$lib/components/TopicColorSwitches.svelte';
	import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from '$lib/components/ui/alert-dialog';
	import { hoverColorBgMap } from '$lib/consts';
	import { browser } from '$app/environment';

    let { data }: PageProps = $props();
    let scrumSession = $derived(data.session);

    // Sign-in state
    let currentUser = $state<SignedInUser | undefined>();
    let isSignedIn = $derived(!!currentUser);

    // Load user from users' browser sessionStorage on mount
    $effect(() => {
        if (browser) {
            const stored = sessionStorage.getItem(`user-${scrumSession.id}`);
            if (stored) {
                try {
                    currentUser = JSON.parse(stored);
                } catch {
                    sessionStorage.removeItem(`user-${scrumSession.id}`);
                }
            }
        }
    });

    // Sign-in form state
    let signInName = $state('');
    let signInPassword = $state('');

    async function handleSignIn() {
        if (!signInName.trim()) {
            toast.error("Name is required!");
            return;
        }

        try {
            const result = await signIn({
                scrumSessionId: scrumSession.id,
                name: signInName.trim(),
                password: signInPassword || undefined
            });

            if (result.success && result.user) {
                currentUser = result.user;
                sessionStorage.setItem(`user-${scrumSession.id}`, JSON.stringify(result.user));
                toast.success(`Signed in as ${result.user.name}`);
                signInName = '';
                signInPassword = '';
                invalidateAll();
            } else {
                toast.error(result.error || "Sign in failed");
            }
        } catch (e) {
            console.error("Failed to sign in:", e);
            toast.error("Failed to sign in");
        }
    }

    function handleSignOut() {
        currentUser = undefined;
        sessionStorage.removeItem(`user-${scrumSession.id}`);
        toast.success("Signed out");
    }

    // Copy URL to clipboard
    let justCopied = $state(false);
    async function copyUrl() {
        if (!browser) return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            justCopied = true;
            toast.success("Link copied to clipboard!");
            setTimeout(() => justCopied = false, 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    }

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

<svelte:head>
	<title>{scrumSession.name} | Easy-Scrum</title>
</svelte:head>

<div class="relative flex flex-col items-center gap-8 py-4 w-screen p-4">
    <!-- Sign In Section -->
    {#if !isSignedIn}
        <div class="absolute z-110 top-2 flex flex-col gap-4 border border-border rounded-md bg-card p-6 w-full max-w-md">
            <h2 class="text-2xl text-center font-extrabold font-serif text-primary">Sign In to the Easy-Scrum Board</h2>
            <p class="text-sm text-muted-foreground text-left">Enter your name to join the session. Password is optional.</p>
            <p class="text-sm text-muted-foreground text-left">Notes and comments can only be edited and deleted by their creator.</p>

            <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1.5">
                    <Label for="signInName">Name</Label>
                    <Input
                        bind:value={signInName}
                        id="signInName"
                        placeholder="Your name..."
                        required
                        onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleSignIn()}
                    />
                </div>
                <div class="flex flex-col gap-1.5">
                    <Label for="signInPassword">Password (optional)</Label>
                    <Input
                        bind:value={signInPassword}
                        id="signInPassword"
                        type="password"
                        placeholder="Optional password..."
                        onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleSignIn()}
                    />
                </div>
                <Button onclick={handleSignIn} disabled={!signInName.trim()} class="mt-4">
                    Sign In
                    <LogIn class="size-4"/>
                </Button>
            </div>
        </div>
    {/if}

    <!-- Scrum Board-->
    <div class={["flex flex-col gap-2 border border-border rounded-md bg-card min-w-xl max-w-full overflow-x-scroll", !isSignedIn && "opacity-50 pointer-events-none select-none"]}>
        <div class="sticky top-0 left-0 z-10">
            <div class="relative flex justify-center border-b border-border px-2 pt-3 pb-1.5">
                <div class="flex flex-col items-center">
                
                    <!-- SCRUM NAME!!!!! -->
                    <h1 class="text-primary font-extrabold text-2xl font-serif">{scrumSession.name}</h1>

                    <Button variant="ghost" size="sm" onclick={copyUrl} class="text-xs text-muted-foreground hover:text-muted-foreground hover:bg-accent/30! h-5.5 my-0.5">
                        {#if justCopied}
                            Share Link to Collaborate!
                            <Check class="size-3 text-green-600"/>
                        {:else}
                            Copy Link
                            <Link class="size-3"/>
                        {/if}
                    </Button>
                </div>

                <Dialog bind:open={createTopicDialogOpen}>
                    <DialogTrigger class={["absolute right-5", buttonVariants({ variant: "outline", size: "sm" })]} title="Create Topic">
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
                            <Button onclick={ () =>  createNewTopic()} disabled={!newTopicColor || !newTopicName?.trim()}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger
                        class={["absolute left-5", buttonVariants({ variant: "outline", size: "sm" })]}
                    >
                        Note Categories <StickyNote/>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Group>
                            {#each scrumSession.noteCategories as noteCategory}
                                <DropdownMenu.Sub>
                                    <DropdownMenu.SubTrigger class={[hoverColorBgMap[noteCategory.color], "data-highlighted:text-gray-800 data-[state=open]:text-gray-800"]}>{noteCategory.categoryName}</DropdownMenu.SubTrigger>
                                    <DropdownMenu.SubContent>
                                        <DropdownMenu.Item class={[hoverColorBgMap[noteCategory.color], "data-highlighted:text-gray-800"]} title="Edit Name" onclick={() => openEditCategoryName(noteCategory)}>Edit Name<Pencil/></DropdownMenu.Item>
                                        <DropdownMenu.Item class={[hoverColorBgMap[noteCategory.color], "data-highlighted:text-gray-800"]} title="Edit Color" onclick={() => openEditCategoryColor(noteCategory)}>Edit Color<Palette/></DropdownMenu.Item>
                                        <DropdownMenu.Item class={[hoverColorBgMap[noteCategory.color], "data-highlighted:text-gray-800"]} title="Delete" onclick={() => openDeleteCategory(noteCategory)}>Delete<Trash2 class="text-destructive"/></DropdownMenu.Item>
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

                <!-- Edit note category color -->
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
                        <span>Are you sure you want to delete "{editingCategory?.categoryName}"? Note: you will not be able to delete this category if there are notes using it.</span>
                        <AlertDialogFooter>
                            <DialogClose class={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
                            <Button onclick={deleteCategory}>Confirm</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

        {#if scrumSession.topics.length}
            <div class="flex flex-wrap justify-center gap-3 p-5 max-w-6xl">
                {#each scrumSession.topics.sort((a, b) => a.rowIdx - b.rowIdx) as topic}
                    <Topic {topic} allTopics={scrumSession.topics} noteCategories={scrumSession.noteCategories} {currentUser}/>
                {/each}
            </div>
        {:else}
            <div class="flex justify-center pb-8 pt-4">
                <div class="flex flex-col items-center gap-0 px-4">
                    <span class="text-center">No Topics</span>
                    <span class="text-center text-sm text-muted-foreground">Create a Topic and start adding Notes to it</span>
                </div>
            </div>
        {/if}
    </div>

    <div class="flex items-center gap-3 flex-wrap justify-center">
        {#if isSignedIn}
            <!-- Signed in indicator -->
            <div class="flex flex-col items-center gap-1.5 border border-border rounded-md bg-card px-4 py-2">
                <span class="text-sm font-light">Signed in as <strong class="font-bold">{currentUser?.name}</strong></span>
                <div class="h-px bg-border w-full"></div>
                <Button variant="ghost" size="sm" class="h-6.5" onclick={handleSignOut}>
                    Sign Out
                    <LogOut class="size-4"/>
                </Button>
            </div>
        {/if}
    </div>
</div>


