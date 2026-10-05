"use client";

import styled, { keyframes } from "styled-components";

const pulse = keyframes`0%, 100% { opacity: 0.55; } 50% { opacity: 1; }`;
const SkeletonBlock = styled.div`
  width: ${({ $width }) => $width ?? "100%"};
  max-width: 100%;
  height: ${({ $height }) => $height ?? "0.75rem"};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.muted};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;
const Stack = styled.div`
  display: grid;
  gap: ${({ $gap }) => $gap ?? "0.75rem"};
`;
const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;
const TableFrame = styled.div`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const TableRow = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $header, theme }) =>
    $header ? theme.colors.surfaceMuted : "transparent"};
  &:last-child {
    border-bottom: 0;
  }
`;
const Card = styled.div`
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const Cards = styled.div`
  display: grid;
  gap: 1rem;
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: end;
  }
`;

export function Skeleton({ width, height, ...props }) {
  return (
    <SkeletonBlock
      $height={height}
      $width={width}
      aria-hidden="true"
      {...props}
    />
  );
}

export function TableSkeleton({
  columns = 5,
  rows = 6,
  showToolbar = true,
  ...props
}) {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));
  return (
    <Stack aria-busy="true" {...props}>
      <span className="sr-only">Loading table</span>
      {showToolbar ? (
        <Toolbar>
          <Skeleton height="2.25rem" width="20rem" />
          <Skeleton height="2.25rem" width="6rem" />
        </Toolbar>
      ) : null}
      <TableFrame>
        <TableRow $columns={safeColumns} $header>
          {Array.from({ length: safeColumns }, (_, index) => (
            <Skeleton key={`header-${index}`} width="5rem" />
          ))}
        </TableRow>
        {Array.from({ length: safeRows }, (_, row) => (
          <TableRow $columns={safeColumns} key={`row-${row}`}>
            {Array.from({ length: safeColumns }, (_, column) => (
              <Skeleton
                key={`cell-${row}-${column}`}
                width={column === 0 ? "7rem" : "5rem"}
              />
            ))}
          </TableRow>
        ))}
      </TableFrame>
    </Stack>
  );
}

export function CardSkeleton({ lines = 3, ...props }) {
  const safeLines = Math.max(1, Math.floor(lines));
  return (
    <Card aria-busy="true" {...props}>
      <span className="sr-only">Loading card</span>
      <Stack>
        <Skeleton width="40%" />
        <Skeleton height="2rem" width="33%" />
        {Array.from({ length: safeLines }, (_, index) => (
          <Skeleton
            key={`line-${index}`}
            width={index === safeLines - 1 ? "60%" : "100%"}
          />
        ))}
      </Stack>
    </Card>
  );
}

export function PageSkeleton({ cards = 3, tableRows = 6, ...props }) {
  const safeCards = Math.max(0, Math.floor(cards));
  return (
    <Stack $gap="1.5rem" aria-busy="true" {...props}>
      <span className="sr-only">Loading page</span>
      <PageHeader>
        <Stack>
          <Skeleton height="1.75rem" width="14rem" />
          <Skeleton height="1rem" width="20rem" />
        </Stack>
        <Skeleton height="2.25rem" width="7rem" />
      </PageHeader>
      {safeCards ? (
        <Cards>
          {Array.from({ length: safeCards }, (_, index) => (
            <CardSkeleton key={`card-${index}`} lines={2} />
          ))}
        </Cards>
      ) : null}
      <TableSkeleton rows={tableRows} />
    </Stack>
  );
}
