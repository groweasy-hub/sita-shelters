"use client";

import styled from "styled-components";

const Scroller = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;
const Inner = styled.div`
  min-width: ${({ $minWidth }) => $minWidth};
`;

/**
 * Keeps a header + rows grid readable on a phone: the columns keep their
 * proportions and the block scrolls sideways inside its panel, instead of the
 * columns crushing together or the whole page scrolling.
 */
export function ScrollRows({ children, minWidth = "40rem", ...props }) {
  return (
    <Scroller tabIndex={0} {...props}>
      <Inner $minWidth={minWidth}>{children}</Inner>
    </Scroller>
  );
}
