"use client";

import { forwardRef, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import styled, { keyframes } from "styled-components";

import { Input } from "@/components/ui/input";
import { focusRing } from "@/components/ui/internal-styles";

const spin = keyframes`to { transform: translateY(-50%) rotate(360deg); }`;
const Container = styled.div`
  position: relative;
  width: 100%;
`;
const SearchField = styled(Input)`
  padding-left: 2.25rem;
  padding-right: ${({ $canClear }) => ($canClear ? "2.25rem" : "0.75rem")};
`;
const Icon = styled.span`
  position: absolute;
  top: 50%;
  left: 0.75rem;
  z-index: 1;
  display: inline-flex;
  color: ${({ theme }) => theme.colors.mutedForeground};
  transform: translateY(-50%);
  pointer-events: none;
  svg {
    width: 1rem;
    height: 1rem;
    ${({ $loading }) =>
      $loading ? `animation: ${spin} 800ms linear infinite;` : ""}
  }
`;
const ClearButton = styled.button`
  ${focusRing}
  position: absolute;
  top: 50%;
  right: 0.375rem;
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.mutedForeground};
  transform: translateY(-50%);
  &:hover {
    background: ${({ theme }) => theme.colors.muted};
    color: ${({ theme }) => theme.colors.foreground};
  }
  &:disabled {
    opacity: 0.5;
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;

export const SearchInput = forwardRef(function SearchInput(
  {
    "aria-label": ariaLabel,
    clearable = true,
    defaultValue = "",
    disabled,
    loading = false,
    onClear,
    onValueChange,
    placeholder = "Search",
    value,
    ...props
  },
  ref,
) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;
  const update = (nextValue) => {
    if (!isControlled) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  };
  return (
    <Container>
      <Icon $loading={loading}>
        {loading ? (
          <LoaderCircle aria-hidden="true" />
        ) : (
          <Search aria-hidden="true" strokeWidth={1.75} />
        )}
      </Icon>
      <SearchField
        $canClear={clearable && Boolean(currentValue)}
        aria-label={
          ariaLabel ??
          (typeof placeholder === "string" ? placeholder : "Search")
        }
        disabled={disabled}
        onChange={(event) => update(event.target.value)}
        placeholder={placeholder}
        ref={ref}
        type="search"
        value={currentValue}
        {...props}
      />
      {clearable && currentValue ? (
        <ClearButton
          aria-label="Clear search"
          disabled={disabled || loading}
          onClick={() => {
            update("");
            onClear?.();
          }}
          type="button"
        >
          <X aria-hidden="true" />
        </ClearButton>
      ) : null}
    </Container>
  );
});
