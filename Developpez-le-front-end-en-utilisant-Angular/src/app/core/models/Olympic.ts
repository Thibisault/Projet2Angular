import { Participation } from 'src/app/core/models/Participation';
export interface Olympic {
    id: number;
    country: string;
    participations: Participation[];
}
