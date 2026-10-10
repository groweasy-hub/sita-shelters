"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  IndianRupee,
  Printer,
  ReceiptText,
  Save,
} from "lucide-react";
import styled, { createGlobalStyle } from "styled-components";

import {
  KpiCard,
  KpiGrid,
  PageHeader,
  ProjectFilterSelect,
  StatusBadge,
} from "@/components/shared";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { ALL_PROJECTS_VALUE } from "@/config/constants";
import { inProjectScope, useProjectScope } from "@/features/profile";
import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatQuantity,
} from "@/lib/formatters";
import { useBillings, useUpdateBillingCharges } from "../hooks/use-billings";

const PrintStyles = createGlobalStyle`
  @media print {
    @page {
      size: A4 portrait;
      margin: 5mm;
    }
    body * {
      visibility: hidden !important;
    }
    .billing-print-surface,
    .billing-print-surface * {
      visibility: visible !important;
    }
    .billing-print-surface {
      position: absolute !important;
      inset: 0 !important;
      box-sizing: border-box !important;
      width: 200mm !important;
      height: 287mm !important;
      max-width: none !important;
      margin: 0 !important;
      border: 0 !important;
      box-shadow: none !important;
      overflow: hidden !important;
    }
    .no-print {
      display: none !important;
    }
  }
`;

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Workspace = styled.div`
  display: grid;
  gap: 1rem;
  @media (min-width: 1100px) {
    grid-template-columns: minmax(28rem, 0.9fr) minmax(32rem, 1.1fr);
    align-items: start;
  }
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;
const SearchInput = styled.input`
  width: min(100%, 22rem);
  height: 2.25rem;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.875rem;
`;
const DateField = styled.label`
  display: grid;
  gap: 0.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
`;
const DateInput = styled(SearchInput)`
  width: 10.5rem;
`;
const InvoiceList = styled.div`
  display: grid;
`;
const InvoiceRow = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? `${theme.colors.primary}10` : "transparent"};
  color: inherit;
  text-align: left;
  cursor: pointer;
  &:last-child {
    border-bottom: 0;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
`;
const InvoiceMain = styled.div`
  display: grid;
  gap: 0.25rem;
  min-width: 0;
`;
const InvoiceTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
`;
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Amount = styled.span`
  align-self: center;
  font-size: 0.875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;
const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;
const InvoicePaper = styled.article`
  box-sizing: border-box;
  width: min(100%, 200mm);
  min-height: 287mm;
  max-height: 287mm;
  margin: 0 auto;
  padding: 0;
  color: #071f4f;
  background: #ffffff;
  font-family: "Times New Roman", Times, serif;
  border: 1px solid #d9e1ea;
  box-shadow: 0 1rem 3rem rgb(15 23 42 / 0.08);
  overflow: hidden;

  @media print {
    width: 200mm;
    height: 287mm;
    min-height: 287mm;
    max-height: 287mm;
    padding: 0;
    border: 0;
    box-shadow: none;
    overflow: hidden;
  }
`;
const InvoiceInner = styled.div`
  display: grid;
  gap: 2.45mm;
  padding: 4.5mm 5mm 3.8mm;
  transform: scale(0.985);
  transform-origin: top left;
  width: calc(100% / 0.985);
`;
const InvoiceHeader = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(72mm, 0.9fr);
  gap: 8mm;
  align-items: start;
`;
const BrandBlock = styled.div`
  display: grid;
  gap: 2.4mm;
`;
const BrandImage = styled.img`
  width: 92mm;
  max-width: 100%;
  height: auto;
  object-fit: contain;
`;
const CompanyAddress = styled.div`
  display: grid;
  gap: 0.45mm;
  font-size: 3.75mm;
  line-height: 1.1;
`;
const CompanyName = styled.strong`
  display: block;
  font-size: 5.35mm;
  line-height: 1;
`;
const InvoiceTitleBlock = styled.div`
  display: grid;
  gap: 1.7mm;
`;
const InvoiceHeading = styled.h2`
  margin: 0;
  color: #071f4f;
  font-size: 7.4mm;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.02em;
  white-space: nowrap;
  span {
    color: #d30026;
  }
`;
const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 3.25mm;
  td {
    border: 1px solid #a7b3c0;
    padding: 1.65mm 2.35mm;
  }
  td:first-child {
    width: 38%;
    background: #edf4fa;
    font-weight: 800;
  }
`;
const AccentRule = styled.div`
  display: grid;
  grid-template-columns: 1fr 42mm;
  height: 1mm;
  background: #071f4f;
  span {
    background: #d30026;
  }
`;
const InfoGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5mm;
`;
const InfoBox = styled.div`
  min-height: 35mm;
  border: 1px solid #a7b3c0;
  font-size: 3.45mm;
  line-height: 1.11;
`;
const BoxTitle = styled.h3`
  margin: 0;
  padding: 1.55mm 2.4mm;
  border-bottom: 1px solid #a7b3c0;
  background: #edf4fa;
  font-size: 3.75mm;
  line-height: 1;
`;
const BoxContent = styled.div`
  padding: 2mm 2.4mm;
  strong {
    font-weight: 900;
  }
`;
const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  color: #071f4f;
  font-size: 3.25mm;
  line-height: 1.04;
  th,
  td {
    border: 1px solid #a7b3c0;
    padding: 1.55mm 2mm;
    vertical-align: top;
  }
  th {
    background: #edf4fa;
    text-align: center;
    font-size: 3.15mm;
    font-weight: 900;
  }
  .center {
    text-align: center;
  }
  .number {
    text-align: right;
  }
  .item-row {
    height: 9.4mm;
  }
  .blank-row {
    height: 5.8mm;
  }
  .empty-left {
    border-right: 0;
    border-bottom: 0;
  }
  .total-label {
    background: #edf4fa;
    font-weight: 700;
  }
  .grand-label,
  .grand-value {
    background: #071f4f;
    color: #ffffff;
    font-size: 3.7mm;
    font-weight: 900;
  }
  .grand-label {
    text-align: center;
  }
`;
const WordsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #071f4f;
  font-size: 3.25mm;
  td {
    border: 1px solid #a7b3c0;
    padding: 2.15mm 2.5mm;
  }
  td:first-child {
    width: 32mm;
    background: #edf4fa;
    font-weight: 900;
    line-height: 1.05;
  }
  td:last-child {
    font-weight: 900;
  }
`;
const AccountSignatureGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(64mm, 0.95fr);
`;
const AccountTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #071f4f;
  font-size: 3.2mm;
  td {
    border: 1px solid #a7b3c0;
    padding: 1.75mm 2.35mm;
  }
  .title {
    background: #edf4fa;
    font-size: 3.45mm;
    font-weight: 900;
  }
  .label {
    width: 34%;
    background: #edf4fa;
    font-weight: 900;
  }
`;
const SignatureBox = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  border: 1px solid #a7b3c0;
  border-left: 0;
  padding: 2.2mm 6mm 3mm;
  color: #071f4f;
  font-size: 3.2mm;
  font-weight: 900;
  text-align: center;
`;
const SignatureLine = styled.div`
  align-self: end;
  margin-bottom: 3mm;
  border-bottom: 1px solid #8b98a8;
`;
const Footer = styled.footer`
  display: grid;
  gap: 2.8mm;
  margin-top: 1.8mm;
  color: #071f4f;
  font-size: 3.1mm;
  text-align: center;
  ${AccentRule} {
    height: 0.9mm;
  }
`;
const ChargePanel = styled.div`
  display: grid;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted};
`;
const ChargeGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  @media (min-width: 720px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;
const Field = styled.label`
  display: grid;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`;
const NumberInput = styled.input`
  height: 2.25rem;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
`;
const ChargeSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitsToWords(value) {
  if (value < 20) return ONES[value];
  return [TENS[Math.floor(value / 10)], ONES[value % 10]].filter(Boolean).join(" ");
}

function amountToWords(value) {
  const amount = Math.floor(value);
  const paise = Math.round((value - amount) * 100);
  if (amount === 0 && paise === 0) return "Rupees Zero Only";
  const parts = [];
  const crore = Math.floor(amount / 10000000);
  const lakh = Math.floor((amount % 10000000) / 100000);
  const thousand = Math.floor((amount % 100000) / 1000);
  const hundred = Math.floor((amount % 1000) / 100);
  const rest = amount % 100;
  if (crore) parts.push(`${twoDigitsToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitsToWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitsToWords(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(twoDigitsToWords(rest));
  const rupees = amount > 0 ? `Rupees ${parts.join(" ")}` : "Rupees Zero";
  return paise > 0
    ? `${rupees} and ${twoDigitsToWords(paise)} Paise Only`
    : `${rupees} Only`;
}

function matchesSearch(invoice, search) {
  if (!search.trim()) return true;
  const needle = search.toLocaleLowerCase();
  return [
    invoice.invoiceNumber,
    invoice.id,
    invoice.purchaseOrderId,
    invoice.vendorName,
    invoice.projectName,
    invoice.deliveryChallanNumber,
  ]
    .join(" ")
    .toLocaleLowerCase()
    .includes(needle);
}

function isWithinDateRange(invoice, fromDate, toDate) {
  const invoiceTime = new Date(invoice.invoiceDate).getTime();
  if (Number.isNaN(invoiceTime)) return false;
  if (fromDate) {
    const fromTime = new Date(`${fromDate}T00:00:00`).getTime();
    if (invoiceTime < fromTime) return false;
  }
  if (toDate) {
    const toTime = new Date(`${toDate}T23:59:59.999`).getTime();
    if (invoiceTime > toTime) return false;
  }
  return true;
}

function chargeDraftFromInvoice(invoice) {
  return {
    transportationFee: String(invoice?.transportationFee ?? 0),
    labourCharges: String(invoice?.labourCharges ?? 0),
    otherCharges: String(invoice?.otherCharges ?? 0),
    taxPercent: String(invoice?.chargeTaxPercent ?? 18),
  };
}

function normalizeChargeDraft(draft) {
  return {
    transportationFee: Number(draft.transportationFee) || 0,
    labourCharges: Number(draft.labourCharges) || 0,
    otherCharges: Number(draft.otherCharges) || 0,
    taxPercent: Number(draft.taxPercent) || 0,
  };
}

function formatInvoiceAmount(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function safeFileName(value) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "");
}

async function imageToDataUrl(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error("Logo could not be loaded");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function downloadInvoiceHtml(invoice) {
  const surface = document.querySelector(".billing-print-surface");
  if (!surface) return;
  let logoSrc = `${window.location.origin}/images/image.png`;
  try {
    logoSrc = await imageToDataUrl("/images/image.png");
  } catch (error) {
    console.warn("Falling back to hosted invoice logo", error);
  }
  const invoiceNode = surface.cloneNode(true);
  invoiceNode.querySelectorAll(".brand-image").forEach((image) => {
    image.setAttribute("src", logoSrc);
  });
  const invoiceMarkup = invoiceNode.outerHTML;
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${invoice.invoiceNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 5mm; }
    body { margin: 0; background: #fff; color: #071f4f; font-family: "Times New Roman", Times, serif; }
    .invoice-download { padding: 0; }
    .sita-invoice { box-sizing: border-box; width: 200mm; height: 287mm; min-height: 287mm; max-height: 287mm; margin: 0 auto; padding: 0; overflow: hidden; background: #fff; color: #071f4f; font-family: "Times New Roman", Times, serif; }
    .sita-invoice * { box-sizing: border-box; }
    .invoice-inner { display: grid; gap: 2.45mm; padding: 4.5mm 5mm 3.8mm; transform: scale(.985); transform-origin: top left; width: calc(100% / .985); }
    .invoice-header { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(72mm, .9fr); gap: 8mm; align-items: start; }
    .brand-block { display: grid; gap: 2.4mm; }
    .brand-image { width: 92mm; max-width: 100%; height: auto; object-fit: contain; }
    .company-address { display: grid; gap: .45mm; font-size: 3.75mm; line-height: 1.1; }
    .company-name { display: block; font-size: 5.35mm; line-height: 1; font-weight: 900; }
    .invoice-title-block { display: grid; gap: 1.7mm; }
    .invoice-heading { margin: 0; color: #071f4f; font-size: 7.4mm; line-height: 1; font-weight: 900; letter-spacing: -.02em; white-space: nowrap; }
    .invoice-heading span { color: #d30026; }
    .detail-table, .items-table, .words-table, .account-table { width: 100%; border-collapse: collapse; }
    .detail-table { font-size: 3.25mm; }
    .detail-table td { border: 1px solid #a7b3c0; padding: 1.65mm 2.35mm; }
    .detail-table td:first-child { width: 38%; background: #edf4fa; font-weight: 800; }
    .accent-rule { display: grid; grid-template-columns: 1fr 42mm; height: 1mm; background: #071f4f; }
    .accent-rule span { background: #d30026; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm; }
    .info-box { min-height: 35mm; border: 1px solid #a7b3c0; font-size: 3.45mm; line-height: 1.11; }
    .box-title { margin: 0; padding: 1.55mm 2.4mm; border-bottom: 1px solid #a7b3c0; background: #edf4fa; font-size: 3.75mm; line-height: 1; }
    .box-content { padding: 2mm 2.4mm; }
    .items-table { table-layout: fixed; font-size: 3.25mm; line-height: 1.04; }
    .items-table th, .items-table td { border: 1px solid #a7b3c0; padding: 1.55mm 2mm; vertical-align: top; }
    .items-table th { background: #edf4fa; text-align: center; font-size: 3.15mm; font-weight: 900; }
    .center { text-align: center; }
    .number { text-align: right; }
    .item-row { height: 9.4mm; }
    .blank-row { height: 5.8mm; }
    .empty-left { border-right: 0 !important; border-bottom: 0 !important; }
    .total-label { background: #edf4fa; font-weight: 700; }
    .grand-label, .grand-value { background: #071f4f; color: #fff; font-size: 3.7mm; font-weight: 900; }
    .grand-label { text-align: center; }
    .words-table { font-size: 3.25mm; }
    .words-table td { border: 1px solid #a7b3c0; padding: 2.15mm 2.5mm; }
    .words-table td:first-child { width: 32mm; background: #edf4fa; font-weight: 900; line-height: 1.05; }
    .words-table td:last-child { font-weight: 900; }
    .account-signature-grid { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(64mm, .95fr); }
    .account-table { font-size: 3.2mm; }
    .account-table td { border: 1px solid #a7b3c0; padding: 1.75mm 2.35mm; }
    .account-table .title, .account-table .label { background: #edf4fa; font-weight: 900; }
    .account-table .label { width: 34%; }
    .signature-box { display: grid; grid-template-rows: auto 1fr auto; border: 1px solid #a7b3c0; border-left: 0; padding: 2.2mm 6mm 3mm; font-size: 3.2mm; font-weight: 900; text-align: center; }
    .signature-line { align-self: end; margin-bottom: 3mm; border-bottom: 1px solid #8b98a8; }
    .footer { display: grid; gap: 2.8mm; margin-top: 1.8mm; font-size: 3.1mm; text-align: center; }
    .footer .accent-rule { height: .9mm; }
  </style>
</head>
<body>
  <main class="invoice-download">${invoiceMarkup}</main>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(invoice.invoiceNumber || invoice.id)}.html`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function PrintInvoice({ invoice }) {
  const totalTaxPercent =
    invoice.taxableAmount > 0 ? (invoice.taxAmount / invoice.taxableAmount) * 100 : 0;
  const splitTaxPercent = totalTaxPercent / 2;
  const cgst = invoice.taxAmount / 2;
  const sgst = invoice.taxAmount / 2;
  const materialLines = invoice.lines.filter((line) => line.lineType === "material");
  const chargeLines = invoice.lines.filter((line) => line.lineType === "charge");
  const allDisplayLines = [...materialLines, ...chargeLines];
  const displayLines = allDisplayLines.slice(0, 6);
  const overflowValue = allDisplayLines
    .slice(6)
    .reduce((sum, line) => sum + line.taxableAmount, 0);
  if (overflowValue > 0) {
    displayLines.push({
      materialCode: "ADDITIONAL",
      materialName: `${allDisplayLines.length - 6} additional line${allDisplayLines.length - 6 === 1 ? "" : "s"}`,
      hsnCode: "995419",
      lineType: "charge",
      quantity: 1,
      unit: "job",
      unitPrice: overflowValue,
      taxableAmount: overflowValue,
    });
  }
  const blankRows = Math.max(0, 6 - displayLines.length);
  return (
    <InvoicePaper className="billing-print-surface sita-invoice">
      <InvoiceInner className="invoice-inner">
        <InvoiceHeader className="invoice-header">
          <BrandBlock className="brand-block">
            <BrandImage
              alt="Sita Shelters - Creating Timeless Dreams"
              className="brand-image"
              src="/images/image.png"
            />
            <CompanyAddress className="company-address">
              <CompanyName className="company-name">Sita Shelters Pvt. Ltd.</CompanyName>
              <span>H.No.7-1-21/B, Flat No.107, Sita Sarovar,</span>
              <span>Begumpet, Hyderabad - 500016.</span>
            </CompanyAddress>
          </BrandBlock>
          <InvoiceTitleBlock className="invoice-title-block">
            <InvoiceHeading className="invoice-heading">
              PROFORMA <span>INVOICE</span>
            </InvoiceHeading>
            <DetailTable className="detail-table">
              <tbody>
                <tr>
                  <td>GSTIN:</td>
                  <td>36AAKCS2926A1ZK</td>
                </tr>
                <tr>
                  <td>INVOICE NO:</td>
                  <td>{invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td>INVOICE DATE:</td>
                  <td>{formatDate(invoice.invoiceDate)}</td>
                </tr>
                <tr>
                  <td>PAN NO:</td>
                  <td>AAKCS2926A</td>
                </tr>
              </tbody>
            </DetailTable>
          </InvoiceTitleBlock>
        </InvoiceHeader>
        <AccentRule className="accent-rule">
          <span />
        </AccentRule>
        <InfoGrid className="info-grid">
          <InfoBox className="info-box">
            <BoxTitle className="box-title">Bill To:</BoxTitle>
            <BoxContent className="box-content">
              <strong>{invoice.vendorName}</strong>
              <br />
              {invoice.vendorAddress}
              {invoice.vendorGstNumber ? (
                <>
                  <br />
                  <strong>GST:</strong> {invoice.vendorGstNumber}
                </>
              ) : null}
            </BoxContent>
          </InfoBox>
          <InfoBox className="info-box">
            <BoxTitle className="box-title">Location of Premises:</BoxTitle>
            <BoxContent className="box-content">
              <strong>{invoice.projectName}</strong>
              <br />
              {invoice.projectAddress}
              <br />
              <strong>Purchase Order:</strong> {invoice.purchaseOrderNumber}
              <br />
              <strong>Delivery Challan:</strong> {invoice.deliveryChallanNumber}
              <br />
              <strong>Vehicle:</strong> {invoice.vehicleNumber}
              {" | "}
              <strong>Transporter:</strong> {invoice.transporterName}
            </BoxContent>
          </InfoBox>
        </InfoGrid>
        <ItemsTable className="items-table">
        <colgroup>
          <col style={{ width: "7%" }} />
          <col style={{ width: "11.5%" }} />
          <col style={{ width: "26.5%" }} />
          <col style={{ width: "19.5%" }} />
          <col style={{ width: "12.5%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "12%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>S.No</th>
            <th>HSN Code</th>
            <th>Description of Services</th>
            <th>Service / Reference</th>
            <th>Qty</th>
            <th>Rate<br />(INR)</th>
            <th>Amount<br />(INR)</th>
          </tr>
        </thead>
        <tbody>
          {displayLines.map((line, index) => (
            <tr className="item-row" key={`${line.materialCode}-${index}`}>
              <td className="center">{index + 1}</td>
              <td className="center">{line.hsnCode}</td>
              <td>{line.materialName}</td>
              <td>
                {line.lineType === "material"
                  ? `Received against ${invoice.purchaseOrderNumber}`
                  : "Against received material invoice"}
              </td>
              <td className="center">
                {line.lineType === "material"
                  ? formatQuantity(line.quantity, line.unit)
                  : line.quantity > 0
                    ? "1 job"
                    : "-"}
              </td>
              <td className="number">{formatInvoiceAmount(line.unitPrice)}</td>
              <td className="number">{formatInvoiceAmount(line.taxableAmount)}</td>
            </tr>
          ))}
          {Array.from({ length: blankRows }).map((_, index) => (
            <tr className="blank-row" key={`blank-${index}`}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
          <tr>
            <td className="empty-left" colSpan={4} rowSpan={5}></td>
            <td className="empty-left"></td>
            <td className="total-label">Taxable Value</td>
            <td className="number">{formatInvoiceAmount(invoice.taxableAmount)}</td>
          </tr>
          <tr>
            <td className="empty-left"></td>
            <td className="total-label">SGST ({splitTaxPercent.toFixed(2).replace(/\.00$/, "")}%)</td>
            <td className="number">{formatInvoiceAmount(sgst)}</td>
          </tr>
          <tr>
            <td className="empty-left"></td>
            <td className="total-label">CGST ({splitTaxPercent.toFixed(2).replace(/\.00$/, "")}%)</td>
            <td className="number">{formatInvoiceAmount(cgst)}</td>
          </tr>
          <tr>
            <td className="empty-left"></td>
            <td className="total-label">Total Tax ({totalTaxPercent.toFixed(2).replace(/\.00$/, "")}%)</td>
            <td className="number">{formatInvoiceAmount(invoice.taxAmount)}</td>
          </tr>
          <tr>
            <td className="grand-label" colSpan={2}>Total Invoice Amount (INR)</td>
            <td className="grand-value number">{formatInvoiceAmount(invoice.totalAmount)}</td>
          </tr>
        </tbody>
      </ItemsTable>
      <WordsTable className="words-table">
        <tbody>
          <tr>
            <td>Invoice Value<br />in words</td>
            <td>{amountToWords(invoice.totalAmount)}</td>
          </tr>
        </tbody>
      </WordsTable>
      <AccountSignatureGrid className="account-signature-grid">
        <AccountTable className="account-table">
          <tbody>
            <tr>
              <td className="title" colSpan={2}>ACCOUNT DETAILS</td>
            </tr>
            <tr>
              <td className="label">Account Name</td>
              <td>Sita Shelters Private Limited</td>
            </tr>
            <tr>
              <td className="label">A/c No</td>
              <td>1410010000000478</td>
            </tr>
            <tr>
              <td className="label">IFSC</td>
              <td>KVBL0001410</td>
            </tr>
            <tr>
              <td className="label">Branch</td>
              <td>Secunderabad.</td>
            </tr>
          </tbody>
        </AccountTable>
        <SignatureBox className="signature-box">
          <div>For Sita Shelters Pvt. Ltd.</div>
          <SignatureLine className="signature-line" />
          <div>Authorized Signatory</div>
        </SignatureBox>
      </AccountSignatureGrid>
      <Footer className="footer">
        <AccentRule className="accent-rule">
          <span />
        </AccentRule>
        <div>H.No.7-1-21/B, Flat No.107, Sita Sarovar, Begumpet, Hyderabad - 500016.</div>
      </Footer>
      </InvoiceInner>
    </InvoicePaper>
  );
}

export function BillingsScreen() {
  const { data: rawInvoices = [], isPending } = useBillings();
  const updateChargesMutation = useUpdateBillingCharges();
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [chargeDraft, setChargeDraft] = useState(chargeDraftFromInvoice(null));
  const invoices = useMemo(
    () =>
      rawInvoices
        .filter((invoice) => inProjectScope(scopeProjectIds, invoice.projectId))
        .filter((invoice) =>
          !projectId || projectId === ALL_PROJECTS_VALUE
            ? true
            : invoice.projectId === projectId,
        )
        .filter((invoice) => isWithinDateRange(invoice, fromDate, toDate))
        .filter((invoice) => matchesSearch(invoice, search)),
    [fromDate, projectId, rawInvoices, scopeProjectIds, search, toDate],
  );
  const selectedInvoice =
    invoices.find((invoice) => invoice.id === selectedId) ?? invoices[0] ?? null;
  const kpis = useMemo(
    () => ({
      count: invoices.length,
      taxable: invoices.reduce((sum, invoice) => sum + invoice.taxableAmount, 0),
      tax: invoices.reduce((sum, invoice) => sum + invoice.taxAmount, 0),
      total: invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
    }),
    [invoices],
  );

  useEffect(() => {
    if (!selectedInvoice) {
      setSelectedId(null);
      return;
    }
    if (selectedInvoice.id !== selectedId) {
      setSelectedId(selectedInvoice.id);
    }
  }, [selectedId, selectedInvoice]);

  useEffect(() => {
    setChargeDraft(chargeDraftFromInvoice(selectedInvoice));
  }, [selectedInvoice?.id]);

  function showInvoices() {
    setSearch("");
    setFromDate("");
    setToDate("");
    if (selectedInvoice) setSelectedId(selectedInvoice.id);
  }

  function updateChargeField(field, value) {
    setChargeDraft((current) => ({ ...current, [field]: value }));
  }

  function saveCharges() {
    if (!selectedInvoice) return;
    updateChargesMutation.mutate({
      invoiceId: selectedInvoice.id,
      input: normalizeChargeDraft(chargeDraft),
    });
  }

  function printInvoice(invoice) {
    setSelectedId(invoice.id);
    window.setTimeout(() => window.print(), 50);
  }

  function downloadInvoice(invoice) {
    setSelectedId(invoice.id);
    window.setTimeout(() => downloadInvoiceHtml(invoice), 50);
  }

  if (isPending) {
    return <LoadingState label="Loading billings" variant="page" />;
  }

  return (
    <Root>
      <PrintStyles />
      <PageHeader
        description="Invoice billing view for received material invoices, with taxable value, GST, total amount, and a printable proforma-style invoice."
        eyebrow="Invoice billing"
        title="Billings"
      />
      <KpiGrid>
        <KpiCard icon={ReceiptText} label="Invoices" onClick={showInvoices} value={formatCompactNumber(kpis.count)} />
        <KpiCard icon={IndianRupee} label="Taxable value" onClick={showInvoices} value={formatCurrency(kpis.taxable, { maximumFractionDigits: 0 })} />
        <KpiCard icon={FileText} label="GST amount" onClick={showInvoices} value={formatCurrency(kpis.tax, { maximumFractionDigits: 0 })} />
        <KpiCard icon={IndianRupee} label="Invoice total" onClick={showInvoices} value={formatCurrency(kpis.total, { maximumFractionDigits: 0 })} />
      </KpiGrid>
      <Panel className="no-print">
        <PanelHeader>
          <FilterRow>
            <ProjectFilterSelect
              isLocked={isLocked}
              onChange={setProjectId}
              scopeProjectIds={scopeProjectIds}
              value={projectId}
            />
            <SearchInput
              aria-label="Search billings"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice, GRN, PO or vendor"
              value={search}
            />
            <DateField>
              From date
              <DateInput
                aria-label="Filter invoices from date"
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
                type="date"
                value={fromDate}
              />
            </DateField>
            <DateField>
              To date
              <DateInput
                aria-label="Filter invoices to date"
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                type="date"
                value={toDate}
              />
            </DateField>
          </FilterRow>
        </PanelHeader>
      </Panel>
      <Workspace>
        <Panel className="no-print">
          <PanelHeader>
            <strong>Invoice register</strong>
            <Muted>{invoices.length} records</Muted>
          </PanelHeader>
          {invoices.length ? (
            <InvoiceList>
              {invoices.map((invoice) => (
                <InvoiceRow
                  $active={selectedInvoice?.id === invoice.id}
                  key={invoice.id}
                  onClick={() => setSelectedId(invoice.id)}
                  type="button"
                >
                  <InvoiceMain>
                    <InvoiceTitle>{invoice.invoiceNumber}</InvoiceTitle>
                    <Muted>
                      {invoice.vendorName} | {invoice.projectName} | {formatDate(invoice.invoiceDate)}
                    </Muted>
                    <Muted>
                      {invoice.id} | {invoice.purchaseOrderNumber} | <StatusBadge status={invoice.stage} />
                    </Muted>
                  </InvoiceMain>
                  <Amount>{formatCurrency(invoice.totalAmount, { maximumFractionDigits: 0 })}</Amount>
                </InvoiceRow>
              ))}
            </InvoiceList>
          ) : (
            <EmptyState
              compact
              description="Try clearing the search or changing the project filter."
              title="No billing invoices found"
            />
          )}
        </Panel>
        <Panel>
          <PanelHeader className="no-print">
            <strong>{selectedInvoice ? selectedInvoice.invoiceNumber : "Invoice preview"}</strong>
            {selectedInvoice ? (
              <ActionRow>
                <Button onClick={() => setSelectedId(selectedInvoice.id)} size="sm" variant="outline">
                  <Eye aria-hidden="true" />
                  View
                </Button>
                <Button onClick={() => printInvoice(selectedInvoice)} size="sm">
                  <Printer aria-hidden="true" />
                  Print
                </Button>
                <Button onClick={() => downloadInvoice(selectedInvoice)} size="sm" variant="outline">
                  <Download aria-hidden="true" />
                  Download
                </Button>
              </ActionRow>
            ) : null}
          </PanelHeader>
          {selectedInvoice ? (
            <ChargePanel className="no-print">
              <ChargeGrid>
                <Field>
                  Transportation fee
                  <NumberInput
                    min="0"
                    onChange={(event) =>
                      updateChargeField("transportationFee", event.target.value)
                    }
                    step="0.01"
                    type="number"
                    value={chargeDraft.transportationFee}
                  />
                </Field>
                <Field>
                  Labour charges
                  <NumberInput
                    min="0"
                    onChange={(event) =>
                      updateChargeField("labourCharges", event.target.value)
                    }
                    step="0.01"
                    type="number"
                    value={chargeDraft.labourCharges}
                  />
                </Field>
                <Field>
                  Other charges
                  <NumberInput
                    min="0"
                    onChange={(event) =>
                      updateChargeField("otherCharges", event.target.value)
                    }
                    step="0.01"
                    type="number"
                    value={chargeDraft.otherCharges}
                  />
                </Field>
                <Field>
                  GST on charges %
                  <NumberInput
                    min="0"
                    max="100"
                    onChange={(event) => updateChargeField("taxPercent", event.target.value)}
                    step="0.01"
                    type="number"
                    value={chargeDraft.taxPercent}
                  />
                </Field>
              </ChargeGrid>
              <ActionRow>
                <Button
                  disabled={updateChargesMutation.isPending}
                  onClick={saveCharges}
                  size="sm"
                  type="button"
                >
                  <Save aria-hidden="true" />
                  {updateChargesMutation.isPending ? "Saving" : "Save charges"}
                </Button>
              </ActionRow>
              <ChargeSummary>
                <span>Material: {formatCurrency(selectedInvoice.materialAmount)}</span>
                <span>Charges: {formatCurrency(selectedInvoice.chargesAmount)}</span>
                <span>Total: {formatCurrency(selectedInvoice.totalAmount)}</span>
              </ChargeSummary>
            </ChargePanel>
          ) : null}
          {selectedInvoice ? (
            <PrintInvoice invoice={selectedInvoice} />
          ) : (
            <EmptyState compact description="Select an invoice to preview and print." title="No invoice selected" />
          )}
        </Panel>
      </Workspace>
    </Root>
  );
}
