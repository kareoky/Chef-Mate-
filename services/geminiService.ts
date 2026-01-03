import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, RecipeTag, MealType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to generate an image for a specific recipe
const generateRecipeImage = async (title: string, description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional food photography of a dish called "${title}". Description: ${description}. High quality, delicious, cinematic lighting, 4k resolution, appetizing, restaurant style.`
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    
    // Fallback if no image data found
    return `https://picsum.photos/seed/${Date.now()}/400/300`;
  } catch (error) {
    console.warn("Image generation failed for", title, error);
    // Fallback to random image on error
    return `https://picsum.photos/seed/${Math.random()}/400/300`;
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
  
  // Cuisine Filters
  if (cuisineFilter && cuisineFilter !== 'all') {
    switch (cuisineFilter) {
      case 'egyptian': constraints += " يجب أن تكون الوصفات من المطبخ المصري الأصيل."; break;
      case 'saudi': constraints += " يجب أن تكون الوصفات من المطبخ السعودي (كبسة، جريش، قرصان، إلخ)."; break;
      case 'iraqi': constraints += " يجب أن تكون الوصفات من المطبخ العراقي (دولمة، مسكوف، إلخ)."; break;
      case 'turkish': constraints += " يجب أن تكون الوصفات من المطبخ التركي."; break;
      case 'italian': constraints += " يجب أن تكون الوصفات من المطبخ الإيطالي."; break;
      case 'chinese': constraints += " يجب أن تكون الوصفات من المطبخ الصيني."; break;
      case 'indian': constraints += " يجب أن تكون الوصفات من المطبخ الهندي الغني بالبهارات."; break;
      case 'levantine': constraints += " يجب أن تكون الوصفات من المطبخ الشامي (لبناني، سوري)."; break;
      default: constraints += ` ركز على وصفات من المطبخ ${cuisineFilter}.`; break;
    }
  } else {
    constraints += " نوع في الاقتراحات بين المطابخ العالمية والعربية.";
  }

  // Meal Type (Breakfast / Lunch / Dinner / Dessert)
  if (mealType === 'breakfast') {
    constraints += " يجب أن تكون جميع الوصفات مناسبة لوجبة الإفطار (فطار)، مثل أطباق البيض، الفول، المعجنات الصباحية، أو الأطباق الخفيفة.";
  } else if (mealType === 'lunch') {
    constraints += " يجب أن تكون الوصفات مناسبة لوجبة الغداء (أطباق رئيسية، طبخ، أرز، خضار، لحوم).";
  } else if (mealType === 'dinner') {
    constraints += " يجب أن تكون الوصفات مناسبة لوجبة العشاء (سواء أطباق خفيفة أو نواشف أو أطباق مناسبة للمساء).";
  } else if (mealType === 'dessert') {
    constraints += " يجب أن تكون الوصفات حلويات (شرقية أو غربية)، كيك، حلى بارد، أو مخبوزات حلوة.";
  } else {
     // Default fallback
     constraints += " يجب أن تكون الوصفات أطباق رئيسية.";
  }

  // Diet Constraint
  if (isDiet) {
    constraints += " هام جدًا: يجب أن تكون جميع الوصفات صحية، قليلة السعرات الحرارية، ومناسبة للرجيم (Diet Friendly).";
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
    throw new Error("فشل في جلب الاقتراحات من الذكاء الاصطناعي");
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
    throw new Error("فشل في جلب تفاصيل الوصفة");
  }
};

// Common helper to handle the API call and parsing
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
    
    // Generate Images for each recipe in parallel
    const recipesWithImages = await Promise.all(
      rawRecipes.map(async (r: any, index: number) => {
        // Generate a unique AI image for this recipe
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