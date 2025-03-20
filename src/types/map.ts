
export interface MapLayerType {
  id: string;
  name: string;
  color: string;
}

export interface MapDataPoint {
  data: number[];
  width: number;
  height: number;
}

export interface MapData {
  [year: number]: MapDataPoint;
}
