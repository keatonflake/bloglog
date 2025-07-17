export interface Blog {
    _id?: string;         // if you’re storing the MongoDB ID
    authorId: string;
    title: string;
    content: string;
    tags: string[];
    status: 'draft' | 'published';
    createdAt?: string;   // ISO date string from your API
    updatedAt?: string;   // same
}