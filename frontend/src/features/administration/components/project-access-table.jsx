"use client";

import { Check } from "lucide-react";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";
import { ACCESS_LEVEL_LABELS, ACCESS_LEVELS } from "@/config/permissions";
import { getProjectById } from "@/lib/mock-data/projects";

const Table = styled.table`
  width: 100%;
  min-width: 32rem;
  border-collapse: collapse;
  font-size: 0.8125rem;
`;
const Th = styled.th`
  padding: 0.5rem 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  text-align: ${({ $center }) => ($center ? "center" : "left")};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const Td = styled.td`
  padding: 0.6875rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  text-align: ${({ $center }) => ($center ? "center" : "left")};
`;
const Row = styled.tr`
  &:last-child td {
    border-bottom: 0;
  }
`;
const CheckIcon = styled(Check)`
  width: 1rem;
  height: 1rem;
  color: ${({ theme }) => theme.colors.success};
`;
const Dash = styled.span`
  color: ${({ theme }) => theme.colors.border};
`;
const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;

export function ProjectAccessTable({ assignments }) {
  if (assignments.length === 0) {
    return <Empty>No project access assigned yet.</Empty>;
  }
  return (
    <Table>
      <thead>
        <tr>
          <Th>Project</Th>
          {ACCESS_LEVELS.map((level) => (
            <Th $center key={level}>
              {ACCESS_LEVEL_LABELS[level].replace(" Access", "")}
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {assignments.map((assignment) => {
          const project = getProjectById(assignment.projectId);
          if (!project) return null;
          const grantedIndex = ACCESS_LEVELS.indexOf(assignment.accessLevel);
          return (
            <Row key={assignment.projectId}>
              <Td>
                <Badge variant="outline">{project.name}</Badge>
              </Td>
              {ACCESS_LEVELS.map((level, index) => (
                <Td $center key={level}>
                  {index <= grantedIndex ? (
                    <CheckIcon aria-label="Granted" role="img" />
                  ) : (
                    <Dash aria-hidden="true">—</Dash>
                  )}
                </Td>
              ))}
            </Row>
          );
        })}
      </tbody>
    </Table>
  );
}
