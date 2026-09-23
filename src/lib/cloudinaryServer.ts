import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Initialize Cloudinary Server SDK with secure configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "rp8nsv0a";
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const configOptions: Record<string, any> = {
  cloud_name: cloudName,
  secure: true,
};

if (apiKey && apiSecret) {
  configOptions.api_key = apiKey;
  configOptions.api_secret = apiSecret;
  // @ts-ignore Cloudinary SDK signature_algorithm option
  configOptions.signature_algorithm = "sha256";
}

cloudinary.config(configOptions);

export { cloudinary };

/**
 * Signs request parameters using Cloudinary SDK official utility with SHA-256
 */
export function signCloudinaryRequest(paramsToSign: Record<string, any>): string {
  if (!apiSecret) return "";
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
}

/**
 * Uploads a file buffer directly to Cloudinary using the official Node SDK.
 * Supports signed uploads (when API Key & Secret are configured) and unsigned preset uploads.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    preset?: "FLOOR_PLAN" | "DEFAULT";
    uploadPreset?: string;
  } = {}
): Promise<CloudinaryUploadResult> {
  const isFloorPlan = options.preset === "FLOOR_PLAN";
  const folder = options.folder || (isFloorPlan ? "minhdungland/floor_plans" : "minhdungland/general");
  const defaultPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    "minhdungland";
  const floorPlanPreset =
    process.env.CLOUDINARY_FLOOR_PLAN_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_FLOOR_PLAN_PRESET ||
    defaultPreset;
  const uploadPreset = options.uploadPreset || (isFloorPlan ? floorPlanPreset : defaultPreset);

  return new Promise((resolve, reject) => {
    // If API Key & Secret exist -> use Authenticated Signed Upload
    // Otherwise fallback to unsigned upload preset
    if (apiKey && apiSecret) {
      const uploadOptions: Record<string, any> = {
        folder,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      };

      // Incoming transformation for floor plan: limit to max 1600px width, auto quality
      if (isFloorPlan) {
        uploadOptions.transformation = [
          { width: 1600, crop: "limit", quality: "auto" }
        ];
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload returned empty result"));
          }
          resolve({
            url: result.secure_url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      );

      uploadStream.end(buffer);
    } else {
      const uploadOptions: Record<string, any> = {
        folder,
        resource_type: "image",
      };

      const uploadStream = cloudinary.uploader.unsigned_upload_stream(
        uploadPreset,
        uploadOptions,
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload returned empty result"));
          }
          resolve({
            url: result.secure_url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      );

      uploadStream.end(buffer);
    }
  });
}

/**
 * Destroys an asset on Cloudinary by public_id (Rollback orphan asset).
 */
export async function destroyCloudinaryAsset(publicId: string): Promise<boolean> {
  if (!publicId) return false;
  if (!apiKey || !apiSecret) {
    console.warn(`[Cloudinary Rollback] Skipping rollback for asset ${publicId}: CLOUDINARY_API_KEY/SECRET not configured.`);
    return false;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return result.result === "ok";
  } catch (error) {
    console.warn(`[Cloudinary Rollback] Failed to destroy asset ${publicId}:`, error);
    return false;
  }
}

/**
 * Retrieves official usage metrics from Cloudinary Admin API.
 */
export async function getCloudinaryUsageMetrics() {
  if (!apiKey || !apiSecret) {
    return null;
  }
  try {
    const usage = await cloudinary.api.usage();
    return usage;
  } catch (error) {
    console.warn("[Cloudinary Server] Could not fetch usage via Admin API:", error);
    return null;
  }
}
