"use client";

import styled from "styled-components";

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
`;
const Copy = styled.div`
  min-width: 0;
`;
const Eyebrow = styled.div`
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;
const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: clamp(1.5rem, 2vw, 1.75rem);
  font-weight: 650;
  letter-spacing: -0.025em;
`;
const Description = styled.div`
  max-width: 48rem;
  margin-top: 0.375rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  line-height: 1.5rem;
`;
const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;
const Actions = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  @media (min-width: 640px) {
    justify-content: flex-end;
  }
`;

export function PageHeader({
  actions,
  description,
  eyebrow,
  meta,
  title,
  ...props
}) {
  return (
    <Header {...props}>
      <Copy>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Title>{title}</Title>
        {description ? <Description>{description}</Description> : null}
        {meta ? <Meta>{meta}</Meta> : null}
      </Copy>
      {actions ? <Actions>{actions}</Actions> : null}
    </Header>
  );
}
