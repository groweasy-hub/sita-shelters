import { apiClient } from "@/lib/api-client";
import { billingInvoicesSchema } from "../schemas/billings.schema";

export const billingsService = {
  async listAll() {
    const records = await apiClient.get("/api/billings");
    return billingInvoicesSchema.parse(records);
  },
  async updateCharges(invoiceId, input) {
    const records = await apiClient.patch(
      `/api/billings/${encodeURIComponent(invoiceId)}/charges`,
      { body: input },
    );
    return billingInvoicesSchema.parse(records);
  },
};
