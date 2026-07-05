// Import Express Router to create route endpoints/so this file can define API routes.
import { Router } from "express";

// Import helper function to safely format AI/service errors
// Converts errors into safe messages
import { ReadSafeError } from "../services/AiService.js";

// Import the business logic that generates the panel
// Instead of putting all the generation logic inside the route, it's placed in a service
// Keeps the route small and easier to maintain
import { GeneratePanel } from "../services/GeneratePanelService.js";

// Import wrapper that safely handles async Express routes so unexpected promise errors don't crash the application. 
import { RunSafe } from "../utils/RunSafe.js";

// Creates a new router for Generate Panel endpoints. 
export const GeneratePanelRoutes = Router();

// POST /
// This endpoint receives data from the frontend and generates a custom panel.
GeneratePanelRoutes.post(
  "/",

  // Wrap the async function so any unexpected async errors can be handled properly. 
  RunSafe(async (req, res) => {
    try {
      // Call the GeneratePanel service.
      // If req.body is undefined, use and empty object instead.
      const result = await GeneratePanel(req.body || {});

      // Return the status code provided by the service, along with the generated result. 
      res.status(result.status).json(result);
    } catch (error) {

      // If something goes wrong, convert the error into a safe message that can be shown to the user. 
      res.status(200).json({ ok: false, error: ReadSafeError(error, "Panel generation failed.") });
    }
  }),
);

