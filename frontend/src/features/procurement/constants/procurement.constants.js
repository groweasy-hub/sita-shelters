import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";

export const PURCHASE_REQUEST_STATUS_VALUES = ["draft", "submitted", "approved"];
export const PURCHASE_REQUEST_STATUS_OPTIONS = PURCHASE_REQUEST_STATUS_VALUES.map(
  (value) => ({ value, label: getStatusConfig(value).label }),
);
export const PURCHASE_REQUEST_SORT_FIELDS = [
  "id",
  "projectId",
  "requiredDeliveryDate",
  "status",
  "createdAt",
];
export const purchaseRequestsQueryKeys = {
  all: ["procurement", "purchase-requests"],
  lists: () => [...purchaseRequestsQueryKeys.all, "list"],
  list: (params) => [...purchaseRequestsQueryKeys.lists(), params],
  details: () => [...purchaseRequestsQueryKeys.all, "detail"],
  detail: (id) => [...purchaseRequestsQueryKeys.details(), id],
};

export const QUOTATION_STATUS_VALUES = ["pending", "received", "selected", "rejected"];
export const QUOTATION_QUALITY_VALUES = ["low", "medium", "high"];
export const quotationsQueryKeys = {
  all: ["procurement", "quotations"],
  lists: () => [...quotationsQueryKeys.all, "list"],
  byPurchaseRequest: (purchaseRequestId) => [
    ...quotationsQueryKeys.all,
    "by-purchase-request",
    purchaseRequestId,
  ],
};

export const PURCHASE_ORDER_STATUS_VALUES = [
  "draft",
  "pending-approval",
  "approved",
  "sent",
  "partially-supplied",
  "completed",
  "cancelled",
];
export const PURCHASE_ORDER_STATUS_OPTIONS = PURCHASE_ORDER_STATUS_VALUES.map(
  (value) => ({ value, label: getStatusConfig(value).label }),
);
export const DELIVERY_STATUS_VALUES = ["pending", "delivered"];
export const PURCHASE_ORDER_SORT_FIELDS = [
  "id",
  "vendorId",
  "projectId",
  "status",
  "createdAt",
];
export const PURCHASE_ORDER_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const PURCHASE_ORDER_DEFAULT_LIST_PARAMS = {
  status: null,
  vendorId: null,
  projectId: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "createdAt",
  sortDirection: "desc",
};
export const purchaseOrdersQueryKeys = {
  all: ["procurement", "purchase-orders"],
  lists: () => [...purchaseOrdersQueryKeys.all, "list"],
  list: (params) => [...purchaseOrdersQueryKeys.lists(), params],
  details: () => [...purchaseOrdersQueryKeys.all, "detail"],
  detail: (poId) => [...purchaseOrdersQueryKeys.details(), poId],
  byIndent: (indentId) => [...purchaseOrdersQueryKeys.all, "by-indent", indentId],
};
