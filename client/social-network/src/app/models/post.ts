export interface Post {
    id: number;
    userId: string;
    creationDate: Date;
    title: string | null;
    description: string | null;
    picturePath: string | null;
}
