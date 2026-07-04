import { Router } from "express";
import { CustomPanelModel } from "../models/CustomPanelModel.js";
import { DeleteGenericItem, GetGenericList, PatchGenericItem, PutGenericItem } from "../services/GenericDataService.js";
import { ReadOwnerId } from "../middleware/AuthMiddleware.js";
import { MakeOk } from "../utils/ApiResponse.js";
import { RunSafe } from "../utils/RunSafe.js";

// Create a new router for all Custom Panel related API routes
export const CustomPanelRoutes = Router();

// =========================
// GET - Retrieve all custom panels
// =========================
CustomPanelRoutes.get(
  "/",
  RunSafe(async (req, res) => {
    // Get the ID of the currently logged-in user
    const ownerId = ReadOwnerId(req);

    // Retrieve all custom panels that belong to this user
    const result = await GetGenericList(CustomPanelModel, ownerId);

    // Send the retrieved data back to the frontend in a standard response format
    res.json(MakeOk(result));
  }),
);

// =========================
// PUT - Replace an existing custom panel
// =========================
CustomPanelRoutes.put(
  "/:id",
  RunSafe(async (req, res) => {
    // Get the logged-in user's ID
    const ownerId = ReadOwnerId(req);

    // Get the panel ID from the URL
    // Example: PUT /custom-panels/5
    // id = "5"
    const { id } = req.params;

    // Replace the existing custom panel with the new data
    // ...req.body copies all the data sent from the frontend
    // id is added so the service knows which panel to update
    const result = await PutGenericItem(
      CustomPanelModel,
      ownerId,
      {
        ...req.body,
        id,
      }
    );
    // Return a success response to the frontend 
    res.json(MakeOk(result));
  }),
);

// =========================
// PATCH - Update part of a custom panel
// =========================
CustomPanelRoutes.patch(
  "/:id",
  RunSafe(async (req, res) => {
    // Get the logged-in user's ID
    const ownerId = ReadOwnerId(req);
    // Get the panel ID from the URL
    const { id } = req.params;

    // Update only the fields sent by the frontend
    // If no request body is provided, use an empty object instead
    const result = await PatchGenericItem(CustomPanelModel, ownerId, id, req.body || {});

    // Return the updates panel information
    res.json(MakeOk(result));
  }),
);

// =========================
// DELETE - Remove a custom panel
// =========================
CustomPanelRoutes.delete(
  "/:id",
  RunSafe(async (req, res) => {
    // Get the logged-in user's ID
    const ownerId = ReadOwnerId(req);

    // Get the panel ID from the URL
    const { id } = req.params;
    
    // Delete the specified custom panel that belongs to the user
    const result = await DeleteGenericItem(CustomPanelModel, ownerId, id);

    // Return a success response after deletion
    res.json(MakeOk(result));
  }),
);
