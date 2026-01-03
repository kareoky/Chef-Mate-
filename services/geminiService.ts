import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, RecipeTag, MealType } from "../types";

/**
 * CRITICAL: Always use the API key from environment variables.
 * On Netlify/Vite, this is injected via process.env.API_KEY.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper: Generate a high-quality fallback image URL for food
const getFallbackImage = (title: string, description: string) => {
  const prompt = encodeURIComponent(`professional food photography, dish: ${title}, ${description.slice(0, 40)}, high resolution, restaurant style, 4k`);
  const seed = Math.floor(Math.random() * 10000);
  return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&nologo=true&seed=${seed}&model=flux`;
};

/**
 * Generates image with Gemini 2.5 Flash Image.
 * Includes a timeout and error handling to switch to a high-quality fallback if API is busy (429) or fails.
 */
const generateRecipeImage = async (title: string, description: string): Promise<string> => {
  const timeout = new Promise<string>((_, reject) => 
    setTimeout(() => reject(new Error("Timeout")), 6000)
  );

  const geminiRequest = async (): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `Professional high-quality food photography of "${title}". ${description}. Appetizing, 4k, cinematic lighting.`
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
      throw new Error("No image generated");
    } catch (e) {
      throw e;
    }
  };

  try {
    return await Promise.race([geminiRequest(), timeout]);
  } catch (error) {
    // If Gemini fails (Rate limit 429, Expired key, or Timeout), use the high-quality Flux fallback
    return getFallbackImage(title, description);
  }
};

export const suggestRecipesFromIngredients = async (
  ingredients: string[],
  cuisineFilter?: string,
  mealType?: MealType,
  isDiet?: boolean
): Promise<Recipe[]> => {
  const model = "gemini-3-flash-preview"; // Using the latest recommended model for text
  
  let ingredientsText = ingredients.length > 0 
    ? `المكونات المتوفرة: ${ingredients.join(", ")}.` 
    : "اقترح وصفات مشهورة ولذيذة.";

  let constraints = "";
  if (cuisineFilter && cuisineFilter !== 'all') {
    constraints += ` يجب أن تكون الوصفات من المطبخ ${cuisineFilter}.`;
  }
  
  if (mealType) {
    constraints += ` الوجبة المطلوبة هي ${mealType}.`;
  }

  if (isDiet) {
    constraints += " يجب أن تكون الوصفات صحية ومنخفضة السعرات.";
  }

  const prompt = `أنت شيف محترف. ${ingredientsText} ${constraints} اقترح 5 وصفات متنوعة بصيغة JSON.`;

  try {
    return await generateRecipesFromPrompt(prompt, model);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("expired")) {
      throw new Error("عذراً، مفتاح الـ API الخاص بالتطبيق يحتاج لتجديد. يرجى مراجعة الإعدادات.");
    }
    throw new Error("فشل في جلب الاقتراحات. يرجى التأكد من مفتاح الـ API والاتصال بالإنترنت.");
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
    
    // Generate Images in parallel for faster experience
    const recipesWithImages = await Promise.all(
      rawRecipes.map(async (r: any, index: number) => {
        const title = r.title || "وصفة شهية";
        const description = r.description || "وصفة لذيذة ومميزة";
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