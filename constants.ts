import { Recipe, RecipeTag, WeeklyPlan, CuisineType, CookingMethod, DietaryRestriction } from './types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'شكشوكة مصرية',
    description: 'طبق بيض بالطماطم والفلفل، وجبة إفطار كلاسيكية.',
    ingredients: [
      { name: 'بيض', amount: '4 حبات' },
      { name: 'طماطم', amount: '3 حبات' },
      { name: 'بصل', amount: '1 متوسطة' },
      { name: 'فلفل أخضر', amount: '1 حبة' }
    ],
    steps: ['قطع البصل والطماطم', 'شوح البصل حتى يذبل', 'أضف الطماطم واتركها تتسبك', 'أضف البيض وقلب حتى ينضج'],
    prepTime: 15,
    calories: 250,
    image: 'https://picsum.photos/seed/shakshuka/400/300',
    tags: [RecipeTag.Quick, RecipeTag.Economical, RecipeTag.Vegetarian],
    cuisine: CuisineType.Egyptian,
    cookingMethod: CookingMethod.Stove,
    dietaryRestrictions: [DietaryRestriction.GlutenFree, DietaryRestriction.Keto]
  },
  {
    id: '2',
    title: 'سلطة الدجاج المشوي',
    description: 'سلطة صحية مليئة بالبروتين ومناسبة للدايت.',
    ingredients: [
      { name: 'صدر دجاج', amount: '200 جرام' },
      { name: 'خس', amount: 'كوب' },
      { name: 'خيار', amount: '1 حبة' },
      { name: 'زيت زيتون', amount: 'ملعقة' }
    ],
    steps: ['تبل الدجاج واشويه', 'قطع الخضروات', 'اخلط المكونات مع زيت الزيتون والليمون'],
    prepTime: 20,
    calories: 350,
    image: 'https://picsum.photos/seed/salad/400/300',
    tags: [RecipeTag.Diet, RecipeTag.Quick],
    cuisine: CuisineType.International,
    cookingMethod: CookingMethod.Grilled,
    dietaryRestrictions: [DietaryRestriction.GlutenFree, DietaryRestriction.DairyFree, DietaryRestriction.Keto]
  },
  {
    id: '3',
    title: 'مكرونة بشاميل',
    description: 'طبق المكرونة الكلاسيكي باللحم المفروم وصوص البشاميل.',
    ingredients: [
      { name: 'مكرونة قلم', amount: '500 جرام' },
      { name: 'لحم مفروم', amount: '250 جرام' },
      { name: 'حليب', amount: '1 لتر' },
      { name: 'دقيق', amount: '4 ملاعق' }
    ],
    steps: ['اسلق المكرونة', 'عصج اللحم المفروم', 'حضر البشاميل', 'رص الطبقات وادخلها الفرن'],
    prepTime: 60,
    calories: 600,
    image: 'https://picsum.photos/seed/bechamel/400/300',
    tags: [RecipeTag.Main],
    cuisine: CuisineType.Egyptian,
    cookingMethod: CookingMethod.Baked
  }
];

export const DAYS_OF_WEEK = [
  { id: 'sat', name: 'السبت' },
  { id: 'sun', name: 'الأحد' },
  { id: 'mon', name: 'الاثنين' },
  { id: 'tue', name: 'الثلاثاء' },
  { id: 'wed', name: 'الأربعاء' },
  { id: 'thu', name: 'الخميس' },
  { id: 'fri', name: 'الجمعة' },
];

export const INITIAL_PLAN: WeeklyPlan = {};
DAYS_OF_WEEK.forEach(day => {
  INITIAL_PLAN[day.id] = {
    dayId: day.id,
    dayName: day.name,
    meals: { breakfast: null, lunch: null, dinner: null }
  };
});