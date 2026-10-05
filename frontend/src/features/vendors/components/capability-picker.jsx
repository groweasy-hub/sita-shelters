"use client";

import { Check } from "lucide-react";
import styled from "styled-components";

import { VENDOR_CATEGORY_OPTIONS } from "../constants/vendors.constants";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.5rem;
`;
const Option = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid
    ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme, $selected }) =>
    $selected ? `${theme.colors.primary}12` : "transparent"};
  font-size: 0.8125rem;
  cursor: pointer;
  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.primary}55;
  }
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;
const Box = styled.span`
  display: inline-flex;
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: 0.25rem;
`;

/** Multi-select over the material categories a vendor can supply. */
export function VendorCapabilityPicker({ disabled = false, onChange, value }) {
  function toggle(categoryId) {
    onChange(
      value.includes(categoryId)
        ? value.filter((id) => id !== categoryId)
        : [...value, categoryId],
    );
  }
  return (
    <Grid role="group" aria-label="Material supply capability">
      {VENDOR_CATEGORY_OPTIONS.map((category) => {
        const selected = value.includes(category.id);
        return (
          <Option $selected={selected} key={category.id}>
            <input
              checked={selected}
              disabled={disabled}
              onChange={() => toggle(category.id)}
              type="checkbox"
            />
            <Box aria-hidden="true">{selected ? <Check /> : null}</Box>
            {category.name}
          </Option>
        );
      })}
    </Grid>
  );
}
