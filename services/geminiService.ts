import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, RecipeTag, MealType } from "../types";

// Initialize the Google GenAI client.
const getApiKey = () => {
  // @ts-ignore: Handle potential missing types for import.meta
  const meta = import.meta as any;
  if (meta && meta.env && meta.env.VITE_API_KEY) {
    return meta.env.VITE_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
  }
  return "AIzaSyCUDTITOiTycAlic2YxTOrDWrASMtTzofk";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// Function to generate image using Gemini (High Quality & Accurate)
const generateRecipeImage = async (title: string, description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional food photography of a dish called "${title}". The dish is: ${description}. High quality, delicious, cinematic lighting, 4k resolution, appetizing, restaurant style.`
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.warn("Gemini Image Generation Failed, using fallback placeholder");
    // Fallback to a generic placeholder only if Gemini completely fails
    return `https://placehold.co/800x600?text=${encodeURIComponent(title)}`;
  }
};

export const suggestRecipesFromIngredients = async (
  ingredients: string[],
  cuisineFilter?: string,
  mealType?: MealType,
  isDiet?: boolean
): Promise<Recipe[]> => {
  const model = "gemini-2.5-flash";
  
  let ingredientsText = "";
  if (ingredients.length > 0) {
    ingredientsText = `باستخدام المكونات التالية: ${ingredients.join(", ")} (ويمكن إضافة مكونات أساسية أخرى).`;
  } else {
    ingredientsText = "اقترح وصفات عامة ومشهورة.";
  }

  // Construct constraints based on filters
  let constraints = "";
  
  if (cuisineFilter && cuisineFilter !== 'all') {
    switch (cuisineFilter) {
      case 'egyptian': constraints += " يجب أن تكون الوصفات من المطبخ المصري الأصيل."; break;
      case 'saudi': constraints += " يجب أن تكون الوصفات من المطبخ السعودي."; break;
      case 'iraqi': constraints += " يجب أن تكون الوصفات من المطبخ العراقي."; break;
      case 'turkish': constraints += " يجب أن تكون الوصفات من المطبخ التركي."; break;
      case 'italian': constraints += " يجب أن تكون الوصفات من المطبخ الإيطالي."; break;
      case 'chinese': constraints += " يجب أن تكون الوصفات من المطبخ الصيني."; break;
      case 'indian': constraints += " يجب أن تكون الوصفات من المطبخ الهندي."; break;
      case 'levantine': constraints += " يجب أن تكون الوصفات من المطبخ الشامي."; break;
      default: constraints += ` ركز على وصفات من المطبخ ${cuisineFilter}.`; break;
    }
  } else {
    constraints += " نوع في الاقتراحات بين المطابخ العالمية والعربية.";
  }

  if (mealType === 'breakfast') {
    constraints += " يجب أن تكون جميع الوصفات مناسبة لوجبة الإفطار.";
  } else if (mealType === 'lunch') {
    constraints += " يجب أن تكون الوصفات مناسبة لوجبة الغداء.";
  } else if (mealType === 'dinner') {
    constraints += " يجب أن تكون الوصفات مناسبة لوجبة العشاء.";
  } else if (mealType === 'dessert') {
    constraints += " يجب أن تكون الوصفات حلويات.";
  } else {
     constraints += " يجب أن تكون الوصفات أطباق رئيسية.";
  }

  if (isDiet) {
    constraints += " هام جدًا: يجب أن تكون جميع الوصفات صحية، قليلة السعرات الحرارية، ومناسبة للرجيم.";
  } else {
    constraints += " الوصفات عادية (طعم أصلي) ولا يشترط أن تكون دايت.";
  }

  const prompt = `
    أنت شيف ذكي ومساعد محترف في المطبخ.
    ${ingredientsText}
    ${constraints}
    
    المطلوب: اقترح 5 وصفات مميزة وجذابة بدقة عالية.
    قم بالرد بصيغة JSON فقط.
  `;

  try {
    return await generateRecipesFromPrompt(prompt, model);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("فشل في جلب الاقتراحات. الشبكة ضعيفة أو الخدمة مشغولة.");
  }
};

export const getRecipeByName = async (recipeName: string): Promise<Recipe[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    أنت شيف محترف. المستخدم يريد معرفة طريقة عمل: "${recipeName}".
    
    المطلوب:
    1. قدم وصفة دقيقة ومفصلة لطبق "${recipeName}" بأفضل طريقة ممكنة.
    2. تأكد من ذكر جميع المكونات والخطوات بوضوح.
    3. إذا كان للطبق أنواع مختلفة، اختر الأشهر والألذ.
    
    قم بالرد بصيغة JSON تحتوي على عنصر واحد فقط داخل مصفوفة.
  `;

  try {
    return await generateRecipesFromPrompt(prompt, model);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("فشل في جلب تفاصيل الوصفة. تأكد من الاتصال.");
  }
};

// Common helper to handle the API call and parsing
const generateRecipesFromPrompt = async (prompt: string, model: string): Promise<Recipe[]> => {
    // 1. Generate Text (Recipe Details)
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "اسم الوصفة بالعربية" },
              description: { type: Type.STRING, description: "وصف قصير للطبق" },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING },
                  },
                },
              },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              prepTime: { type: Type.NUMBER, description: "وقت التحضير بالدقائق" },
              calories: { type: Type.NUMBER, description: "السعرات الحرارية التقريبية" },
              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "مثل: نباتي، دايت، سريع، اقتصادي، حلويات"
              },
              cuisine: { 
                type: Type.STRING, 
                description: "نوع المطبخ: مصري، سعودي، عراقي، إيطالي" 
              },
              cookingMethod: { 
                type: Type.STRING, 
                description: "طريقة الطهي" 
              },
              dietaryRestrictions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
              }
            },
            required: ["title", "description", "ingredients", "steps", "prepTime", "calories", "tags"],
          },
        },
      },
    });

    const rawRecipes = JSON.parse(response.text || "[]");
    
    // 2. Generate Images using Gemini (High Quality)
    // We iterate and wait for each image to ensure it's generated by Gemini
    const recipesWithImages = await Promise.all(
      rawRecipes.map(async (r: any, index: number) => {
        const title = r.title || "وصفة شهية";
        const description = r.description || "وصفة لذيذة ومميزة";
        
        // Call Gemini for the image
        const aiImage = await generateRecipeImage(title, description);
        
        return {
          id: `gen-${Date.now()}-${index}`,
          title: title,
          description: description,
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
          steps: Array.isArray(r.steps) ? r.steps : [],
          prepTime: r.prepTime || 15,
          calories: r.calories || 0,
          image: aiImage,
          tags: Array.isArray(r.tags) ? r.tags.map((t: string) => t as unknown as RecipeTag) : [],
          cuisine: r.cuisine,
          cookingMethod: r.cookingMethod,
          dietaryRestrictions: Array.isArray(r.dietaryRestrictions) ? r.dietaryRestrictions : []
        };
      })
    );

    return recipesWithImages;
};