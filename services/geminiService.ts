import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, RecipeTag, MealType } from "../types";

/**
 * Always use the API key from environment variables.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a highly accurate image for a specific recipe using Gemini.
 */
const generateRecipeImage = async (title: string, description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional food photography of the dish "${title}". ${description}. High resolution, 4k, delicious looking, cinematic lighting, restaurant plating, centered.`
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
    throw new Error("No image part found");
  } catch (error) {
    console.error(`Gemini Image Error for ${title}:`, error);
    // Use a clean placeholder only as a last resort
    return `https://placehold.co/800x600/1e293b/white?text=${encodeURIComponent(title)}`;
  }
};

export const suggestRecipesFromIngredients = async (
  ingredients: string[],
  cuisineFilter?: string,
  mealType?: MealType,
  isDiet?: boolean
): Promise<Recipe[]> => {
  const model = "gemini-3-flash-preview";
  
  let ingredientsText = ingredients.length > 0 
    ? `المكونات المتوفرة: ${ingredients.join(", ")}.` 
    : "اقترح وصفات عامة مشهورة.";

  let constraints = `المطبخ: ${cuisineFilter || 'عالمي'}. الوجبة: ${mealType || 'رئيسية'}. ${isDiet ? 'يجب أن تكون صحية ودايت.' : ''}`;

  const prompt = `أنت شيف محترف. ${ingredientsText} ${constraints} اقترح 5 وصفات بصيغة JSON.`;

  try {
    return await generateRecipesFromPrompt(prompt, model);
  } catch (error) {
    console.error("Gemini Text API Error:", error);
    throw new Error("فشل في جلب الوصفات. يرجى التحقق من اتصالك.");
  }
};

export const getRecipeByName = async (recipeName: string): Promise<Recipe[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `قدم طريقة عمل وصفة "${recipeName}" بالتفصيل بصيغة JSON داخل مصفوفة تحتوي على عنصر واحد.`;

  try {
    return await generateRecipesFromPrompt(prompt, model);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("فشل في جلب تفاصيل الوصفة.");
  }
};

const generateRecipesFromPrompt = async (prompt: string, model: string): Promise<Recipe[]> => {
    // 1. Get Recipe Details (Text)
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
              cuisine: { type: Type.STRING },
              cookingMethod: { type: Type.STRING },
              dietaryRestrictions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "ingredients", "steps", "prepTime", "calories", "tags"],
          },
        },
      },
    });

    const rawRecipes = JSON.parse(response.text || "[]");
    
    // 2. Generate Images SEQUENTIALLY to avoid Rate Limits (429)
    // Generating images one by one is safer and ensures quality
    const finalRecipes: Recipe[] = [];
    
    for (let i = 0; i < rawRecipes.length; i++) {
      const r = rawRecipes[i];
      const title = r.title || "وصفة شهية";
      const description = r.description || "وصفة لذيذة ومميزة";
      
      // Wait for Gemini to generate the image
      const aiImage = await generateRecipeImage(title, description);
      
      finalRecipes.push({
        id: `gen-${Date.now()}-${i}`,
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
      });
    }

    return finalRecipes;
};