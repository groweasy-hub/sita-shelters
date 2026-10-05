import { apiClient } from "@/lib/api-client";
import { damageRecordsSchema } from "../schemas/damaged-stock.schema";

/**
 * Damage records, derived by the backend from what actually happened: quantity
 * rejected in goods-inward quality checks, quantity found damaged on return
 * inspection, and any incident logged directly — valued at current prices.
 */
export const damagedStockService = {
  async listAll() {
    return damageRecordsSchema.parse(await apiClient.get("/api/inventory/damaged"));
  },
};
