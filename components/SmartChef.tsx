
import React, { useState, useRef, useEffect } from 'react';
import { ChefHat, Loader2, Plus, Sparkles, Sunrise, Sun, Moon, Leaf, Check, Edit2, Cake, Search, Refrigerator } from 'lucide-react';
import { Recipe, MealType } from '../types';
import RecipeCard from './RecipeCard';

interface SmartChefProps {
  suggestions: Recipe[];
  loading: boolean;
  error: string | null;
  onSuggest: (ingredients: string, cuisine: string, mealType: MealType, isDiet: boolean) => void;
  onSearchRecipe: (recipeName: string) => void;
  onAddRecipe: (recipe: Recipe) => void;
  onViewRecipe: (recipe: Recipe) => void;
  onAddToPlan: (recipe: Recipe) => void;
  userName: string;
  onUpdateName: (name: string) => void;
}

const CUISINES = [
  { id: 'all', name: 'الكل', flag: '🌍' },
  { id: 'egyptian', name: 'مصري', flag: '🇪🇬' },
  { id: 'saudi', name: 'سعودي', flag: '🇸🇦' },
  { id: 'iraqi', name: 'عراقي', flag: '🇮🇶' },
  { id: 'levantine', name: 'شامي', flag: '🌲' },
  { id: 'turkish', name: 'تركي', flag: '🇹🇷' },
  { id: 'italian', name: 'إيطالي', flag: '🇮🇹' },
  { id: 'chinese', name: 'صيني', flag: '🇨🇳' },
  { id: 'indian', name: 'هندي', flag: '🇮🇳' },
  { id: 'american', name: 'أمريكي', flag: '🇺🇸' },
];

const SmartChef: React.FC<SmartChefProps> = ({ 
  suggestions, 
  loading, 
  error, 
  onSuggest,
  onSearchRecipe, 
  onAddRecipe, 
  onViewRecipe,
  onAddToPlan,
  userName,
  onUpdateName
}) => {
  const [mode, setMode] = useState<'ingredients' | 'search'>('ingredients');

  const [ingredientsInput, setIngredientsInput] = useState('');
  const [recipeSearchInput, setRecipeSearchInput] = useState('');
  
  const [cuisine, setCuisine] = useState('all'); 
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [isDiet, setIsDiet] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Progress Bar Animation State
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Handle Progress Bar when loading starts
  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90; // Stall at 90%
          return prev + 1; // Increment
        });
      }, 150); // Duration approx 15s to reach 90%
    } else {
      if (progress > 0) {
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
      }
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSuggest = () => {
    if (mode === 'ingredients') {
      onSuggest(ingredientsInput, cuisine, mealType, isDiet);
    } else {
      if (recipeSearchInput.trim()) {
        onSearchRecipe(recipeSearchInput);
      }
    }
  };

  const handleNameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsEditingName(false);
    if (!userName.trim()) onUpdateName("المستخدم");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in pb-24">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-primary-500 to-primary-600 text-white rounded-full shadow-lg mb-4">
          <ChefHat size={32} />
        </div>
        
        <div className="flex items-center justify-center gap-2">
          {isEditingName ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-2">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">الشيف</span>
              <input
                ref={nameInputRef}
                type="text"
                value={userName}
                onChange={(e) => onUpdateName(e.target.value)}
                onBlur={() => handleNameSubmit()}
                className="text-3xl font-bold bg-transparent border-b-2 border-primary-500 text-primary-500 focus:outline-none w-40 text-center"
                placeholder="اسمك"
              />
            </form>
          ) : (
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              الشيف <span className="text-primary-500">{userName}</span>
              <Edit2 size={18} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h2>
          )}
        </div>

        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          مساعدك الذكي. يمكنني اقتراح وجبات من مكوناتك المتوفرة، أو إعطاؤك طريقة تحضير أي أكلة تخطر في بالك!
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        
        {/* Mode Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
           <button
             onClick={() => setMode('ingredients')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm md:text-base font-bold flex items-center justify-center gap-2 transition-all ${
               mode === 'ingredients'
                 ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                 : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
             }`}
           >
             <Refrigerator size={20} /> اقترح من المكونات
           </button>
           <button
             onClick={() => setMode('search')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm md:text-base font-bold flex items-center justify-center gap-2 transition-all ${
               mode === 'search'
                 ? 'bg-white dark:bg-slate-700 text-secondary-600 dark:text-secondary-400 shadow-sm'
                 : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
             }`}
           >
             <Search size={20} /> طريقة أكلة معينة
           </button>
        </div>

        {mode === 'ingredients' ? (
          /* --- MODE: INGREDIENTS --- */
          <div className="space-y-6 animate-fade-in">
            {/* Row 1: Meal Type & Diet Toggle */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Meal Type */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex-1 overflow-x-auto">
                <button 
                  onClick={() => setMealType('breakfast')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    mealType === 'breakfast' 
                    ? 'bg-white dark:bg-slate-700 text-orange-500 dark:text-orange-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Sunrise size={18} /> فطار
                </button>
                <button 
                  onClick={() => setMealType('lunch')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    mealType === 'lunch' 
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Sun size={18} /> غداء
                </button>
                <button 
                  onClick={() => setMealType('dinner')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    mealType === 'dinner' 
                    ? 'bg-white dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Moon size={18} /> عشاء
                </button>
                <button 
                  onClick={() => setMealType('dessert')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    mealType === 'dessert' 
                    ? 'bg-white dark:bg-slate-700 text-pink-500 dark:text-pink-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Cake size={18} /> تحلية
                </button>
              </div>

              {/* Diet Toggle */}
              <div 
                onClick={() => setIsDiet(!isDiet)}
                className={`cursor-pointer flex items-center justify-between gap-3 px-4 py-2 rounded-xl border-2 transition-all select-none flex-1 md:flex-none md:min-w-[200px] ${
                    isDiet 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <Leaf size={18} className={isDiet ? 'fill-current' : ''} />
                  <span>{isDiet ? 'أكل صحي / دايت' : 'أكل عادي'}</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isDiet ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {isDiet && <Check size={12} className="text-white" />}
                </div>
              </div>
            </div>

            {/* Row 2: Cuisine Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">اختر المطبخ</label>
              <div className="flex gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x">
                {CUISINES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCuisine(c.id)}
                    className={`snap-start flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 transition-all gap-1 ${
                      cuisine === c.id 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-md scale-105' 
                        : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-xs font-bold">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <input
              type="text"
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              placeholder="أدخل المكونات المتوفرة (اختياري)..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-lg font-medium text-slate-800 dark:text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
            />
          </div>
        ) : (
          /* --- MODE: SPECIFIC RECIPE --- */
          <div className="space-y-6 animate-fade-in py-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mb-1">نفسك في أكلة معينة؟</h3>
              <p className="text-sm text-slate-500">اكتب اسم الأكلة والشيف هيجبلك طريقتها بالتفصيل والصور!</p>
            </div>
             <input
              type="text"
              value={recipeSearchInput}
              onChange={(e) => setRecipeSearchInput(e.target.value)}
              placeholder="مثلاً: كشري مصري، بيتزا مارجريتا، تشيز كيك..."
              className="w-full p-6 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xl font-bold text-slate-800 dark:text-white shadow-inner"
              onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
              autoFocus
            />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSuggest}
          disabled={loading || (mode === 'search' && !recipeSearchInput.trim())}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-white relative overflow-hidden ${
             mode === 'ingredients'
              ? (mealType === 'breakfast'
                 ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                 : mealType === 'dessert'
                 ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                 : 'bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800')
              : 'bg-gradient-to-r from-secondary-500 to-secondary-600'
          }`}
        >
          {/* Progress Bar Background */}
          {loading && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          )}
          
          <div className="relative z-10 flex items-center gap-2">
             {loading ? <><Sparkles className="animate-pulse" size={20} /> جاري التجهيز {Math.round(progress)}%</> : (mode === 'ingredients' ? <><Sparkles size={20} /> اقترح الآن</> : <><Search size={20} /> ابحث عن الوصفة</>)}
          </div>
        </button>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-sm flex items-center gap-2 animate-fade-in">
             ⚠️ {error}
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className={mode === 'search' ? 'text-secondary-500' : 'text-primary-500'} size={20} />
             {mode === 'search' ? `طريقة عمل ${suggestions[0].title}` : `مقترحات الشيف ${userName}`}
             {mode === 'ingredients' && isDiet && <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full mr-2">صحي 🌿</span>}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((recipe) => (
              <div key={recipe.id} className="relative group">
                <RecipeCard 
                  recipe={recipe} 
                  onClick={() => onViewRecipe(recipe)}
                  onAddToPlan={onAddToPlan}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddRecipe(recipe);
                  }}
                  className="absolute bottom-3 left-3 bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 p-2 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-green-50 dark:hover:bg-slate-700 z-10 scale-90 hover:scale-100"
                  title="إضافة لمكتبتي"
                >
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartChef;
