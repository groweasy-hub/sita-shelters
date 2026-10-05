"use client";

import styled from "styled-components";

const List = styled.div`
  display: flex;
  flex-direction: column;
`;
const Item = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-child {
    border-top: 0;
  }
`;
const IconFrame = styled.span`
  display: flex;
  width: 1.875rem;
  height: 1.875rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
const Copy = styled.div`
  min-width: 0;
`;
const Title = styled.p`
  margin: 0;
  font-size: 0.84375rem;
  font-weight: 650;
`;
const Meta = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;

export function Timeline({ children, ...props }) {
  return <List {...props}>{children}</List>;
}

export function TimelineItem({ icon: Icon, title, meta, ...props }) {
  return (
    <Item {...props}>
      {Icon ? (
        <IconFrame>
          <Icon aria-hidden="true" strokeWidth={1.75} />
        </IconFrame>
      ) : null}
      <Copy>
        <Title>{title}</Title>
        {meta ? <Meta>{meta}</Meta> : null}
      </Copy>
    </Item>
  );
}
