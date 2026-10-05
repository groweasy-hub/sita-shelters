"use client";

import { forwardRef } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import styled from "styled-components";

const StyledLabel = styled(LabelPrimitive.Root)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
`;

export const Label = forwardRef(function Label(props, ref) {
  return <StyledLabel ref={ref} data-slot="label" {...props} />;
});
