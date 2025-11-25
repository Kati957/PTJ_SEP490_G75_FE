import type { Job } from "../../types";

export interface EmployerPublicProfile {
    userId: string;
    displayName: string;
    description: string;
    avatarUrl: string;
    website: string;
    contactPhone: string;
    contactEmail: string;
    location: string;
    role?: string;
}

export interface EmployerDetailState {
    profile: EmployerPublicProfile | null;
    jobs: Job[];
    loading: boolean;
    error: string | null;
}
