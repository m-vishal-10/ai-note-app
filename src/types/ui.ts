export type Note = {
  id: string;
  text: string;
  // ISO timestamp string to avoid locale/timezone hydration mismatches
  updatedAt: string;
};


