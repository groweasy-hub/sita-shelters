import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig, workflowConfig } from "@/config/status";

/** Single source of truth for the transfer state machine already lives in `config/status.js`. */
export const TRANSFER_STATUS_VALUES = workflowConfig.transfer.statuses;
/** The seven forward-moving stages, excluding the `rejected` branch. */
export const TRANSFER_FORWARD_STATUSES = TRANSFER_STATUS_VALUES.filter(
  (status) => status !== "rejected",
);
export const TRANSFER_STATUS_OPTIONS = TRANSFER_STATUS_VALUES.map(
  (value) => ({
    value,
    label: getStatusConfig(value).label,
  }),
);
export const TRANSFER_SORT_FIELDS = [
  "id",
  "sourceProjectName",
  "destinationProjectName",
  "materialName",
  "quantity",
  "status",
  "requestedAt",
];
export const TRANSFER_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const TRANSFER_DEFAULT_LIST_PARAMS = {
  status: null,
  sourceProjectId: null,
  destinationProjectId: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "requestedAt",
  sortDirection: "desc",
};
export const stockTransfersQueryKeys = {
  all: ["stock-transfers"],
  lists: () => [...stockTransfersQueryKeys.all, "list"],
  list: (params) => [...stockTransfersQueryKeys.lists(), params],
  details: () => [...stockTransfersQueryKeys.all, "detail"],
  detail: (transferId) => [...stockTransfersQueryKeys.details(), transferId],
};
