export type ColorOption = "pink" | "yellow" | "blue" | "orange" | "salmon"
  
export interface User {
    id: string;
    name: string;
    password: string | null;
    scrumSessionId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Topic {
    id: string;
    scrumSessionId: string;
    topicName: string;
    rowIdx: number;
    notes: Note[];
    color: ColorOption;
    createdAt: Date;
    updatedAt: Date;
}

export interface NoteCategory {
    id: string;
    scrumSessionId: string;
    categoryName: string;
    color: ColorOption;
    createdAt: Date;
    updatedAt: Date;
}

export interface Note {
    id: string;
    header: string;
    notes: string | null;
    topicId: string;
    noteCategoryId: string | null;
    colIdx: number;
    noteCategory: NoteCategory | null;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    id: string;
    content: string;
    noteId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ScrumSession {
    id: string;
    name: string;
    users: User[];
    topics: Topic[];
    noteCategories: NoteCategory[];
    createdAt: Date;
    updatedAt: Date;
}

