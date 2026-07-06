declare enum RegisterRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    TECHNICIAN = "TECHNICIAN",
    SALES = "SALES",
    MONITORING = "MONITORING"
}
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: RegisterRole;
}
export {};
