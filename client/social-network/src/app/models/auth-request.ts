// Define los datos que se envían al backend para hacer login
export interface AuthRequest {
    nickname: string;
    password: string;
}