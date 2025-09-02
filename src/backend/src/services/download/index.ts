import { Elysia } from "elysia";
import { getCV } from "../cv/model";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import getConfig from "next/config";
import { errorResponse } from "../../../../shared";

const { CV_UPLOAD_DIR } = getConfig().serverRuntimeConfig;

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

// Simple, dedicated download service - NO AUTHENTICATION
export const downloadController = new Elysia({ prefix: "/download" })
  .get("/cv", async ({ set }) => {
    try {
      console.log("Download CV endpoint called");
      
      const cv = await getCV();
      console.log("CV data:", cv);

      if (!cv) {
        set.status = 404;
        set.headers = {
          "Access-Control-Allow-Origin": baseUrl || "*",
          "Access-Control-Allow-Methods": "GET",
        };
        return errorResponse("No CV found", "", 404);
      }

      // If CV has blobUrl, fetch and serve it
      if (cv && 'blobUrl' in cv && cv.blobUrl && typeof cv.blobUrl === 'string') {
        console.log("Using blob URL:", cv.blobUrl);
        try {
          const blobResponse = await fetch(cv.blobUrl);
          if (!blobResponse.ok) {
            throw new Error(`Failed to fetch blob: ${blobResponse.status}`);
          }

          const blobData = await blobResponse.arrayBuffer();
          
          set.headers = {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${cv.filename}"`,
            "Access-Control-Allow-Origin": baseUrl || "*",
            "Access-Control-Expose-Headers": "Content-Disposition",
          };

          return new Response(new Uint8Array(blobData));
        } catch (blobError) {
          console.error('Error fetching blob:', blobError);
          // Fall through to filesystem fallback
        }
      }

      // Fallback to filesystem
      console.log("Using filesystem fallback");
      const filePath = join(CV_UPLOAD_DIR, cv.filename);
      console.log("File path:", filePath);

      try {
        const fileBuffer = await readFile(filePath);
        
        set.headers = {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cv.filename}"`,
          "Access-Control-Allow-Origin": baseUrl || "*",
          "Access-Control-Expose-Headers": "Content-Disposition",
        };

        return new Response(new Uint8Array(fileBuffer));
      } catch (fileError) {
        console.error('Error reading file:', fileError);
        set.status = 404;
        return errorResponse("CV file not found", "", 404);
      }
    } catch (error) {
      console.error('Download CV error:', error);
      set.status = 500;
      return errorResponse("Internal server error", "", 500);
    }
  });