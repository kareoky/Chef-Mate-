
import React from 'react';
import { Calendar, Trash2, Moon, Sun, Sunrise } from 'lucide-react';
import { WeeklyPlan, Recipe, MealType, DayPlan } from '../types';

interface PlannerProps {
  plan: WeeklyPlan;
  recipes: Recipe[];
  onRemoveMeal: (dayId: string, type: MealType) => void;
  onDropMeal: (dayId: string, type: MealType, recipeId: string) => void;
  onRecipeClick: (recipe: Recipe) => void;
}

const MealSlot: React.FC<{
  dayId: string;
  type: MealType;
  recipeId: string | null;
  recipes: Recipe[];
  onRemove: () => void;
  onDropMeal: (recipeId: string) => void;
  onRecipeClick: (r: Recipe) => void;
  icon: React.ReactNode;
  label: string;
}> = ({ dayId, type, recipeId, recipes, onRemove, onDropMeal, onRecipeClick, icon, label }) => {
  
  const recipe = recipes.find(r => r.id === recipeId);
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const draggedRecipeId = e.dataTransfer.getData('recipeId');
    if (draggedRecipeId) {
      onDropMeal(draggedRecipeId);
    }
  };

  return (
    <div 
      className={`
        p-2 rounded-lg border border-dashed transition-all min-h-[100px] flex flex-col gap-2 relative group
        ${isOver 
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 scale-[1.02]' 
          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}
        ${recipe ? 'border-solid bg-white dark:bg-slate-800 border-green-100 dark:border-green-900/30 shadow-sm' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!recipe && (
        <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600 pointer-events-none">
          {icon}
          <span className="text-xs mt-1">{label}</span>
        </div>
      )}

      {recipe && (
        <>
          <div onClick={() => onRecipeClick(recipe)} className="cursor-pointer">
            <div className="h-16 w-full rounded-md overflow-hidden mb-1 relative">
               <img src={recipe.image} className="w-full h-full object-cover" alt="" />
               <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors"></div>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">{recipe.title}</p>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -left-2 z-10 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 hover:scale-110 transition-all active:scale-95"
            title="حذف الوجبة من الجدول"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  );
};

const Planner: React.FC<PlannerProps> = ({ plan, recipes, onRemoveMeal, onDropMeal, onRecipeClick }) => {
  
  const days = Object.values(plan) as DayPlan[];

  return (
    <div className="overflow-x-auto pb-6">
      <div className="min-w-[1000px]">
        <div className="grid grid-cols-8 gap-4 mb-4">
          <div className="col-span-1 pt-12 flex flex-col justify-between font-bold text-slate-400 dark:text-slate-500 text-sm pb-8">
            <div className="h-[100px] flex items-center justify-center gap-2"><Sunrise size={18}/> <span>فطور</span></div>
            <div className="h-[100px] flex items-center justify-center gap-2"><Sun size={18}/> <span>غداء</span></div>
            <div className="h-[100px] flex items-center justify-center gap-2"><Moon size={18}/> <span>عشاء</span></div>
          </div>
          
          {days.map((day) => (
            <div key={day.dayId} className="col-span-1 space-y-3">
              <div className="text-center font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                {day.dayName}
              </div>
              
              <MealSlot 
                dayId={day.dayId} 
                type="breakfast" 
                recipeId={day.meals.breakfast} 
                recipes={recipes}
                onRemove={() => onRemoveMeal(day.dayId, 'breakfast')}
                onDropMeal={(rId) => onDropMeal(day.dayId, 'breakfast', rId)}
                onRecipeClick={onRecipeClick}
                icon={<Sunrise size={20}/>}
                label="اسحب هنا"
              />
              
              <MealSlot 
                dayId={day.dayId} 
                type="lunch" 
                recipeId={day.meals.lunch} 
                recipes={recipes}
                onRemove={() => onRemoveMeal(day.dayId, 'lunch')}
                onDropMeal={(rId) => onDropMeal(day.dayId, 'lunch', rId)}
                onRecipeClick={onRecipeClick}
                icon={<Sun size={20}/>}
                label="اسحب هنا"
              />
              
              <MealSlot 
                dayId={day.dayId} 
                type="dinner" 
                recipeId={day.meals.dinner} 
                recipes={recipes}
                onRemove={() => onRemoveMeal(day.dayId, 'dinner')}
                onDropMeal={(rId) => onDropMeal(day.dayId, 'dinner', rId)}
                onRecipeClick={onRecipeClick}
                icon={<Moon size={20}/>}
                label="اسحب هنا"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planner;
