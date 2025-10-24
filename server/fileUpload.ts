import { storagePut } from "./storage";
import { randomBytes } from "crypto";

/**
 * Upload a file to S3 storage
 * @param fileBuffer - The file buffer
 * @param fileName - Original file name
 * @param mimeType - MIME type of the file
 * @returns Object with key and public URL
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ key: string; url: string }> {
  // Generate unique file name
  const timestamp = Date.now();
  const randomString = randomBytes(8).toString("hex");
  const extension = fileName.split(".").pop() || "bin";
  const uniqueFileName = `uploads/${timestamp}-${randomString}.${extension}`;

  // Upload to S3
  const result = await storagePut(uniqueFileName, fileBuffer, mimeType);
  
  return result;
}

/**
 * Upload multiple files to S3 storage
 * @param files - Array of file objects with buffer, name, and mimeType
 * @returns Array of objects with key and public URL
 */
export async function uploadMultipleFiles(
  files: Array<{ buffer: Buffer; name: string; mimeType: string }>
): Promise<Array<{ key: string; url: string }>> {
  const uploadPromises = files.map((file) =>
    uploadFile(file.buffer, file.name, file.mimeType)
  );

  return Promise.all(uploadPromises);
}

/**
 * Parse base64 data URL and upload to S3
 * @param dataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
 * @param fileName - Optional file name
 * @returns Object with key and public URL
 */
export async function uploadBase64Image(
  dataUrl: string,
  fileName?: string
): Promise<{ key: string; url: string }> {
  // Parse data URL
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid data URL format");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  // Generate file name if not provided
  const extension = mimeType.split("/")[1] || "bin";
  const name = fileName || `image-${Date.now()}.${extension}`;

  return uploadFile(buffer, name, mimeType);
}

