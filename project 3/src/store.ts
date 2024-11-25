import { create } from 'zustand';
import { Product, User, Category } from './types';

interface Store {
  products: Product[];
  users: User[];
  categories: Category[];
  currentUser: User | null;
  setProducts: (products: Product[]) => void;
  setUsers: (users: User[]) => void;
  setCategories: (categories: Category[]) => void;
  setCurrentUser: (user: User | null) => void;
  addProduct: (product: Product) => void;
  addUser: (user: User) => void;
  addCategory: (category: Category) => void;
  updateProduct: (product: Product) => void;
  updateUser: (user: User) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
}

export const useStore = create<Store>((set) => ({
  products: [],
  users: [
    {
      id: 'admin',
      username: 'admin',
      password: 'admin123',
      category: 'A',
      companyName: 'Admin',
      isAdmin: true,
    },
  ],
  categories: [
    { id: 'drinks', name: 'Drinks' },
    { id: 'main-dishes', name: 'Main Dishes' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'sides', name: 'Sides' },
  ],
  currentUser: null,
  setProducts: (products) => set({ products }),
  setUsers: (users) => set({ users }),
  setCategories: (categories) => set({ categories }),
  setCurrentUser: (user) => set({ currentUser: user }),
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),
  updateUser: (user) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? user : u)),
    })),
  updateCategory: (category) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === category.id ? category : c)),
    })),
  deleteCategory: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== categoryId),
    })),
}));