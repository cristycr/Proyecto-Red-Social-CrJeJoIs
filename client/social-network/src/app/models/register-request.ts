// Define los datos que se envían al backend para registrarse
export interface RegisterRequest {
    email: string;
    nickname: string;
    avatarPath?: string;
    name: string;
    surname1: string;
    surname2?: string;
    password: string;
    biography?: string;
}