import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GOOGLE_VISION_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY");
const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!GOOGLE_VISION_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_VISION_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip data URL prefix if present
    const base64Content = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    const requestBody = {
      requests: [
        {
          image: { content: base64Content },
          features: [
            { type: "OBJECT_LOCALIZATION", maxResults: 5 },
            { type: "TEXT_DETECTION" },
            { type: "LABEL_DETECTION", maxResults: 5 },
          ],
          imageContext: {
            languageHints: ["pt-BR", "en"],
          },
        },
      ],
    };

    const visionResponse = await fetch(
      `${VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error("Google Vision API Error:", errorData);
      return new Response(
        JSON.stringify({ error: `Vision API failed [${visionResponse.status}]: ${JSON.stringify(errorData)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const visionData = await visionResponse.json();
    const response = visionData.responses?.[0];

    if (!response) {
      return new Response(
        JSON.stringify({ partDescription: "", details: "No response from Vision API" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Try text detection first (part codes, labels)
    let detectedText = "";
    if (response.textAnnotations?.length > 0) {
      // First annotation = full text block
      detectedText = response.textAnnotations[0].description?.trim() || "";
    }

    // 2. Object localization
    const objects = (response.localizedObjectAnnotations || [])
      .map((o: any) => o.name)
      .filter(Boolean);

    // 3. Label detection
    const labels = (response.labelAnnotations || [])
      .map((l: any) => l.description)
      .filter(Boolean);

    // Build best description: prefer text, then objects, then labels
    let partDescription = "";
    if (detectedText.length > 2) {
      // Take first meaningful line from detected text
      const firstLine = detectedText.split("\n").find((l: string) => l.trim().length > 2) || detectedText;
      partDescription = firstLine.trim().slice(0, 120);
    } else if (objects.length > 0) {
      partDescription = objects.slice(0, 3).join(", ");
    } else if (labels.length > 0) {
      partDescription = labels.slice(0, 3).join(", ");
    }

    return new Response(
      JSON.stringify({
        partDescription,
        detectedText: detectedText.slice(0, 300),
        objects,
        labels: labels.slice(0, 5),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing scan-part request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
