export default interface PatchPasswordRequestDto {
  
    userId: string;
    currentPassword: string;  
    newPassword: string;
}