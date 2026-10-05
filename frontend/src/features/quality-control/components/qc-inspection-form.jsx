"use client";

import { useState } from "react";
import { CircleCheck, CircleX, ClipboardCheck } from "lucide-react";
import styled from "styled-components";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatQuantity } from "@/lib/formatters";
import {
  QC_CHECK_RESULT_OPTIONS,
  QC_CHECKLIST_ITEMS,
} from "../constants/quality-control.constants";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
  svg {
    width: 1rem;
    height: 1rem;
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
`;
const Body = styled.div`
  display: grid;
  gap: 1.5rem;
  padding: 1.25rem;
`;
const Intro = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  line-height: 1.5;
`;
const SectionTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 650;
`;
const CheckRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const Segmented = styled.div`
  display: inline-flex;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
`;
const Choice = styled.label`
  padding: 0.3125rem 0.875rem;
  border-right: 1px solid ${({ theme }) => theme.colors.input};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: ${({ theme, $selected, $tone }) =>
    $selected
      ? $tone === "fail"
        ? theme.colors.danger
        : $tone === "pass"
          ? theme.colors.success
          : theme.colors.foreground
      : theme.colors.mutedForeground};
  background: ${({ theme, $selected, $tone }) =>
    $selected
      ? $tone === "fail"
        ? `${theme.colors.danger}18`
        : $tone === "pass"
          ? `${theme.colors.success}18`
          : theme.colors.muted
      : "transparent"};
  &:last-child {
    border-right: 0;
  }
  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.primary}55;
    outline-offset: -2px;
  }
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
`;
const QuantityGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  align-items: end;
`;
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  min-width: 0;
`;
const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;
const Decision = styled.div`
  padding: 0.75rem 1rem;
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === "danger"
        ? `${theme.colors.danger}40`
        : $tone === "warning"
          ? `${theme.colors.warning}55`
          : `${theme.colors.success}40`};
  background: ${({ theme, $tone }) =>
    $tone === "danger"
      ? `${theme.colors.danger}0d`
      : $tone === "warning"
        ? `${theme.colors.warning}12`
        : `${theme.colors.success}0d`};
  font-size: 0.8125rem;
  line-height: 1.5;
`;
const ErrorNote = styled.div`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
  background: ${({ theme }) => theme.colors.danger}0d;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.8125rem;
`;
const Hint = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

/**
 * The inspection itself: work through the checklist, decide how much of the
 * delivery passes, and record it. Passing material does not make it usable:
 * once every line is inspected the GRN is raised for Site Engineer and Project
 * Manager approval, and the stock is posted after that.
 */
export function QcInspectionForm({ mutation, record }) {
  const received = record.receivedQuantity;
  const [answers, setAnswers] = useState({});
  const [rejectedText, setRejectedText] = useState("0");
  const [remarks, setRemarks] = useState("");

  const rejected = Number(rejectedText);
  const invalidQuantity =
    rejectedText.trim() === "" ||
    !Number.isFinite(rejected) ||
    rejected < 0 ||
    rejected > received;
  const accepted = invalidQuantity ? null : received - rejected;
  const unansweredCount = QC_CHECKLIST_ITEMS.filter((item) => !answers[item.key]).length;
  const failedChecks = QC_CHECKLIST_ITEMS.filter((item) => answers[item.key] === "fail");
  const canSubmit =
    !mutation.isPending &&
    !invalidQuantity &&
    unansweredCount === 0 &&
    remarks.trim().length > 0;

  function submit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    mutation.mutate({
      qcId: record.id,
      acceptedQuantity: accepted,
      rejectedQuantity: rejected,
      remarks: remarks.trim(),
      checklist: QC_CHECKLIST_ITEMS.map((item) => ({
        key: item.key,
        label: item.label,
        result: answers[item.key],
      })),
    });
  }

  let decision = null;
  if (invalidQuantity) {
    decision = (
      <Decision $tone="danger" role="status">
        Rejected quantity must be between 0 and {formatQuantity(received, record.unit)}.
      </Decision>
    );
  } else if (rejected === 0) {
    decision = (
      <Decision $tone={failedChecks.length ? "warning" : "success"} role="status">
        <strong>Accept the full delivery.</strong> {formatQuantity(accepted, record.unit)} will
        go into the GRN for approval before it is posted to {record.projectName} stock.
        {failedChecks.length
          ? " A check is marked Fail but nothing is being rejected — explain why in the remarks."
          : ""}
      </Decision>
    );
  } else if (accepted === 0) {
    decision = (
      <Decision $tone="danger" role="status">
        <strong>Reject the full delivery.</strong> Nothing goes into a GRN or stock; the vendor will
        need to replace or refund it.
      </Decision>
    );
  } else {
    decision = (
      <Decision $tone="warning" role="status">
        <strong>Partial acceptance.</strong> {formatQuantity(accepted, record.unit)} will go into the
        GRN for approval before it is posted to {record.projectName} stock;{" "}
        {formatQuantity(rejected, record.unit)} rejected and sent back to the vendor.
      </Decision>
    );
  }

  return (
    <Panel as="form" noValidate onSubmit={submit}>
      <PanelHeader>
        <ClipboardCheck aria-hidden="true" />
        Inspect delivery
      </PanelHeader>
      <Body>
        <Intro>
          Check the delivery against the purchase order, mark each item, then record how much
          passes. Only the accepted quantity goes forward — through GRN approval, stock posting and store
          confirmation — before it is usable at {record.projectName}.
        </Intro>

        <div>
          <SectionTitle>1. Quality checklist</SectionTitle>
          {QC_CHECKLIST_ITEMS.map((item) => (
            <CheckRow key={item.key}>
              <span id={`qc-check-label-${item.key}`}>{item.label}</span>
              <Segmented aria-labelledby={`qc-check-label-${item.key}`} role="radiogroup">
                {QC_CHECK_RESULT_OPTIONS.map((option) => (
                  <Choice
                    $selected={answers[item.key] === option.value}
                    $tone={option.value}
                    key={option.value}
                  >
                    <input
                      checked={answers[item.key] === option.value}
                      name={`qc-check-${item.key}`}
                      onChange={() =>
                        setAnswers((current) => ({ ...current, [item.key]: option.value }))
                      }
                      type="radio"
                      value={option.value}
                    />
                    {option.label}
                  </Choice>
                ))}
              </Segmented>
            </CheckRow>
          ))}
        </div>

        <div>
          <SectionTitle>2. Quantity</SectionTitle>
          <QuantityGrid>
            <Field>
              <Label>Received</Label>
              <strong>{formatQuantity(received, record.unit)}</strong>
            </Field>
            <Field>
              <Label htmlFor="qc-rejected-quantity">Rejected ({record.unit})</Label>
              <Input
                aria-invalid={invalidQuantity}
                id="qc-rejected-quantity"
                inputMode="decimal"
                min={0}
                max={received}
                onChange={(event) => setRejectedText(event.target.value)}
                step="any"
                type="number"
                value={rejectedText}
              />
            </Field>
            <Field>
              <Label>Accepted (to GRN)</Label>
              <strong>{accepted === null ? "—" : formatQuantity(accepted, record.unit)}</strong>
            </Field>
            <QuickActions>
              <Button onClick={() => setRejectedText("0")} size="sm" type="button" variant="outline">
                <CircleCheck aria-hidden="true" />
                Accept all
              </Button>
              <Button
                onClick={() => setRejectedText(String(received))}
                size="sm"
                type="button"
                variant="outline"
              >
                <CircleX aria-hidden="true" />
                Reject all
              </Button>
            </QuickActions>
          </QuantityGrid>
        </div>

        {decision}

        <Field>
          <SectionTitle as="label" htmlFor="qc-remarks">
            3. Remarks
          </SectionTitle>
          <Textarea
            id="qc-remarks"
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="What you found — e.g. 5 bags torn, rest in good condition"
            rows={3}
            value={remarks}
          />
        </Field>

        {mutation.isError ? (
          <ErrorNote role="alert">
            {mutation.error?.message ?? "The inspection could not be recorded. Please try again."}
          </ErrorNote>
        ) : null}

        <Footer>
          <Hint>
            {unansweredCount > 0
              ? `${unansweredCount} checklist item${unansweredCount === 1 ? "" : "s"} still to answer.`
              : remarks.trim().length === 0
                ? "Add remarks to finish."
                : "Ready to record."}
          </Hint>
          <Button disabled={!canSubmit} type="submit">
            {mutation.isPending ? "Recording…" : "Record inspection"}
          </Button>
        </Footer>
      </Body>
    </Panel>
  );
}
