export default interface Destination {
  latitude: number;
  longitude: number;
  title: string;
  id: string;
}

export interface DestinationInput {
  latitude: number;
  longitude: number;
  title: string;
  id: string;
  properties: { [key: string]: any };
}
