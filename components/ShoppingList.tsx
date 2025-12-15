
import React, { useMemo, useState } from 'react';
import { CheckSquare, ShoppingCart, Printer, Check } from 'lucide-react';
import { Recipe, WeeklyPlan, DayPlan } from '../types';

interface ShoppingListProps {
  plan: WeeklyPlan;
  recipes: Recipe[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ plan, recipes }) => {
  
  // Group by Recipe instead of flattening ingredients
  const groupedList = useMemo(() => {
    const groups: { recipe: Recipe; count: number }[] = [];
    const recipeCounts: Record<string, number> = {};

    (Object.values(plan) as DayPlan[]).forEach(day => {
      (['breakfast', 'lunch', 'dinner'] as const).forEach(type => {
        const rId = day.meals[type];
        if (rId) {
          recipeCounts[rId] = (recipeCounts[rId] || 0) + 1;
        }
      });
    });

    Object.entries(recipeCounts).forEach(([rId, count]) => {
      const recipe = recipes.find(r => r.id === rId);
      if (recipe) {
        groups.push({ recipe, count });
      }
    });

    return groups;
  }, [plan, recipes]);

  // State to track checked items (format: "recipeId-ingredientIndex")
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (groupedList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600 animate-fade-in">
        <ShoppingCart size={64} className="mb-4 opacity-20" />
        <h3 className="text-xl font-bold mb-2">القائمة فارغة</h3>
        <p>قم بإضافة وجبات إلى الجدول الأسبوعي لتوليد قائمة التسوق.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-slide-up">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-20 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CheckSquare className="text-primary-500" />
            قائمة التسوق
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
             مجمعة حسب الوجبات ({groupedList.length} وصفات)
          </p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300 flex items-center gap-2 font-bold text-sm shadow-sm"
          title="طباعة"
        >
          <Printer size={18} /> طباعة
        </button>
      </div>
      
      <div className="space-y-6">
        {groupedList.map(({ recipe, count }) => (
          <div key={recipe.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group">
            
            {/* Meal Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 shadow-sm">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{recipe.title}</h3>
                {count > 1 && (
                  <span className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs px-2 py-0.5 rounded-lg mt-1 font-bold">
                    مكررة {count} مرات في الجدول
                  </span>
                )}
              </div>
            </div>

            {/* Ingredients List */}
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {recipe.ingredients.map((ing, idx) => {
                const itemId = `${recipe.id}-${idx}`;
                const isChecked = checkedItems[itemId];
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleItem(itemId)}
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                      isChecked ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                      isChecked 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-primary-400'
                    }`}>
                      {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                    
                    <div className={`flex-1 flex justify-between items-center gap-4 ${isChecked ? 'opacity-40 grayscale' : ''}`}>
                      <span className={`font-medium text-slate-700 dark:text-slate-200 transition-all ${isChecked ? 'line-through' : ''}`}>
                        {ing.name}
                      </span>
                      <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg shrink-0">
                        {ing.amount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;
