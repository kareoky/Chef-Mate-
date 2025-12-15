import React from 'react';
import { Clock, Flame, Utensils, Trash2, CalendarPlus, Share2 } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, recipeId: string) => void;
  onDelete?: () => void;
  onAddToPlan?: (recipe: Recipe) => void;
  onShare?: (recipe: Recipe) => void;
  viewMode?: 'grid' | 'list' | 'minimal';
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onClick, 
  draggable, 
  onDragStart, 
  onDelete, 
  onAddToPlan,
  onShare,
  viewMode = 'grid' 
}) => {
  
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, recipe.id);
    }
    e.dataTransfer.effectAllowed = 'copy';
  };

  // --- GRID VIEW (Default) ---
  if (viewMode === 'grid') {
    return (
      <div 
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full ${draggable ? 'active:cursor-grabbing' : ''} group relative`}
        onClick={onClick}
        draggable={draggable}
        onDragStart={handleDragStart}
      >
        <div className="relative h-40 overflow-hidden bg-slate-200 dark:bg-slate-700">
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            loading="lazy"
          />
          
          <div className="absolute top-2 left-2 z-10 flex gap-2">
            {onAddToPlan && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToPlan(recipe); }}
                className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-full text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 shadow-sm transition-all scale-95 hover:scale-105"
                title="إضافة للجدول"
              >
                <CalendarPlus size={16} />
              </button>
            )}
            {onShare && (
              <button
                onClick={(e) => { e.stopPropagation(); onShare(recipe); }}
                className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-full text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 shadow-sm transition-all scale-95 hover:scale-105"
                title="مشاركة الوصفة"
              >
                <Share2 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 shadow-sm transition-all opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
                title="حذف الوصفة"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="absolute top-2 right-2 flex gap-1 flex-wrap pl-16 pointer-events-none">
            {recipe.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full text-slate-700 dark:text-slate-200 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 line-clamp-1">{recipe.title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3 flex-grow">{recipe.description}</p>
          
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-auto pt-3 border-t border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{recipe.prepTime} دقيقة</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame size={14} />
              <span>{recipe.calories} سعرة</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <div 
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-row h-40 ${draggable ? 'active:cursor-grabbing' : ''} group relative`}
        onClick={onClick}
        draggable={draggable}
        onDragStart={handleDragStart}
      >
        {/* Image Section */}
        <div className="relative w-48 shrink-0 bg-slate-200 dark:bg-slate-700">
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
           <div className="absolute top-2 left-2 z-10 flex gap-2">
            {onAddToPlan && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToPlan(recipe); }}
                className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full text-blue-500 dark:text-blue-400 hover:bg-blue-50 shadow-sm scale-90"
              >
                <CalendarPlus size={14} />
              </button>
            )}
             {onShare && (
              <button
                onClick={(e) => { e.stopPropagation(); onShare(recipe); }}
                className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 shadow-sm scale-90"
              >
                <Share2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{recipe.title}</h3>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{recipe.description}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1"><Clock size={14} /> <span>{recipe.prepTime} دقيقة</span></div>
               <div className="flex items-center gap-1"><Flame size={14} /> <span>{recipe.calories} سعرة</span></div>
            </div>
            <div className="flex gap-1">
              {recipe.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MINIMAL VIEW ---
  if (viewMode === 'minimal') {
    return (
      <div 
        className={`bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer ${draggable ? 'active:cursor-grabbing' : ''}`}
        onClick={onClick}
        draggable={draggable}
        onDragStart={handleDragStart}
      >
        <div className="flex items-center gap-3 overflow-hidden">
             <div className="w-10 h-10 rounded-md bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
             </div>
             <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{recipe.title}</h3>
                <div className="flex gap-2 text-xs text-slate-400">
                    <span>{recipe.prepTime} دقيقة</span>
                    <span>•</span>
                    <span>{recipe.calories} سعرة</span>
                </div>
             </div>
        </div>
        
        <div className="flex items-center gap-2">
           {onAddToPlan && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToPlan(recipe); }}
                className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full"
                title="إضافة للجدول"
              >
                <CalendarPlus size={16} />
              </button>
            )}
             {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-red-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full"
                title="حذف"
              >
                <Trash2 size={16} />
              </button>
            )}
        </div>
      </div>
    );
  }

  return null;
};

export default RecipeCard;