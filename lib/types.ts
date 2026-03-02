export interface Asset {
  id: string;
  name: string;
  value: number;
  /** Cor em hexadecimal no formato #RRGGBB */
  color?: string;
}
