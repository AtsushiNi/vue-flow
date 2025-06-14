export interface Column {
  name: string;
  type: string;
  primaryKey?: boolean;
}

export interface Table {
  name: string;
  columns: Column[];
}
