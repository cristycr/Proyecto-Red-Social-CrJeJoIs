export interface PutUserDto {
  email: string;
  name: string;
  surname1: string;
  surname2: string | null;
  biography: string | null;
}
