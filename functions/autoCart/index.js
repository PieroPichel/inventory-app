import { Client, Databases } from "node-appwrite";
import { resolveCartMode } from "./logic/cartStateMachine.js";

export default async ({ req, res, log }) => {
  try {
    const item = req.body;

    if (!item || !item.$id) {
      log("No item payload");
      return res.json({ status: "ignored" });
    }

    const qty = item.quantity;
    const min = item.Min_Stock; // matches your document field name
    const mode = item.cart_mode;

    const nextMode = resolveCartMode({ qty, min, mode });

    if (nextMode !== mode) {
      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

      const databases = new Databases(client);

      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_ITEMS_COLLECTION_ID,
        item.$id,
        { cart_mode: nextMode }
      );

      log(`cart_mode updated: ${mode} → ${nextMode}`);
      return res.json({ updated: nextMode });
    }

    return res.json({ updated: "no change" });
  } catch (err) {
    log("Error: " + err.message);
    return res.json({ error: err.message });
  }
};
