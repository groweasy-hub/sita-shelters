"use client";

import { forwardRef } from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import styled from "styled-components";

const StyledSeparator = styled(SeparatorPrimitive.Root)`
  flex: 0 0 auto;
  background: ${({ theme }) => theme.colors.border};
  &[data-orientation="horizontal"] {
    width: 100%;
    height: 1px;
  }
  &[data-orientation="vertical"] {
    width: 1px;
    height: 100%;
  }
`;

export const Separator = forwardRef(function Separator(
  { orientation = "horizontal", decorative = true, ...props },
  ref,
) {
  return (
    <StyledSeparator
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      data-slot="separator"
      {...props}
    />
  );
});
