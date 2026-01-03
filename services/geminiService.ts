
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, RecipeTag, MealType } from "../types";

// استخدام مفتاح البيئة مباشرة كما هو مطلوب
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * توليد صورة احترافية لكل وصفة بناءً على عنوانها ووصفها
 */
const generateRecipeImage = async (title: string, description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional food photography of the dish "${title}". Description: ${description}. High resolution, 4k, delicious, appetizing, restaurant plating, cinematic lighting.`
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
  } catch (error) {
    console.error(`Error generating image for ${title}:`, error);
    // رابط احتياطي في حالة الفشل التام فقط
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
  const model = "gemini-3-flash-preview";
  
  let ingredientsText = ingredients.length > 0 
    ? `المكونات المتوفرة لدي هي: ${ingredients.join(", ")}.` 
    : "اقترح عليّ أفضل الوصفات المشهورة.";

  let constraints = `نوع المطبخ: ${cuisineFilter || 'متنوع'}. نوع الوجبة: ${mealType || 'رئيسية'}. ${isDiet ? 'يجب أن تكون الوصفات صحية ومناسبة للدايت.' : ''}`;

  const prompt = `أنت شيف محترف ومساعد ذكي. ${ingredientsText} ${constraints}
  المطلوب: اقترح 5 وصفات عربية أو عالمية مميزة. 
  يجب أن يكون الرد بصيغة JSON حصراً وباللغة العربية الفصحى.`;

  return await generateRecipesFromPrompt(prompt, model);
};

/**
 * جلب تفاصيل وصفة معينة بالاسم
 */
export const getRecipeByName = async (recipeName: string): Promise<Recipe[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `أنت شيف محترف. قدم لي طريقة عمل وصفة "${recipeName}" بالتفصيل الممل مع المكونات والخطوات.
  يجب أن يكون الرد بصيغة JSON داخل مصفوفة تحتوي على عنصر واحد فقط باللغة العربية.`;

  return await generateRecipesFromPrompt(prompt, model);
};

/**
 * معالج طلبات Gemini لتحويل النصوص إلى وصفات وصور
 */
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
              title: { type: Type.STRING, description: "اسم الوصفة بالعربية" },
              description: { type: Type.STRING, description: "وصف جذاب للوصفة" },
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
              prepTime: { type: Type.NUMBER, description: "الوقت بالدقائق" },
              calories: { type: Type.NUMBER, description: "السعرات الحرارية" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              cuisine: { type: Type.STRING },
            },
            required: ["title", "description", "ingredients", "steps", "prepTime", "calories", "tags"],
          },
        },
      },
    });

    const rawRecipes = JSON.parse(response.text || "[]");
    
    // توليد الصور بالتتابع لضمان الجودة وعدم تجاوز حدود الـ API
    const finalRecipes: Recipe[] = [];
    for (let i = 0; i < rawRecipes.length; i++) {
      const r = rawRecipes[i];
      const title = r.title || "وصفة شهية";
      const description = r.description || "وصفة رائعة";
      
      const aiImage = await generateRecipeImage(title, description);
      
      finalRecipes.push({
        id: `recipe-${Date.now()}-${i}`,
        title: title,
        description: description,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        steps: Array.isArray(r.steps) ? r.steps : [],
        prepTime: r.prepTime || 20,
        calories: r.calories || 300,
        image: aiImage,
        tags: Array.isArray(r.tags) ? r.tags : [],
        cuisine: r.cuisine
      });
    }

    return finalRecipes;
};
