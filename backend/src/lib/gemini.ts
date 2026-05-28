import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
   private genAI: GoogleGenerativeAI;
   private model: any;

   constructor() {
      // Initialize Google Generative AI client
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      
      // Load standard model config
      this.model = this.genAI.getGenerativeModel({
         model: "gemini-3.1-flash-lite-preview", // or custom model name if desired
      });
   }

   /**
    * Triggers structured prompt content generation using the Gemini API.
    */
   public async generate(contents: any[]) {
      return await this.model.generateContent(contents);
   }
}

// Export singleton instance of GeminiService
export const geminiService = new GeminiService();
