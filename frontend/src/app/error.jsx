"use client";
import styled from "styled-components";
import { ErrorState } from "@/components/feedback/error-state";
const Main = styled.main`
  display: grid;
  min-height: 100vh;
  padding: 1.5rem;
  place-items: center;
`;
export default function RootError({ reset }) {
  return (
    <Main>
      <ErrorState
        title="The workspace could not be loaded"
        description="A temporary application error interrupted this view. Your data has not been changed."
        onRetry={reset}
      />
    </Main>
  );
}
