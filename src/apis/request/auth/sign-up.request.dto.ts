export default interface SignUpRequestDto {
    userId: string;
    nickname: string;
    password: string;
    email: string;
    certificationNumber: string;
    agreedPersonal: boolean;
};