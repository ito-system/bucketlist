export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type Category =
  | "travel"
  | "adventure"
  | "learning"
  | "food"
  | "health"
  | "creative"
  | "social"
  | "other";

export type BucketItem = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: Category;
  imageURL?: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
