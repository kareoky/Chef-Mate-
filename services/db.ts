


import { Recipe, WeeklyPlan, Note } from '../types';

const DB_NAME = 'ChefMateDB';
const DB_VERSION = 2;
const STORE_RECIPES = 'recipes';
const STORE_PLAN = 'plan';
const STORE_NOTES = 'notes';

// Initialize the database
export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => resolve();

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_RECIPES)) {
        db.createObjectStore(STORE_RECIPES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PLAN)) {
        db.createObjectStore(STORE_PLAN);
      }
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
      }
    };
  });
};

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// --- Recipes ---

export const getAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_RECIPES, 'readonly');
      const store = transaction.objectStore(STORE_RECIPES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error getting recipes", e);
    return [];
  }
};

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_RECIPES, 'readwrite');
    const store = transaction.objectStore(STORE_RECIPES);
    const request = store.put(recipe);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteRecipeFromDB = async (id: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_RECIPES, 'readwrite');
    const store = transaction.objectStore(STORE_RECIPES);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- Plan ---

export const getSavedPlan = async (): Promise<WeeklyPlan | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PLAN, 'readonly');
      const store = transaction.objectStore(STORE_PLAN);
      const request = store.get('currentWeek');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return null;
  }
};

export const savePlanToDB = async (plan: WeeklyPlan): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PLAN, 'readwrite');
    const store = transaction.objectStore(STORE_PLAN);
    const request = store.put(plan, 'currentWeek');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- Notes ---

export const getAllNotes = async (): Promise<Note[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NOTES, 'readonly');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error getting notes", e);
    return [];
  }
};

export const saveNote = async (note: Note): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NOTES, 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    const request = store.put(note);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteNoteFromDB = async (id: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NOTES, 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
