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
      margin: 7mm;
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
      width: 196mm !important;
      max-width: none !important;
      margin: 0 !important;
      border: 0 !important;
      box-shadow: none !important;
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
  width: min(100%, 190mm);
  min-height: 270mm;
  max-height: 270mm;
  margin: 0 auto;
  padding: 0 2mm;
  color: #000000;
  background: #ffffff;
  font-family: "Times New Roman", Times, serif;
  overflow: hidden;

  @media print {
    width: 196mm;
    min-height: 283mm;
    max-height: 283mm;
    padding: 0;
  }
`;
const BrandHeader = styled.header`
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.08rem;
  align-items: center;
  height: 13mm;
  color: #000000;
`;
const BrandName = styled.strong`
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.12rem;
  line-height: 1;
  font-weight: 700;
  text-align: center;
`;
const BrandTagline = styled.span`
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.48rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-align: center;
`;
const ProformaTable = styled.table`
  width: 100%;
  height: calc(100% - 13mm);
  border-collapse: collapse;
  table-layout: fixed;
  border: 2px solid #000000;
  font-size: 0.72rem;
  line-height: 1.22;
  th,
  td {
    border: 1px solid #000000;
    padding: 0.22rem 0.32rem;
    vertical-align: top;
    overflow-wrap: anywhere;
  }
  th {
    background: #ffffff;
    font-size: 0.68rem;
    font-weight: 700;
  }
  .title {
    height: 2rem;
    text-align: center;
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 0.06em;
  }
  .label {
    font-weight: 800;
  }
  .company {
    font-weight: 700;
  }
  .address-cell {
    height: 4.9rem;
  }
  .spacer {
    height: 0.7rem;
  }
  .item-row {
    height: 2.15rem;
  }
  .amount,
  .number {
    text-align: right;
  }
  .center {
    text-align: center;
  }
  .words {
    min-height: 2.2rem;
  }
  .account-title {
    font-weight: 800;
    text-align: center;
  }
  .signature {
    height: 2.6rem;
    text-align: center;
    vertical-align: bottom;
    font-weight: 700;
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
  const amount = Math.round(value);
  if (amount === 0) return "Rupees Zero Only";
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
  return `Rupees ${parts.join(" ")} Only`;
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

function downloadInvoiceHtml(invoice) {
  const surface = document.querySelector(".billing-print-surface");
  if (!surface) return;
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${invoice.invoiceNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 7mm; }
    body { margin: 0; background: #fff; color: #000; font-family: "Times New Roman", Times, serif; }
    .invoice-download { padding: 0; }
    .invoice-download article { width: 196mm; min-height: 283mm; max-height: 283mm; overflow: hidden; padding: 0; }
    .invoice-download header { display: grid; justify-items: center; align-content: center; gap: 1px; height: 13mm; color: #000; }
    .invoice-download .invoice-brand-name { font-family: Georgia, "Times New Roman", serif; font-size: 18px; line-height: 1; font-weight: 700; text-align: center; }
    .invoice-download .invoice-brand-tagline { font-family: Arial, Helvetica, sans-serif; font-size: 7.5px; letter-spacing: .18em; text-transform: uppercase; text-align: center; }
    .invoice-download table { width: 100%; height: calc(100% - 13mm); border-collapse: collapse; table-layout: fixed; border: 2px solid #000; font-size: 11.5px; line-height: 1.22; }
    .invoice-download th, .invoice-download td { border: 1px solid #000; padding: 3.5px 5px; vertical-align: top; overflow-wrap: anywhere; }
    .invoice-download .title { text-align: center; font-size: 16.8px; font-weight: 800; letter-spacing: .06em; }
    .invoice-download .label, .invoice-download .company, .invoice-download .account-title { font-weight: 800; }
    .invoice-download .center { text-align: center; }
    .invoice-download .amount, .invoice-download .number { text-align: right; }
    .invoice-download .signature { text-align: center; vertical-align: bottom; font-weight: 700; }
    @media print { .invoice-download { padding: 0; } }
  </style>
</head>
<body>
  <main class="invoice-download">${surface.outerHTML}</main>
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
  const displayLines =
    allDisplayLines.length > 6
      ? [
          ...allDisplayLines.slice(0, 5),
          {
            materialCode: "ADDITIONAL",
            materialName: `${allDisplayLines.length - 5} additional material/charge lines`,
            hsnCode: "995419",
            lineType: "charge",
            quantity: 1,
            unit: "job",
            unitPrice: allDisplayLines
              .slice(5)
              .reduce((sum, line) => sum + line.taxableAmount, 0),
            taxableAmount: allDisplayLines
              .slice(5)
              .reduce((sum, line) => sum + line.taxableAmount, 0),
          },
        ]
      : allDisplayLines;
  return (
    <InvoicePaper className="billing-print-surface">
      <BrandHeader className="invoice-brand-header">
        <BrandName className="invoice-brand-name">Sita Shelters Pvt. Ltd.</BrandName>
        <BrandTagline className="invoice-brand-tagline">
          Creating Timeless Dreams
        </BrandTagline>
      </BrandHeader>
      <ProformaTable>
        <colgroup>
          <col style={{ width: "8%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "12%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="title" colSpan={7}>
              PROFORMA INVOICE
            </td>
          </tr>
          <tr>
            <td className="label" colSpan={2}>From:</td>
            <td colSpan={2}></td>
            <td className="label">GSTIN:</td>
            <td colSpan={2}>36AAKCS2926A1ZK</td>
          </tr>
          <tr>
            <td className="company" colSpan={4}>Sita Shelters Pvt Ltd</td>
            <td className="label">INVOICE NO:</td>
            <td colSpan={2}>{invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td colSpan={4}>H.No.7-1-21/B, FLAT NO.107, SITA SAROVAR</td>
            <td className="label">INVOICE DATE:</td>
            <td colSpan={2}>{formatDate(invoice.invoiceDate)}</td>
          </tr>
          <tr>
            <td colSpan={4}>BEGUMPET, HYDERABAD - 500016</td>
            <td className="label">PAN NO:</td>
            <td colSpan={2}>AAKCS2926A</td>
          </tr>
          <tr>
            <td className="spacer" colSpan={7}></td>
          </tr>
          <tr>
            <td className="label" colSpan={3}>Bill To:</td>
            <td className="label" colSpan={4}>Location of premises:</td>
          </tr>
          <tr>
            <td className="address-cell" colSpan={3}>
              <strong>{invoice.vendorName}</strong>
              <br />
              {invoice.vendorAddress}
              {invoice.vendorGstNumber ? (
                <>
                  <br />
                  GST: {invoice.vendorGstNumber}
                </>
              ) : null}
            </td>
            <td className="address-cell" colSpan={4}>
              <strong>{invoice.projectName}</strong>
              <br />
              {invoice.projectAddress}
              <br />
              Purchase Order: {invoice.purchaseOrderNumber}
              <br />
              Delivery Challan: {invoice.deliveryChallanNumber}
              <br />
              Vehicle: {invoice.vehicleNumber} | Transporter: {invoice.transporterName}
            </td>
          </tr>
          <tr>
            <td className="spacer" colSpan={7}></td>
          </tr>
          <tr>
            <th>SL.No</th>
            <th>HS Code</th>
            <th>Description of Services</th>
            <th>Period of Service</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
          {displayLines.map((line, index) => (
            <tr className="item-row" key={`${line.materialCode}-${index}`}>
              <td>{index + 1}</td>
              <td>{line.hsnCode}</td>
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
              <td className="amount">{formatInvoiceAmount(line.unitPrice)}</td>
              <td className="amount">{formatInvoiceAmount(line.taxableAmount)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={5}></td>
            <td className="label">Taxable Value</td>
            <td className="amount">{formatInvoiceAmount(invoice.taxableAmount)}</td>
          </tr>
          <tr>
            <td colSpan={5}></td>
            <td className="label">SGST : {splitTaxPercent.toFixed(2).replace(/\.00$/, "")}%</td>
            <td className="amount">{formatInvoiceAmount(sgst)}</td>
          </tr>
          <tr>
            <td colSpan={5}></td>
            <td className="label">CGST : {splitTaxPercent.toFixed(2).replace(/\.00$/, "")}%</td>
            <td className="amount">{formatInvoiceAmount(cgst)}</td>
          </tr>
          <tr>
            <td colSpan={5}></td>
            <td className="label">Total Tax : {totalTaxPercent.toFixed(2).replace(/\.00$/, "")}%</td>
            <td className="amount">{formatInvoiceAmount(invoice.taxAmount)}</td>
          </tr>
          <tr>
            <td colSpan={5}></td>
            <td className="label">Total</td>
            <td className="amount label">{formatInvoiceAmount(invoice.totalAmount)}</td>
          </tr>
          <tr>
            <td className="label" colSpan={2}>Invoice Value<br />in words</td>
            <td className="words" colSpan={3}>
              <strong>{amountToWords(invoice.totalAmount)}</strong>
            </td>
            <td className="label">Total Invoice Amount (INR)</td>
            <td className="amount label">{formatInvoiceAmount(invoice.totalAmount)}</td>
          </tr>
          <tr>
            <td className="account-title" colSpan={7}>ACCOUNT DETAILS</td>
          </tr>
          <tr>
            <td className="label" colSpan={2}>Account Name</td>
            <td colSpan={5}>Sita Shelters Private Limited</td>
          </tr>
          <tr>
            <td className="label" colSpan={2}>A/c No</td>
            <td colSpan={5}>1410010000000478</td>
          </tr>
          <tr>
            <td className="label" colSpan={2}>IFSC</td>
            <td colSpan={2}>KVBL0001410, Secunderabad Branch.</td>
            <td className="signature" colSpan={3} rowSpan={2}>Authorized Signatory</td>
          </tr>
          <tr>
            <td colSpan={4}>H. No. 7-1-21/B, Flat No. 107, Sita Sarovar, Begumpet, Hyderabad - 500016.</td>
          </tr>
        </tbody>
      </ProformaTable>
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
        <KpiCard icon={ReceiptText} label="Invoices" value={formatCompactNumber(kpis.count)} />
        <KpiCard icon={IndianRupee} label="Taxable value" value={formatCurrency(kpis.taxable, { maximumFractionDigits: 0 })} />
        <KpiCard icon={FileText} label="GST amount" value={formatCurrency(kpis.tax, { maximumFractionDigits: 0 })} />
        <KpiCard icon={IndianRupee} label="Invoice total" value={formatCurrency(kpis.total, { maximumFractionDigits: 0 })} />
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
