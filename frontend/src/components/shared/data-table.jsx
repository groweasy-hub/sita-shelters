"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  LoaderCircle,
} from "lucide-react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  functionalUpdate,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import styled, { keyframes } from "styled-components";

import { EmptyState } from "@/components/feedback/empty-state";
import { TableSkeleton } from "@/components/feedback/skeletons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "./filter-bar";
import { SearchInput } from "./search-input";

export const dataTableFeatures = tableFeatures({
  columnMeta: metaHelper(),
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
});

export function createDataTableColumnHelper() {
  return createColumnHelper();
}

const defaultPageSizeOptions = [10, 25, 50, 100];
const spin = keyframes`to { transform: rotate(360deg); }`;
const Root = styled.div`
  display: grid;
  gap: 0.75rem;
`;
const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;
const SearchWrap = styled.div`
  width: 100%;
  @media (min-width: 640px) {
    max-width: 24rem;
  }
`;
const ToolbarActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  svg {
    width: 1rem;
    height: 1rem;
  }
  @media (min-width: 640px) {
    justify-content: flex-end;
  }
`;
const SpinningIcon = styled(LoaderCircle)`
  animation: ${spin} 800ms linear infinite;
`;
const SelectionBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.primary}33;
  background: ${({ theme }) => theme.colors.primary}0a;
  font-size: 0.875rem;
  font-weight: 600;
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;
const SelectionActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;
const TableFrame = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const TableElement = styled.table`
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
  font-size: 0.875rem;
`;
const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const HeaderRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const HeaderCell = styled.th`
  height: 2.5rem;
  padding: 0 1rem;
  white-space: nowrap;
  text-align: ${({ $align }) =>
    $align === "end" ? "right" : $align === "center" ? "center" : "left"};
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.025em;
`;
const SortButton = styled.button`
  display: inline-flex;
  height: 2rem;
  align-items: center;
  gap: 0.375rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  ${({ $align }) =>
    $align === "end"
      ? "margin-left: auto;"
      : $align === "center"
        ? "margin-inline: auto;"
        : ""}
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
const BodyRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background 150ms ease;
  &:last-child {
    border-bottom: 0;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted}aa;
  }
  &[data-state="selected"] {
    background: ${({ theme }) => theme.colors.primary}0c;
  }
  ${({ $clickable }) => ($clickable ? "cursor: pointer;" : "")}
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: -2px;
  }
`;
const Cell = styled.td`
  height: 2.75rem;
  padding: 0 1rem;
  white-space: nowrap;
  vertical-align: middle;
  text-align: ${({ $align }) =>
    $align === "end" ? "right" : $align === "center" ? "center" : "left"};
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.8125rem;
`;
const EmptyCell = styled.td`
  padding: 1rem;
`;
const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
const Pagination = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-inline: 0.125rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;
const PaginationControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  @media (min-width: 640px) {
    justify-content: flex-end;
  }
`;
const PageCount = styled.span`
  min-width: 5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.foreground};
`;
const PageButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const DesktopOnly = styled.span`
  display: none;
  @media (min-width: 640px) {
    display: inline;
  }
`;

function resolveSlot(slot, context) {
  return typeof slot === "function" ? slot(context) : slot;
}
function humanizeColumnId(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
function isInteractiveTarget(target) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "a, button, input, select, textarea, [role='button'], [role='menuitem'], [data-row-click-ignore]",
      ),
    )
  );
}

function SelectionCheckbox({ indeterminate = false, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <Checkbox
      aria-checked={indeterminate ? "mixed" : props.checked}
      ref={ref}
      type="checkbox"
      {...props}
    />
  );
}

export function DataTable({
  additionalActiveFilterCount = 0,
  ariaLabel = "Data table",
  bulkActions,
  caption,
  columns,
  data,
  emptyState,
  enableColumnVisibility = true,
  enablePagination = true,
  enableRowSelection = false,
  enableSorting = true,
  exportLabel = "Export",
  filters,
  getRowClassName,
  getRowId,
  getSubRows,
  initialState,
  isExporting = false,
  isLoading = false,
  loadingLabel = "Loading table",
  loadingRows = 6,
  manualFiltering = false,
  manualPagination = false,
  manualSorting = false,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  onExport,
  onPaginationChange,
  onRowClick,
  onRowSelectionChange,
  onResetFilters,
  onSearchChange,
  onSortingChange,
  pageCount,
  pageSizeOptions = defaultPageSizeOptions,
  rowCount,
  search = true,
  state,
  toolbarActions,
  ...props
}) {
  const [internalSorting, setInternalSorting] = useState(
    () => initialState?.sorting ?? [],
  );
  const [internalPagination, setInternalPagination] = useState(
    () => initialState?.pagination ?? { pageIndex: 0, pageSize: 25 },
  );
  const [internalRowSelection, setInternalRowSelection] = useState(
    () => initialState?.rowSelection ?? {},
  );
  const [internalColumnVisibility, setInternalColumnVisibility] = useState(
    () => initialState?.columnVisibility ?? {},
  );
  const [internalColumnFilters, setInternalColumnFilters] = useState(
    () => initialState?.columnFilters ?? [],
  );
  const [internalGlobalFilter, setInternalGlobalFilter] = useState(
    () => initialState?.globalFilter ?? "",
  );
  const sorting = state?.sorting ?? internalSorting;
  const pagination = state?.pagination ?? internalPagination;
  const rowSelection = state?.rowSelection ?? internalRowSelection;
  const columnVisibility = state?.columnVisibility ?? internalColumnVisibility;
  const columnFilters = state?.columnFilters ?? internalColumnFilters;
  const globalFilter = state?.globalFilter ?? internalGlobalFilter;
  const handleSortingChange = useCallback(
    (updater) => {
      const next = functionalUpdate(updater, sorting);
      if (state?.sorting === undefined) setInternalSorting(next);
      onSortingChange?.(next);
    },
    [state?.sorting, onSortingChange, sorting],
  );
  const handlePaginationChange = useCallback(
    (updater) => {
      const next = functionalUpdate(updater, pagination);
      if (state?.pagination === undefined) setInternalPagination(next);
      onPaginationChange?.(next);
    },
    [state?.pagination, onPaginationChange, pagination],
  );
  const handleRowSelectionChange = useCallback(
    (updater) => {
      const next = functionalUpdate(updater, rowSelection);
      if (state?.rowSelection === undefined) setInternalRowSelection(next);
      onRowSelectionChange?.(next);
    },
    [state?.rowSelection, onRowSelectionChange, rowSelection],
  );
  const handleColumnVisibilityChange = useCallback(
    (updater) => {
      const next = functionalUpdate(updater, columnVisibility);
      if (state?.columnVisibility === undefined)
        setInternalColumnVisibility(next);
      onColumnVisibilityChange?.(next);
    },
    [state?.columnVisibility, onColumnVisibilityChange, columnVisibility],
  );
  const handleColumnFiltersChange = useCallback(
    (updater) => {
      const next = functionalUpdate(updater, columnFilters);
      if (state?.columnFilters === undefined) setInternalColumnFilters(next);
      onColumnFiltersChange?.(next);
    },
    [state?.columnFilters, onColumnFiltersChange, columnFilters],
  );
  const handleGlobalFilterChange = useCallback(
    (updater) => {
      const resolved = functionalUpdate(updater, globalFilter);
      const next =
        typeof resolved === "string" ? resolved : String(resolved ?? "");
      if (state?.globalFilter === undefined) setInternalGlobalFilter(next);
      onSearchChange?.(next);
    },
    [globalFilter, onSearchChange, state?.globalFilter],
  );
  const tableColumns = useMemo(
    () =>
      enableRowSelection
        ? [
            {
              id: "__select",
              header: ({ table }) => (
                <SelectionCheckbox
                  aria-label="Select all rows on this page"
                  checked={table.getIsAllPageRowsSelected()}
                  indeterminate={
                    table.getIsSomePageRowsSelected() &&
                    !table.getIsAllPageRowsSelected()
                  }
                  onChange={table.getToggleAllPageRowsSelectedHandler()}
                />
              ),
              cell: ({ row }) => (
                <SelectionCheckbox
                  aria-label="Select row"
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  indeterminate={row.getIsSomeSelected()}
                  onChange={row.getToggleSelectedHandler()}
                />
              ),
              enableHiding: false,
              enableSorting: false,
              enableGlobalFilter: false,
              meta: { label: "Select", align: "center" },
            },
            ...columns,
          ]
        : columns,
    [columns, enableRowSelection],
  );
  const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data,
    getRowId,
    getSubRows,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility,
      columnFilters,
      globalFilter,
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    enableSorting,
    enableRowSelection,
    enableHiding: enableColumnVisibility,
    enableGlobalFilter: search !== false,
    globalFilterFn: "includesString",
    manualFiltering,
    manualSorting,
    manualPagination: manualPagination || !enablePagination,
    rowCount,
    pageCount,
  });
  const setSearchValue = useCallback(
    (value) => {
      table.setGlobalFilter(value);
      if (enablePagination) table.firstPage();
    },
    [enablePagination, table],
  );
  const resetFilters = useCallback(() => {
    table.resetColumnFilters(true);
    table.resetGlobalFilter(true);
    if (enablePagination) table.firstPage();
    onResetFilters?.();
  }, [enablePagination, onResetFilters, table]);
  const selectedRows = table
    .getSelectedRowModel()
    .flatRows.map((row) => row.original);
  const selectedRowIds = table.getSelectedRowIds();
  const filteredRows = table
    .getFilteredRowModel()
    .flatRows.map((row) => row.original);
  const activeFilterCount =
    columnFilters.length +
    (globalFilter.trim().length ? 1 : 0) +
    Math.max(0, additionalActiveFilterCount);
  const context = {
    table,
    selectedRows,
    selectedRowIds,
    filteredRows,
    selectedCount: selectedRowIds.length,
    filteredCount: filteredRows.length,
    activeFilterCount,
    searchValue: globalFilter,
    setSearchValue,
    resetFilters,
  };
  const searchOptions = typeof search === "object" ? search : undefined;
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());
  const visibleColumnCount = Math.max(table.getVisibleLeafColumns().length, 1);
  const rows = table.getRowModel().rows;
  const showToolbar =
    search !== false ||
    Boolean(toolbarActions) ||
    Boolean(onExport) ||
    (enableColumnVisibility && hideableColumns.length > 0);
  const normalizedPageSizes = Array.from(
    new Set([...pageSizeOptions, pagination.pageSize]),
  ).filter((size) => Number.isFinite(size) && size > 0);
  const resolvedPageCount = table.getPageCount();
  const resolvedRowCount = table.getRowCount();
  const firstVisibleRow = rows.length
    ? pagination.pageIndex * pagination.pageSize + 1
    : 0;
  const lastVisibleRow = rows.length
    ? Math.min(firstVisibleRow + rows.length - 1, resolvedRowCount)
    : 0;
  return (
    <Root {...props}>
      {showToolbar ? (
        <Toolbar>
          {search !== false ? (
            <SearchWrap>
              <SearchInput
                aria-label={searchOptions?.ariaLabel ?? "Search table"}
                loading={isLoading && data.length > 0}
                onValueChange={setSearchValue}
                placeholder={searchOptions?.placeholder ?? "Search records"}
                value={globalFilter}
              />
            </SearchWrap>
          ) : (
            <span />
          )}
          <ToolbarActions>
            {resolveSlot(toolbarActions, context)}
            {onExport ? (
              <Button
                disabled={isExporting || filteredRows.length === 0}
                onClick={() => onExport(context)}
                size="sm"
                variant="outline"
              >
                {isExporting ? (
                  <SpinningIcon aria-hidden="true" />
                ) : (
                  <Download aria-hidden="true" />
                )}
                {exportLabel}
              </Button>
            ) : null}
            {enableColumnVisibility && hideableColumns.length ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Columns3 aria-hidden="true" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hideableColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      key={column.id}
                      onCheckedChange={(checked) =>
                        column.toggleVisibility(Boolean(checked))
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.columnDef.meta?.label ??
                        (typeof column.columnDef.header === "string"
                          ? column.columnDef.header
                          : humanizeColumnId(column.id))}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </ToolbarActions>
        </Toolbar>
      ) : null}
      {filters ? (
        <FilterBar activeFilterCount={activeFilterCount} onClear={resetFilters}>
          {resolveSlot(filters, context)}
        </FilterBar>
      ) : null}
      {selectedRowIds.length && bulkActions ? (
        <SelectionBar aria-live="polite">
          <span>
            {selectedRowIds.length}{" "}
            {selectedRowIds.length === 1 ? "row" : "rows"} selected
          </span>
          <SelectionActions>
            {resolveSlot(bulkActions, context)}
          </SelectionActions>
        </SelectionBar>
      ) : null}
      {isLoading && data.length === 0 ? (
        <div aria-label={loadingLabel} role="status">
          <span className="sr-only">{loadingLabel}</span>
          <TableSkeleton
            columns={visibleColumnCount}
            rows={loadingRows}
            showToolbar={false}
          />
        </div>
      ) : (
        <TableFrame>
          <TableElement
            aria-busy={isLoading || undefined}
            aria-colcount={visibleColumnCount}
            aria-label={ariaLabel}
            aria-rowcount={resolvedRowCount}
          >
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <TableHead>
              {table.getHeaderGroups().map((group) => (
                <HeaderRow key={group.id}>
                  {group.headers.map((header) => {
                    const meta = header.column.columnDef.meta;
                    const sortDirection = header.column.getIsSorted();
                    const align = meta?.align ?? "start";
                    return (
                      <HeaderCell
                        $align={align}
                        aria-sort={
                          sortDirection === "asc"
                            ? "ascending"
                            : sortDirection === "desc"
                              ? "descending"
                              : undefined
                        }
                        colSpan={header.colSpan}
                        key={header.id}
                        scope="col"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <SortButton
                            $align={align}
                            onClick={header.column.getToggleSortingHandler()}
                            type="button"
                          >
                            <table.FlexRender header={header} />
                            {sortDirection === "asc" ? (
                              <ArrowUp aria-hidden="true" />
                            ) : sortDirection === "desc" ? (
                              <ArrowDown aria-hidden="true" />
                            ) : (
                              <ChevronsUpDown aria-hidden="true" />
                            )}
                          </SortButton>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </HeaderCell>
                    );
                  })}
                </HeaderRow>
              ))}
            </TableHead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <BodyRow
                    $clickable={Boolean(onRowClick)}
                    className={getRowClassName?.(row)}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    key={row.id}
                    onClick={
                      onRowClick
                        ? (event) => {
                            if (!isInteractiveTarget(event.target))
                              onRowClick(row.original, event);
                          }
                        : undefined
                    }
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (
                              event.key === "Enter" &&
                              !isInteractiveTarget(event.target)
                            )
                              onRowClick(row.original, event);
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Cell
                        $align={cell.column.columnDef.meta?.align ?? "start"}
                        key={cell.id}
                      >
                        <table.FlexRender cell={cell} />
                      </Cell>
                    ))}
                  </BodyRow>
                ))
              ) : (
                <tr>
                  <EmptyCell colSpan={visibleColumnCount}>
                    {resolveSlot(emptyState, context) ?? (
                      <EmptyState
                        compact
                        description={
                          activeFilterCount
                            ? "Try changing or clearing the active filters."
                            : "There are no records to display yet."
                        }
                        title={
                          activeFilterCount
                            ? "No matching records"
                            : "No records found"
                        }
                      />
                    )}
                  </EmptyCell>
                </tr>
              )}
            </tbody>
          </TableElement>
        </TableFrame>
      )}
      {enablePagination && !isLoading ? (
        <Pagination>
          <div aria-live="polite">
            {firstVisibleRow}–{lastVisibleRow} of {resolvedRowCount} rows
            {selectedRowIds.length
              ? ` · ${selectedRowIds.length} selected`
              : ""}
          </div>
          <PaginationControls>
            <DesktopOnly>Rows per page</DesktopOnly>
            <Select
              onValueChange={(value) => table.setPageSize(Number(value))}
              value={String(pagination.pageSize)}
            >
              <SelectTrigger aria-label="Rows per page" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {normalizedPageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PageCount>
              Page {pagination.pageIndex + 1}
              {resolvedPageCount >= 0
                ? ` of ${Math.max(resolvedPageCount, 1)}`
                : ""}
            </PageCount>
            <PageButtons>
              <Button
                aria-label="Go to first page"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.firstPage()}
                size="icon-sm"
                variant="outline"
              >
                <ChevronsLeft aria-hidden="true" />
              </Button>
              <Button
                aria-label="Go to previous page"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size="icon-sm"
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                aria-label="Go to next page"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size="icon-sm"
                variant="outline"
              >
                <ChevronRight aria-hidden="true" />
              </Button>
              <Button
                aria-label="Go to last page"
                disabled={!table.getCanLastPage()}
                onClick={() => table.lastPage()}
                size="icon-sm"
                variant="outline"
              >
                <ChevronsRight aria-hidden="true" />
              </Button>
            </PageButtons>
          </PaginationControls>
        </Pagination>
      ) : null}
    </Root>
  );
}
