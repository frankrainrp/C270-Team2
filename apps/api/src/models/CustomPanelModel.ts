// Import mongoose and Schema from the mongoose package
import mongoose, { Schema } from "mongoose";

// TypeScript type that defines the structure of a CustomPanel document
export type CustomPanelDoc = {
  // Stores the ID of the user who owns this custom panel
  ownerId: string;

  // Stores the ID of the client associated with this panel
  clientId: string;

  // Stores the panel's custom data.
  // "unknown" allows any data type while still encouraging type checking before use.
  data: unknown;

  // Automatically stores when the document was created
  createdAt: Date;

  // Automatically stores when the document was last updated
  updatedAt: Date;
};

// Create the schema that defines how the data is stored in MongoDB
const CustomPanelSchema = new Schema<CustomPanelDoc>(
  {
    // Owner ID (required)
    // trim: true removes accidental spaces before saving
    ownerId: { type: String, required: true, trim: true, index: true },  // Creates an index to make searches by ownerId faster

    // Client ID (required)
    // trim: true remvoes accidental spaces before saving
    clientId: { type: String, required: true, trim: true },

    // Stores the panel data 
    // Mixed allows any object or JSON structure to be stored
    data: { type: Schema.Types.Mixed, required: true },
  },
  // Automatically creates createdAt and updatedAt fields
  { timestamps: true },
);

// Create a compound unique index.
// Prevents duplicate records with the same ownerId and cilentId.
CustomPanelSchema.index({ ownerId: 1, clientId: 1 }, { unique: true });

// Create and export the MongoDB model.
// This model is used throughout the application to create, read, update and delete CustomPanel documents.
export const CustomPanelModel = mongoose.model<CustomPanelDoc>("CustomPanel", CustomPanelSchema);
