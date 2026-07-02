export type OcrFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

const MaxBytes = 50 * 1024 * 1024;
const AllowedMime = /^(image\/(png|jpe?g|webp|gif|bmp|tiff?)|application\/pdf)$/i;
const AllowedExt = /\.(png|jpe?g|webp|gif|bmp|tiff?|pdf)$/i;

export async function RunOcr(file: OcrFile | undefined) {
  const valid = ValidateOcrFile(file);
  if (!valid.ok) return valid;
  if (!file) return { ok: false, status: 400, error: "Missing file field." };

  const provider = process.env.OCR_PROVIDER || "mistral";
  if (provider !== "mistral") {
    return { ok: false, status: 501, error: `OCR provider ${provider} is not implemented. Use OCR_PROVIDER=mistral.`, needsConfig: true };
  }

  if (!process.env.MISTRAL_API_KEY) {
    return { ok: false, status: 500, error: "MISTRAL_API_KEY is not configured.", needsConfig: true };
  }

  return RunMistralOcr(file);
}

function ValidateOcrFile(file: OcrFile | undefined) {
  if (!file) return { ok: false as const, status: 400, error: "Missing file field." };
  if (file.size === 0) return { ok: false as const, status: 400, error: "Empty file." };
  if (file.size > MaxBytes) {
    return { ok: false as const, status: 413, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max is 50 MB.` };
  }

  if (!AllowedMime.test(file.mimetype || "") && !AllowedExt.test(file.originalname || "")) {
    return { ok: false as const, status: 415, error: `Unsupported file type: ${file.mimetype || file.originalname || "unknown"}.` };
  }

  return { ok: true as const };
}

async function RunMistralOcr(file: OcrFile) {
  const baseUrl = process.env.MISTRAL_BASE_URL || "https://api.mistral.ai/v1";
  const dataUrl = `data:${file.mimetype || "application/octet-stream"};base64,${file.buffer.toString("base64")}`;
  const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
  const document = isPdf ? { type: "document_url", document_url: dataUrl } : { type: "image_url", image_url: dataUrl };

  const response = await fetch(`${baseUrl}/ocr`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-ocr-latest",
      document,
      include_image_base64: false,
    }),
  });

  if (!response.ok) {
    const detail = await ReadMistralError(response);
    return { ok: false, status: 502, error: `Mistral OCR failed: ${detail}` };
  }

  const json = (await response.json()) as { pages?: { markdown?: string }[] };
  const pages = Array.isArray(json.pages) ? json.pages : [];
  const text = pages.map((page) => page.markdown || "").join("\n\n").trim();

  if (!text) {
    return { ok: false, status: 422, error: "Mistral OCR returned empty text." };
  }

  return {
    ok: true,
    status: 200,
    text,
    pages: pages.length || 1,
    provider: "mistral",
    ocrUsed: true,
  };
}

async function ReadMistralError(response: Response) {
  try {
    const json = (await response.json()) as { message?: string; error?: { message?: string } };
    return json.message || json.error?.message || JSON.stringify(json).slice(0, 200);
  } catch {
    return `HTTP ${response.status}`;
  }
}
