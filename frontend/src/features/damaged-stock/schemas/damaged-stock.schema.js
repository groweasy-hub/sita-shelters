import { z } from "zod";
import {
  DAMAGE_DEPARTMENT_VALUES,
  DAMAGE_REASON_VALUES,
  DAMAGE_RECORD_TYPE_VALUES,
  DAMAGE_SOURCE_TYPE_VALUES,
} from "../constants/damaged-stock.constants";

const identifierSchema = z.string().trim().min(1).max(128);

export const damageRecordTypeSchema = z.enum(DAMAGE_RECORD_TYPE_VALUES);
export const damageReasonSchema = z.enum(DAMAGE_REASON_VALUES);
export const damageDepartmentSchema = z.enum(DAMAGE_DEPARTMENT_VALUES);
export const damageSourceTypeSchema = z.enum(DAMAGE_SOURCE_TYPE_VALUES);

/**
 * A unified damage/wastage record. Records are composed from three origins:
 * QC rejections (`sourceType: "qc-rejection"`), Return QC damage findings
 * (`sourceType: "return-inspection"`), and directly logged incidents
 * (`sourceType: "other"` — transportation, weather, storage, expiry,
 * accidental damage, and all construction wastage).
 */
export const damageRecordSchema = z.object({
  id: identifierSchema,
  type: damageRecordTypeSchema,
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(32),
  quantity: z.number().finite().nonnegative(),
  financialValue: z.number().finite().nonnegative(),
  reason: damageReasonSchema,
  department: damageDepartmentSchema,
  date: z.string().datetime({ offset: true }),
  sourceType: damageSourceTypeSchema,
  sourceId: identifierSchema.nullable(),
  remarks: z.string().trim().max(500),
});
export const damageRecordsSchema = z.array(damageRecordSchema);
