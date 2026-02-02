import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateProductDescription = async (name: string, category: string, lang: Language): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = lang === 'vi' 
      ? `Viết một mô tả quảng cáo ngắn gọn, hấp dẫn (tối đa 2 câu) cho sản phẩm tên "${name}" thuộc danh mục "${category}". Tập trung vào lợi ích và tính năng nổi bật.`
      : `Write a catchy, short marketing description (max 2 sentences) for a product named "${name}" in the category "${category}". Focus on benefits.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'vi' 
      ? "Lỗi khi tạo mô tả. Vui lòng kiểm tra API Key." 
      : "Error generating description. Please check API key.";
  }
};
