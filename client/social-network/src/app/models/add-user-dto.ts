// Modelo para el registro de usuario (AddUserDto)
export interface AddUserDto {
    email: string;
    nickname: string;
    avatarPath: string | null;
    name: string;
    surname1: string;
    surname2: string | null;
    password: string;
}