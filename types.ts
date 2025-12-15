

export interface Ingredient {
  name: string;
  amount: string;
}

export enum RecipeTag {
  Vegetarian = 'نباتي',
  Diet = 'دايت',
  Quick = 'سريع',
  Economical = 'اقتصادي',
  Dessert = 'تحلية',
  Main = 'رئيسي'
}

export enum CuisineType {
  Egyptian = 'مصري',
  Saudi = 'سعودي',
  Iraqi = 'عراقي',
  Levantine = 'شامي',
  Turkish = 'تركي',
  Italian = 'إيطالي',
  Asian = 'آسيوي',
  Chinese = 'صيني',
  Indian = 'هندي',
  American = 'أمريكي',
  International = 'عالمي',
  Other = 'أخرى'
}

export enum DietaryRestriction {
  GlutenFree = 'خالي من الجلوتين',
  DairyFree = 'خالي من الألبان',
  Vegan = 'نباتي صرف',
  Keto = 'كيتو'
}

export enum CookingMethod {
  Grilled = 'مشوي',
  Fried = 'مقلي',
  Baked = 'مخبوز',
  Boiled = 'مسلوق',
  Stove = 'على البوتاجاز',
  SlowCooked = 'طهي بطيء'
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number; // in minutes
  calories: number;
  image?: string;
  tags: RecipeTag[];
  cuisine?: CuisineType;
  dietaryRestrictions?: DietaryRestriction[];
  cookingMethod?: CookingMethod;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'dessert';

export interface DayPlan {
  dayId: string; // e.g., 'monday'
  dayName: string; // e.g., 'الاثنين'
  meals: {
    breakfast: string | null; // Recipe ID
    lunch: string | null;
    dinner: string | null;
  };
}

export interface WeeklyPlan {
  [key: string]: DayPlan;
}

export interface Note {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}