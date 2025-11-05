export interface Category {
  categoryId: number;
  name: string;
  type: string;
  description?: string | null;
  isActive: boolean;
}

export interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}