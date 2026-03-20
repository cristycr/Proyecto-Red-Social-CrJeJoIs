export interface GetUserDto {
  id: number;
  nickname: string;
  avatarPath: string | null;
  name?: string | null;
  surname1?: string | null;
  surname2?: string | null;
}