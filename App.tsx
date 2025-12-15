
import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ChefHat, ShoppingCart, Search, X, Filter, SlidersHorizontal, ChevronDown, ChevronUp, Check, CalendarPlus, Moon, Sun, Loader2, AlertCircle, LayoutGrid, List, AlignJustify, ArrowRight, NotebookPen, Share2 } from 'lucide-react';
import { Recipe, WeeklyPlan, MealType, RecipeTag, CuisineType, CookingMethod, DietaryRestriction, DayPlan, Note } from './types';
import { INITIAL_RECIPES, INITIAL_PLAN, DAYS_OF_WEEK } from './constants';
import RecipeCard from './components/RecipeCard';
import SmartChef from './components/SmartChef';
import Planner from './components/Planner';
import ShoppingList from './components/ShoppingList';
import NotesList from './components/NotesList';
import SplashScreen from './components/SplashScreen'; // Import SplashScreen
import { suggestRecipesFromIngredients, getRecipeByName } from './services/geminiService';
import { initDB, getAllRecipes, saveRecipe, deleteRecipeFromDB, getSavedPlan, savePlanToDB, getAllNotes, saveNote, deleteNoteFromDB } from './services/db';

// Helper to highlight active tab
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all flex-1 md:flex-none md:flex-row md:gap-2 md:px-5 md:py-3 ${
      active 
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300'
    }`}
  >
    {icon}
    <span className="text-[10px] md:text-sm font-bold mt-1 md:mt-0 text-center line-clamp-1 w-full">{label}</span>
  </button>
);

const FilterSection = ({ title, options, selected, onToggle, multi = false }: any) => (
  <div className="mb-4">
    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {options.map((opt: string) => {
        const isSelected = multi 
          ? selected.includes(opt) 
          : selected === opt;
          
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
              isSelected 
                ? 'bg-primary-50 text-primary-700 border-primary-200 font-bold shadow-sm dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  const bg = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? <Check size={18} /> : type === 'error' ? <AlertCircle size={18} /> : <div className="text-lg">ℹ️</div>;

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0 z-[100] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white ${bg} animate-slide-up`}>
      {icon}
      <span className="font-bold">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1">
        <X size={14} />
      </button>
    </div>
  );
};

// Welcome Modal Component
const WelcomeModal = ({ onSave }: { onSave: (name: string) => void }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg mb-6 text-white animate-bounce-slow">
             <ChefHat size={48} />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">مرحباً بك في Chef Mate!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">لنبدأ رحلة الطهي معاً.. بماذا نحب أن نناديك يا شيف؟</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك هنا..."
                className="w-full px-6 py-4 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-primary-500 focus:ring-0 outline-none transition-all dark:text-white placeholder:font-normal"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              ابدأ الطبخ الآن <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // --- Theme State & Persistence ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('chef_mate_theme');
      if (savedTheme === 'light') return false; // Only if explicitly light
      return true; // Default to Dark Mode
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chef_mate_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chef_mate_theme', 'light');
    }
  }, [isDarkMode]);

  // --- Splash Screen State ---
  const [showSplash, setShowSplash] = useState(true);

  // --- User Name State ---
  const [userName, setUserName] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('chef_mate_username');
    if (savedName) {
      setUserName(savedName);
    } else {
      // Don't show welcome immediately, wait for splash
      // logic handled in splash timeout
    }
  }, []);

  const handleSaveName = (name: string) => {
    setUserName(name);
    localStorage.setItem('chef_mate_username', name);
    setShowWelcome(false);
  };

  // --- Data State ---
  const [activeTab, setActiveTab] = useState<'recipes' | 'planner' | 'chef' | 'shop' | 'notes'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plan, setPlan] = useState<WeeklyPlan>(INITIAL_PLAN);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // View Mode for Recipes
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'minimal'>('grid');

  // Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // --- Initialize IndexedDB and Load Data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        await initDB();
        
        // Load Recipes
        const savedRecipes = await getAllRecipes();
        if (savedRecipes.length > 0) {
          setRecipes(savedRecipes);
        } else {
          setRecipes(INITIAL_RECIPES);
          INITIAL_RECIPES.forEach(r => saveRecipe(r));
        }

        // Load Plan
        const savedPlan = await getSavedPlan();
        if (savedPlan) {
          setPlan(savedPlan);
        } else {
          savePlanToDB(INITIAL_PLAN);
        }

        // Load Notes
        const savedNotes = await getAllNotes();
        setNotes(savedNotes.sort((a, b) => b.createdAt - a.createdAt));

      } catch (e) {
        console.error("Database initialization failed", e);
        setRecipes(prev => prev.length > 0 ? prev : INITIAL_RECIPES);
      } finally {
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // --- Splash Screen Timer ---
  useEffect(() => {
    const SPLASH_DURATION = 5000; // 5 seconds
    
    const timer = setTimeout(() => {
      setShowSplash(false);
      // Check for welcome modal AFTER splash
      if (!localStorage.getItem('chef_mate_username')) {
        setShowWelcome(true);
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Smart Chef State
  const [chefSuggestions, setChefSuggestions] = useState<Recipe[]>([]);
  const [isChefLoading, setIsChefLoading] = useState(false);
  const [chefError, setChefError] = useState<string | null>(null);

  // Mobile Planning Modal State
  const [planningRecipe, setPlanningRecipe] = useState<Recipe | null>(null);
  const [selectedPlanDay, setSelectedPlanDay] = useState<string>(DAYS_OF_WEEK[0].id);
  const [selectedPlanType, setSelectedPlanType] = useState<MealType>('lunch');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RecipeTag | 'all'>('all');
  
  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<CookingMethod | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<DietaryRestriction[]>([]);

  // --- Helper: Show Toast ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3000);
  };

  // --- Handlers ---

  const handleAddRecipe = async (newRecipe: Recipe) => {
    let duplicate = false;
    setRecipes(prev => {
      if (prev.some(r => r.id === newRecipe.id || r.title === newRecipe.title)) {
        duplicate = true;
        return prev;
      }
      return [newRecipe, ...prev];
    });

    if (duplicate) {
      showToast('الوصفة موجودة بالفعل في مكتبتك', 'info');
      return;
    }

    try {
      await saveRecipe(newRecipe);
      showToast('تم حفظ الوصفة بنجاح', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء حفظ الوصفة', 'error');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوصفة؟')) return;

    setRecipes(prev => prev.filter(r => r.id !== id));
    try {
      await deleteRecipeFromDB(id);
      showToast('تم حذف الوصفة', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل حذف الوصفة', 'error');
    }
  };

  const handleShareRecipe = async (recipe: Recipe) => {
    const text = `
🍽️ *${recipe.title}*
${recipe.description}

🛒 *المكونات:*
${recipe.ingredients.map(i => `- ${i.name}: ${i.amount}`).join('\n')}

👨‍🍳 *الخطوات:*
${recipe.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}

⚡ السعرات: ${recipe.calories} | ⏱️ الوقت: ${recipe.prepTime} دقيقة

تم الارسال من تطبيق Chef Mate 👨‍🍳
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: text,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast('تم نسخ الوصفة للحافظة', 'success');
    }
  };

  const handleSuggest = async (ingredients: string, cuisine: string, mealType: MealType, isDiet: boolean) => {
    setIsChefLoading(true);
    setChefError(null);
    try {
      const results = await suggestRecipesFromIngredients(
        ingredients ? ingredients.split(',').map(i => i.trim()) : [],
        cuisine,
        mealType,
        isDiet
      );
      setChefSuggestions(results);
    } catch (err) {
      setChefError('حدث خطأ أثناء الاتصال بالشيف الذكي. حاول مرة أخرى.');
    } finally {
      setIsChefLoading(false);
    }
  };

  const handleSearchRecipe = async (recipeName: string) => {
    setIsChefLoading(true);
    setChefError(null);
    try {
      const results = await getRecipeByName(recipeName);
      setChefSuggestions(results);
    } catch (err) {
      setChefError('لم أتمكن من العثور على الوصفة. تأكد من الاسم وحاول مرة أخرى.');
    } finally {
      setIsChefLoading(false);
    }
  };

  // --- Planning Handlers ---
  const handleDropMeal = async (dayId: string, type: MealType, recipeId: string) => {
    setPlan(prev => {
      const newPlan = {
        ...prev,
        [dayId]: {
          ...prev[dayId],
          meals: {
            ...prev[dayId].meals,
            [type]: recipeId
          }
        }
      };
      savePlanToDB(newPlan);
      return newPlan;
    });
    showToast('تم تحديث الجدول', 'success');
  };

  const handleRemoveMeal = async (dayId: string, type: MealType) => {
    setPlan(prev => {
      const newPlan = {
        ...prev,
        [dayId]: {
          ...prev[dayId],
          meals: {
            ...prev[dayId].meals,
            [type]: null
          }
        }
      };
      savePlanToDB(newPlan);
      return newPlan;
    });
  };

  const handleAddToPlan = (recipe: Recipe) => {
    setPlanningRecipe(recipe);
  };

  const confirmAddToPlan = () => {
    if (planningRecipe) {
      handleDropMeal(selectedPlanDay, selectedPlanType, planningRecipe.id);
      setPlanningRecipe(null);
    }
  };

  // --- Notes Handlers ---
  const handleAddNote = async (text: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
    await saveNote(newNote);
    showToast('تمت إضافة الملاحظة', 'success');
  };

  const handleToggleNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      const updated = { ...note, completed: !note.completed };
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      await saveNote(updated);
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await deleteNoteFromDB(id);
    showToast('تم حذف الملاحظة', 'info');
  };

  // --- Filter Logic ---
  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.ingredients.some(i => i.name.includes(searchQuery));
    const matchesTag = activeFilter === 'all' || r.tags.includes(activeFilter);
    const matchesCuisine = !selectedCuisine || r.cuisine === selectedCuisine;
    const matchesMethod = !selectedMethod || r.cookingMethod === selectedMethod;
    const matchesDietary = selectedDietary.length === 0 || selectedDietary.every(d => r.dietaryRestrictions?.includes(d));

    return matchesSearch && matchesTag && matchesCuisine && matchesMethod && matchesDietary;
  });

  const toggleDietary = (d: DietaryRestriction) => {
    setSelectedDietary(prev => 
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  // --- RENDER SPLASH SCREEN ---
  // Show splash if showSplash is true, regardless of data loading state (to enforce 5s duration)
  if (showSplash) {
    return <SplashScreen duration={5000} />;
  }
  
  // If splash is done but data is still loading (unlikely with 5s wait, but possible), show simple loader
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col gap-4">
        <Loader2 className="animate-spin text-primary-500" size={48} />
        <p className="animate-pulse">جاري تحميل مطبخك...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 animate-fade-in">
      
      {/* Welcome Modal */}
      {showWelcome && <WelcomeModal onSave={handleSaveName} />}

      {/* Header Desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
               أهلاً شيف {userName || 'المستقبلي'}
            </h1>
          </div>

          <nav className="flex items-center gap-2">
             <TabButton active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} icon={<BookOpen size={20} />} label="وصفاتي" />
             <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<Calendar size={20} />} label="الجدول" />
             <TabButton 
               active={activeTab === 'chef'} 
               onClick={() => setActiveTab('chef')} 
               icon={<ChefHat size={20} />} 
               label={userName ? `شيف ${userName}` : 'الشيف الذكي'} 
             />
             <TabButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<ShoppingCart size={20} />} label="التسوق" />
             <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<NotebookPen size={20} />} label="ملاحظات" />
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-primary-500 cursor-pointer" onClick={() => setShowWelcome(true)} title="تغيير الاسم">
              {userName ? userName.charAt(0) : '?'}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white">
              <ChefHat size={18} />
            </div>
            <h1 className="font-bold text-lg">أهلاً شيف {userName}</h1>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2">
           {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 min-h-[calc(100vh-140px)]">
        
        {/* VIEW: MY RECIPES */}
        {activeTab === 'recipes' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="ابحث عن وصفة أو مكون..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${activeFilter === 'all' ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                >
                  الكل
                </button>
                {Object.values(RecipeTag).map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setActiveFilter(tag)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${activeFilter === tag ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${showAdvancedFilters ? 'text-primary-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                <Filter size={16} /> تصفية متقدمة {showAdvancedFilters ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </button>

              {/* View Toggle */}
              <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                 <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}><LayoutGrid size={18}/></button>
                 <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}><List size={18}/></button>
                 <button onClick={() => setViewMode('minimal')} className={`p-1.5 rounded ${viewMode === 'minimal' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}><AlignJustify size={18}/></button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-down">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2"><SlidersHorizontal size={18}/> خيارات التصفية</h3>
                    <button onClick={() => {setSelectedCuisine(null); setSelectedMethod(null); setSelectedDietary([]);}} className="text-xs text-red-500 hover:underline">إعادة تعيين</button>
                 </div>
                 
                 <FilterSection 
                   title="نوع المطبخ" 
                   options={Object.values(CuisineType)} 
                   selected={selectedCuisine} 
                   onToggle={(val: CuisineType) => setSelectedCuisine(selectedCuisine === val ? null : val)} 
                 />
                 
                 <FilterSection 
                   title="طريقة الطهي" 
                   options={Object.values(CookingMethod)} 
                   selected={selectedMethod} 
                   onToggle={(val: CookingMethod) => setSelectedMethod(selectedMethod === val ? null : val)} 
                 />

                 <FilterSection 
                   title="قيود غذائية" 
                   options={Object.values(DietaryRestriction)} 
                   selected={selectedDietary} 
                   onToggle={toggleDietary}
                   multi={true}
                 />
              </div>
            )}

            {/* Recipe Grid */}
            <div className={`
               ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : ''}
               ${viewMode === 'list' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}
               ${viewMode === 'minimal' ? 'flex flex-col gap-2' : ''}
            `}>
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    onClick={() => setSelectedRecipe(recipe)}
                    onDelete={() => handleDeleteRecipe(recipe.id)}
                    onAddToPlan={handleAddToPlan}
                    onShare={handleShareRecipe}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('recipeId', recipe.id)}
                    viewMode={viewMode}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center">
                   <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                     <Search size={32} />
                   </div>
                   <p className="text-lg font-medium">لم يتم العثور على وصفات</p>
                   <p className="text-sm">جرب تغيير كلمات البحث أو اطلب من الشيف اقتراح وصفات جديدة!</p>
                   <button onClick={() => setActiveTab('chef')} className="mt-4 text-primary-500 font-bold hover:underline">
                     الذهاب للشيف الذكي &larr;
                   </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: PLANNER */}
        {activeTab === 'planner' && (
           <div className="animate-fade-in">
             <div className="mb-6">
               <h2 className="text-2xl font-bold mb-2">جدول الوجبات الأسبوعي</h2>
               <p className="text-slate-500 dark:text-slate-400">خطط لوجباتك بسهولة عن طريق سحب وإفلات الوصفات.</p>
             </div>
             <Planner 
               plan={plan} 
               recipes={recipes} 
               onRemoveMeal={handleRemoveMeal}
               onDropMeal={handleDropMeal}
               onRecipeClick={(r) => setSelectedRecipe(r)}
             />
             
             {/* Draggable Recipes Sidebar for Desktop */}
             <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen size={20}/> وصفاتك (اسحب للجدول)</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {recipes.slice(0, 10).map(r => (
                    <div key={r.id} className="min-w-[200px] w-[200px]">
                      <RecipeCard 
                         recipe={r} 
                         onClick={() => setSelectedRecipe(r)} 
                         draggable={true}
                         onDragStart={(e) => e.dataTransfer.setData('recipeId', r.id)}
                         viewMode="grid"
                      />
                    </div>
                  ))}
                </div>
             </div>
           </div>
        )}

        {/* VIEW: SMART CHEF */}
        {activeTab === 'chef' && (
          <SmartChef 
            suggestions={chefSuggestions} 
            loading={isChefLoading} 
            error={chefError} 
            onSuggest={handleSuggest}
            onSearchRecipe={handleSearchRecipe}
            onAddRecipe={handleAddRecipe}
            onViewRecipe={setSelectedRecipe}
            onAddToPlan={handleAddToPlan}
            userName={userName}
            onUpdateName={handleSaveName}
          />
        )}

        {/* VIEW: SHOPPING LIST */}
        {activeTab === 'shop' && (
          <div className="animate-fade-in pt-4">
            <ShoppingList plan={plan} recipes={recipes} />
          </div>
        )}

        {/* VIEW: NOTES */}
        {activeTab === 'notes' && (
          <div className="animate-fade-in pt-4">
            <NotesList 
              notes={notes}
              onAdd={handleAddNote}
              onToggle={handleToggleNote}
              onDelete={handleDeleteNote}
            />
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe">
        <div className="flex justify-around items-center p-2">
          <TabButton active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} icon={<BookOpen size={24} />} label="وصفاتي" />
          <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<Calendar size={24} />} label="الجدول" />
          <TabButton 
            active={activeTab === 'chef'} 
            onClick={() => setActiveTab('chef')} 
            icon={<ChefHat size={24} />} 
            label={userName ? `شيف ${userName}` : 'الشيف'} 
          />
          <TabButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<ShoppingCart size={24} />} label="التسوق" />
          <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<NotebookPen size={24} />} label="ملاحظات" />
        </div>
      </nav>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedRecipe(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="absolute top-4 left-4 z-10 flex gap-2">
               <button 
                onClick={() => handleShareRecipe(selectedRecipe)}
                className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                title="مشاركة"
               >
                <Share2 size={20} />
               </button>
               <button 
                onClick={() => setSelectedRecipe(null)} 
                className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                title="إغلاق"
               >
                <X size={20} />
               </button>
            </div>
            
            <div className="h-64 relative">
              <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 right-0 p-6 text-white w-full">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {selectedRecipe.tags.map(t => <span key={t} className="bg-white/20 backdrop-blur px-2 py-0.5 rounded-lg text-xs font-bold">{t}</span>)}
                </div>
                <h2 className="text-3xl font-bold mb-1">{selectedRecipe.title}</h2>
                <div className="flex items-center gap-4 text-sm opacity-90">
                   <span>⏱️ {selectedRecipe.prepTime} دقيقة</span>
                   <span>🔥 {selectedRecipe.calories} سعرة</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{selectedRecipe.description}</p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                   <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-primary-500 rounded-full"></div> المكونات</h3>
                   <ul className="space-y-3">
                     {selectedRecipe.ingredients.map((ing, i) => (
                       <li key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                         <span className="font-medium">{ing.name}</span>
                         <span className="text-primary-600 dark:text-primary-400 font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-sm text-sm">{ing.amount}</span>
                       </li>
                     ))}
                   </ul>
                </div>

                <div>
                   <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-secondary-500 rounded-full"></div> الخطوات</h3>
                   <ol className="space-y-4">
                     {selectedRecipe.steps.map((step, i) => (
                       <li key={i} className="flex gap-4">
                         <div className="flex-shrink-0 w-8 h-8 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 rounded-full flex items-center justify-center font-bold text-sm">
                           {i + 1}
                         </div>
                         <p className="text-slate-700 dark:text-slate-300 pt-1">{step}</p>
                       </li>
                     ))}
                   </ol>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => {
                    handleAddToPlan(selectedRecipe);
                    setSelectedRecipe(null);
                  }}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <CalendarPlus size={20} /> إضافة للجدول
                </button>
                {/* Only show Add to Library if it's not already in recipes */}
                {!recipes.some(r => r.id === selectedRecipe.id) && (
                   <button 
                     onClick={() => {
                       handleAddRecipe(selectedRecipe);
                       setSelectedRecipe(null);
                     }}
                     className="flex-1 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                   >
                     <BookOpen size={20} /> حفظ في مكتبتي
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Selection Modal (Mobile/Action) */}
      {planningRecipe && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4 animate-slide-up">
            <h3 className="text-xl font-bold text-center mb-4">إضافة "{planningRecipe.title}" للجدول</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">اليوم</label>
                <div className="grid grid-cols-4 gap-2">
                   {DAYS_OF_WEEK.map(d => (
                     <button 
                       key={d.id} 
                       onClick={() => setSelectedPlanDay(d.id)}
                       className={`p-2 rounded-lg text-sm font-bold transition-all ${selectedPlanDay === d.id ? 'bg-primary-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                     >
                       {d.name}
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">الوجبة</label>
                <div className="flex gap-2">
                   {['breakfast', 'lunch', 'dinner'].map(t => (
                     <button
                       key={t}
                       onClick={() => setSelectedPlanType(t as MealType)}
                       className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all ${selectedPlanType === t ? 'bg-secondary-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                     >
                       {t === 'breakfast' ? 'فطور' : t === 'lunch' ? 'غداء' : 'عشاء'}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setPlanningRecipe(null)} 
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmAddToPlan} 
                className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20"
              >
                تأكيد الإضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  );
};

export default App;
