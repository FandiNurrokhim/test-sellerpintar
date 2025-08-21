export interface Category {
  id?: string;
  _id?: string;
  value?: string;
  name?: string;
  label?: string;
  title?: string;
  active?: boolean;
}

export interface CategoryApiResponse {
  data?: {
    categories?: Category[];
  };
}
