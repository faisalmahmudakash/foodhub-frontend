export interface Route {
  title: string;
  url: string;
  items: {
    title: string;
    url: string;
  }[];
}
