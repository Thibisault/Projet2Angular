// FormattedData.ts
export interface FormattedData {
  year: number;
  [country: string]: {
    totalAthletes: number;
    totalMedals: number;
    totalParticipations: number;
  };
}
