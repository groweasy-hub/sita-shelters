import { z } from "zod";

const amountSchema = z.number().finite().nonnegative();

export const billingLineSchema = z.object({
  materialCode: z.string().trim().min(1),
  materialName: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  quantity: amountSchema,
  unitPrice: amountSchema,
  taxPercent: amountSchema,
  taxableAmount: amountSchema,
  taxAmount: amountSchema,
  totalAmount: amountSchema,
  lineType: z.enum(["material", "charge"]).default("material"),
  hsnCode: z.string().trim().min(1).default("995419"),
});

export const billingInvoiceSchema = z.object({
  id: z.string().trim().min(1),
  invoiceNumber: z.string().trim().min(1),
  invoiceDate: z.string().datetime({ offset: true }),
  purchaseOrderId: z.string().trim().min(1),
  purchaseOrderNumber: z.string().trim().min(1),
  deliveryChallanNumber: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  projectName: z.string().trim().min(1),
  projectAddress: z.string().default(""),
  vendorId: z.string().trim().min(1),
  vendorName: z.string().trim().min(1),
  vendorGstNumber: z.string().default(""),
  vendorAddress: z.string().default(""),
  vehicleNumber: z.string().trim().min(1),
  transporterName: z.string().trim().min(1),
  status: z.string().trim().min(1),
  stage: z.string().trim().min(1),
  termsNote: z.string().default(""),
  transportationFee: amountSchema,
  labourCharges: amountSchema,
  otherCharges: amountSchema,
  chargeTaxPercent: amountSchema,
  materialAmount: amountSchema,
  chargesAmount: amountSchema,
  taxableAmount: amountSchema,
  taxAmount: amountSchema,
  totalAmount: amountSchema,
  lines: z.array(billingLineSchema).min(1),
});

export const billingInvoicesSchema = z.array(billingInvoiceSchema);
