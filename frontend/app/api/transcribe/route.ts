import { NextResponse } from "next/server";

export async function POST(request: Request) {
   const apiKey = process.env.GROQ_API_KEY;
   if (!apiKey) {
      return NextResponse.json(
         { error: "GROQ_API_KEY not configured" },
         { status: 500 },
      );
   }

   const formData = await request.formData();
   const audioFile = formData.get("file");

   if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
         { error: "No audio file provided" },
         { status: 400 },
      );
   }

   const groqForm = new FormData();
   groqForm.append("file", audioFile, "recording.webm");
   groqForm.append("model", "whisper-large-v3-turbo");
   groqForm.append("response_format", "json");

   const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
         method: "POST",
         headers: {
            Authorization: `Bearer ${apiKey}`,
         },
         body: groqForm,
      },
   );

   if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
         { error: `Groq API error: ${error}` },
         { status: response.status },
      );
   }

   const data = await response.json();
   return NextResponse.json({ text: data.text });
}
