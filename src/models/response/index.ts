export interface ResponseModel {
  info: Info;
}

interface Info {
  count: number;
  pages: number;
  next: number;
  prev: number | null;
}
