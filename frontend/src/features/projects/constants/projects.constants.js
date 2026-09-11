import { PROJECT_STATUS_VALUES, TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";

export { PROJECT_STATUS_VALUES };
export const PROJECT_STATUS_OPTIONS = PROJECT_STATUS_VALUES.map((value) => ({
  value,
  label: getStatusConfig(value).label,
}));
export const PROJECT_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const projectsQueryKeys = {
  all: ["projects"],
  lists: () => [...projectsQueryKeys.all, "list"],
  list: (params) => [...projectsQueryKeys.lists(), params],
  details: () => [...projectsQueryKeys.all, "detail"],
  detail: (projectId) => [...projectsQueryKeys.details(), projectId],
};
