import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, RecipeTag, MealType } from "../types";

// التأكد من جلب المفتاح بشكل صحيح من بيئة العمل
const apiKey = process.env.API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * توليد صورة احترافية لكل وصفة بناءً على عنوانها ووصفها
 */
const generateRecipeImage = async (title: string, description: string): Promise<string> => {
  if (!ai) return `https://placehold.co/800x600/1e293b/white?text=${encodeURIComponent(title)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional food photography of "${title}". ${description}. High resolution, 4k, delicious, appetizing, restaurant plating, cinematic lighting.`
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data");
  } catch (error) {
    console.error(`Image Error for ${title}:`, error);
    // Fallback to a nice placeholder if AI generation fails
    return `https://placehold.co/800x600/1e293b/white?text=${encodeURIComponent(title)}`;
  }
};

/**
 * اقتراح وصفات بناءً على المكونات المتوفرة
 */
export const suggestRecipesFromIngredients = async (
  ingredients: string[],
  cuisineFilter?: string,
  mealType?: MealType,
  isDiet?: boolean
): Promise<Recipe[]> => {
  if (!ai) throw new Error("API Key is missing. Please check your configuration.");

  const model = "gemini-3-flash-preview";
  
  let ingredientsText = ingredients.length > 0 
    ? `المكونات المتوفرة: ${ingredients.join(", ")}.` 
    : "اقترح وصفات عامة مشهورة.";

  let constraints = `المطبخ: ${cuisineFilter || 'عالمي'}. الوجبة: ${mealType || 'رئيسية'}. ${isDiet ? 'يجب أن تكون صحية ودايت.' : ''}`;

  const prompt = `أنت شيف محترف. ${ingredientsText} ${constraints} 
  المطلوب: اقترح 5 وصفات بصيغة JSON باللغة العربية فقط. 
  تأكد أن أسماء الحقول في الـ JSON مطابقة تماماً لما يلي: title, description, ingredients, steps, prepTime, calories, tags, cuisine.`;

  return await generateRecipesFromPrompt(prompt, model);
};

/**
 * جلب تفاصيل وصفة معينة بالاسم
 */
export const getRecipeByName = async (recipeName: string): Promise<Recipe[]> => {
  if (!ai) throw new Error("API Key is missing.");

  const model = "gemini-3-flash-preview";
  const prompt = `قدم طريقة عمل وصفة "${recipeName}" بالتفصيل بصيغة JSON داخل مصفوفة تحتوي على عنصر واحد باللغة العربية.`;

  return await generateRecipesFromPrompt(prompt, model);
};

/**
 * معالج طلبات Gemini لتحويل النصوص إلى وصفات وصور بشكل متسلسل
 */
const generateRecipesFromPrompt = async (prompt: string, model: string): Promise<Recipe[]> => {
    if (!ai) return [];

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
              title: { type: Type.STRING },
              description: { type: Type.STRING },
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
              prepTime: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              cuisine: { type: Type.STRING }
            },
            required: ["title", "description", "ingredients", "steps", "prepTime", "calories", "tags"],
          },
        },
      },
    });

    const rawRecipes = JSON.parse(response.text || "[]");
    
    // توليد الصور بالتتابع لضمان الجودة وعدم تجاوز حدود الطلبات
    const finalRecipes: Recipe[] = [];
    for (let i = 0; i < rawRecipes.length; i++) {
      const r = rawRecipes[i];
      const aiImage = await generateRecipeImage(r.title, r.description);
      
      finalRecipes.push({
        id: `recipe-${Date.now()}-${i}`,
        title: r.title,
        description: r.description,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        steps: Array.isArray(r.steps) ? r.steps : [],
        prepTime: r.prepTime || 20,
        calories: r.calories || 0,
        image: aiImage,
        tags: Array.isArray(r.tags) ? r.tags : [],
        cuisine: r.cuisine
      });
    }

    return finalRecipes;
};