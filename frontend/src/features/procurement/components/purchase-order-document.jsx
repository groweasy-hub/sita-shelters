"use client";

import styled, { createGlobalStyle } from "styled-components";

const COMPANY = {
  name: "Sita Shelters Pvt. Ltd.",
  gstin: "36AAKCS2926A1ZK",
  phone: "99632 96848",
  email: "abhilash@sitashelters.com",
  address: [
    "H. No. 7-1-21/B, Flat No. 107,",
    "Sita Sarovar, Begumpet,",
    "Hyderabad - 500016.",
  ],
  footer: "H. No. 7-1-21/B, Flat No. 107, Sita Sarovar, Begumpet, Hyderabad - 500016.",
};

export const PurchaseOrderPrintStyles = createGlobalStyle`
  @media print {
    @page {
      size: A4 portrait;
      margin: 5mm;
    }
    body * {
      visibility: hidden !important;
    }
    .po-print-surface,
    .po-print-surface * {
      visibility: visible !important;
    }
    .po-print-surface {
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

const Paper = styled.article`
  box-sizing: border-box;
  width: min(100%, 200mm);
  min-height: 287mm;
  max-height: 287mm;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #d9e1ea;
  background: #ffffff;
  box-shadow: 0 1rem 3rem rgb(15 23 42 / 0.08);
  color: #071f4f;
  font-family: "Times New Roman", Times, serif;

  @media print {
    width: 200mm;
    height: 287mm;
    min-height: 287mm;
    max-height: 287mm;
    border: 0;
    box-shadow: none;
  }
`;
const Inner = styled.div`
  display: grid;
  gap: 2.2mm;
  padding: 4.5mm 5.5mm 3.5mm;
  transform: scale(0.985);
  transform-origin: top left;
  width: calc(100% / 0.985);
`;
const Header = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 75mm;
  gap: 8mm;
  align-items: start;
`;
const Logo = styled.img`
  width: 102mm;
  max-width: 100%;
  height: auto;
  object-fit: contain;
`;
const TitleBlock = styled.div`
  min-height: 23mm;
  padding-left: 7mm;
  border-left: 1.5px solid #071f4f;
`;
const Title = styled.h2`
  margin: 1mm 0 2mm;
  font-size: 8.2mm;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;
const HeaderMeta = styled.table`
  border-collapse: collapse;
  font-size: 4mm;
  td {
    padding: 0.6mm 1.2mm;
    font-weight: 900;
  }
  td:nth-child(2) {
    width: 5mm;
    text-align: center;
  }
  td:last-child {
    font-weight: 500;
  }
`;
const AddressGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5mm;
`;
const Box = styled.div`
  min-height: 45mm;
  border: 1px solid #9eacbc;
`;
const BoxTitle = styled.h3`
  margin: 0;
  padding: 1.65mm 2.8mm;
  border-bottom: 1px solid #9eacbc;
  background: #eaf2fa;
  font-size: 3.85mm;
  line-height: 1;
  font-weight: 900;
`;
const BoxBody = styled.div`
  padding: 2mm 3mm;
  font-size: 3.7mm;
  line-height: 1.12;
  strong {
    font-weight: 900;
  }
`;
const Subject = styled.div`
  border: 1px solid #9eacbc;
  background: #eaf2fa;
  padding: 1.7mm 3mm;
  font-size: 4mm;
  font-weight: 900;
`;
const Intro = styled.div`
  display: grid;
  gap: 1.4mm;
  padding-inline: 3mm;
  font-size: 3.9mm;
  line-height: 1.18;
  p {
    margin: 0;
  }
`;
const ProductGroup = styled.div`
  padding: 1.8mm 3mm;
  background: #eaf2fa;
  font-size: 3.55mm;
  line-height: 1.08;
  strong {
    font-weight: 900;
  }
`;
const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 3.45mm;
  line-height: 1.05;
  th,
  td {
    border: 1px solid #9eacbc;
    padding: 1.6mm 2mm;
    vertical-align: top;
  }
  th {
    background: #eaf2fa;
    text-align: center;
    font-weight: 900;
  }
  .center {
    text-align: center;
  }
  .number {
    text-align: right;
  }
  .item-row {
    height: 7.5mm;
  }
  .blank-row {
    height: 7mm;
    color: #8d96a3;
  }
  .empty-left {
    border-right: 0;
    border-bottom: 0;
  }
  .total-label {
    background: #eaf2fa;
    font-weight: 900;
  }
  .grand-label,
  .grand-value {
    background: #071f4f;
    color: #ffffff;
    font-size: 4mm;
    font-weight: 900;
  }
`;
const TermsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 3.35mm;
  line-height: 1.08;
  th,
  td {
    border: 1px solid #9eacbc;
    padding: 1.55mm 2.5mm;
    vertical-align: top;
  }
  th {
    background: #eaf2fa;
    text-align: left;
    font-size: 3.8mm;
  }
  td:first-child {
    width: 43mm;
    font-weight: 900;
  }
`;
const AdditionalTerms = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 3.4mm;
  th,
  td {
    border: 1px solid #9eacbc;
    padding: 1.45mm 2.5mm;
  }
  th {
    background: #eaf2fa;
    text-align: left;
    font-size: 3.8mm;
  }
  td:first-child {
    width: 8mm;
  }
  .line {
    display: block;
    min-height: 3.2mm;
    border-bottom: 1px solid #7889a0;
  }
`;
const Signoff = styled.div`
  display: grid;
  justify-content: end;
  gap: 1.6mm;
  padding-right: 38mm;
  font-size: 3.7mm;
  line-height: 1.08;
  strong {
    font-weight: 900;
  }
`;
const Footer = styled.footer`
  display: grid;
  gap: 2mm;
  margin-top: 1mm;
  font-size: 3.05mm;
  text-align: center;
`;
const Rule = styled.div`
  height: 0.8mm;
  background: #071f4f;
`;

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numberValue(value));
}

function formatDateDots(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replaceAll("/", ".");
}

function itemAmount(item) {
  return numberValue(item.quantity) * numberValue(item.unitRate);
}

export function createPurchaseOrderDocumentDraft(order, vendor) {
  const firstItem = order.items[0];
  const terms = [
    ["Installation Works:", "Not included."],
    ["Delivery Period:", "Material will be delivered within 3 to 4 weeks from the date of commercially clear order."],
    ["Freight:", "Inclusive up to site."],
    ["Terms of Payment:", order.termsNote || "50% advance along with order. Balance against proforma invoice (PI), before dispatch."],
    ["Warranty:", "As per supplier warranty terms, if applicable."],
  ];
  return {
    poNumber: order.id,
    poDate: formatDateDots(order.createdAt),
    subject: `Supply of ${firstItem?.materialName ?? "materials"}.`,
    productGroupDescription: `${vendor?.name ?? "Supplier"} materials as detailed below.`,
    supplierName: vendor?.name ?? order.vendorId,
    supplierAddress: vendor?.address ?? "",
    deliveryProject: order.projectName,
    deliveryAddress: `${order.projectName}\nSita Shelters Pvt. Ltd.\nHyderabad, Telangana - 500016.`,
    items: order.items.map((item) => ({
      product: item.materialName,
      quantity: String(item.orderedQuantity),
      unit: item.unit,
      unitRate: String(item.unitPrice),
      taxPercent: String(item.taxPercent),
    })),
    terms: terms.map(([label, value]) => ({ label, value })),
    additionalTerms: ["", "", ""],
  };
}

export function calculatePoDocumentTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + itemAmount(item), 0);
  const tax = items.reduce(
    (sum, item) => sum + itemAmount(item) * (numberValue(item.taxPercent) / 100),
    0,
  );
  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

export function PurchaseOrderDocument({ draft }) {
  const displayItems = draft.items.slice(0, 6);
  const blankRows = Math.max(0, 6 - displayItems.length);
  const totals = calculatePoDocumentTotals(displayItems);
  const taxPercents = [
    ...new Set(displayItems.map((item) => numberValue(item.taxPercent)).filter(Boolean)),
  ];
  const taxLabel = taxPercents.length === 1 ? `GST @ ${taxPercents[0]}% (INR)` : "GST (INR)";

  return (
    <Paper className="po-print-surface sita-po">
      <Inner className="po-inner">
        <Header className="po-header">
          <Logo
            alt="Sita Shelters - Creating Timeless Dreams"
            className="po-logo"
            src="/images/image.png"
          />
          <TitleBlock className="po-title-block">
            <Title>PURCHASE ORDER</Title>
            <HeaderMeta>
              <tbody>
                <tr>
                  <td>P.O. No.</td>
                  <td>:</td>
                  <td>{draft.poNumber}</td>
                </tr>
                <tr>
                  <td>P.O. Date</td>
                  <td>:</td>
                  <td>{draft.poDate}</td>
                </tr>
              </tbody>
            </HeaderMeta>
          </TitleBlock>
        </Header>
        <AddressGrid className="po-address-grid">
          <Box>
            <BoxTitle>FROM / BILLING ADDRESS:</BoxTitle>
            <BoxBody>
              <strong>{COMPANY.name}</strong>
              <br />
              {COMPANY.address.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
              <strong>Mob:</strong> {COMPANY.phone}
              <br />
              <strong>Email:</strong> {COMPANY.email}
            </BoxBody>
          </Box>
          <Box>
            <BoxTitle>TO / SUPPLIER:</BoxTitle>
            <BoxBody>
              <strong>{draft.supplierName}</strong>
              <br />
              {draft.supplierAddress.split("\n").map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </BoxBody>
          </Box>
          <Box>
            <BoxTitle>DELIVERY ADDRESS:</BoxTitle>
            <BoxBody>
              {draft.deliveryAddress.split("\n").map((line, index) => (
                <span key={`${line}-${index}`}>
                  {index < 2 ? <strong>{line}</strong> : line}
                  <br />
                </span>
              ))}
              <strong>GSTIN:</strong> {COMPANY.gstin}
              <br />
              <strong>Tel:</strong> {COMPANY.phone}
              <br />
              <strong>Email:</strong> {COMPANY.email}
            </BoxBody>
          </Box>
        </AddressGrid>
        <Subject>SUBJECT: {draft.subject}</Subject>
        <Intro>
          <p>Dear Sir,</p>
          <p>We hereby place our order for supply of materials as detailed below.</p>
        </Intro>
        <ProductGroup>
          <strong>Product group description:</strong> {draft.productGroupDescription}
        </ProductGroup>
        <ItemsTable className="po-items-table">
          <colgroup>
            <col style={{ width: "9.5%" }} />
            <col style={{ width: "38%" }} />
            <col style={{ width: "11.5%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "21%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Product / Model / Description</th>
              <th>Qty</th>
              <th>Unit Rate (INR)</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, index) => (
              <tr className="item-row" key={`${item.product}-${index}`}>
                <td className="center">{String.fromCharCode(97 + index)}</td>
                <td>{item.product || "Enter product / model"}</td>
                <td className="center">{money(item.quantity).replace(".00", "")}</td>
                <td className="number">{money(item.unitRate)}</td>
                <td className="number">{money(itemAmount(item))}</td>
              </tr>
            ))}
            {Array.from({ length: blankRows }).map((_, index) => (
              <tr className="blank-row" key={`po-blank-${index}`}>
                <td className="center">{String.fromCharCode(97 + displayItems.length + index)}</td>
                <td>Enter product / model</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
            <tr>
              <td className="empty-left" colSpan={2} rowSpan={3}></td>
              <td className="total-label number" colSpan={2}>Subtotal (INR)</td>
              <td className="number total-label">{money(totals.subtotal)}</td>
            </tr>
            <tr>
              <td className="total-label number" colSpan={2}>{taxLabel}</td>
              <td className="number total-label">{money(totals.tax)}</td>
            </tr>
            <tr>
              <td className="grand-label number" colSpan={2}>Total Value With GST (INR)</td>
              <td className="grand-value number">{money(totals.total)}</td>
            </tr>
          </tbody>
        </ItemsTable>
        <TermsTable className="po-terms-table">
          <thead>
            <tr>
              <th colSpan={2}>TERMS &amp; CONDITIONS</th>
            </tr>
          </thead>
          <tbody>
            {draft.terms.map((term, index) => (
              <tr key={`${term.label}-${index}`}>
                <td>{term.label}</td>
                <td>{term.value}</td>
              </tr>
            ))}
          </tbody>
        </TermsTable>
        <AdditionalTerms className="po-additional-terms">
          <thead>
            <tr>
              <th colSpan={2}>ADDITIONAL TERMS &amp; CONDITIONS</th>
            </tr>
          </thead>
          <tbody>
            {draft.additionalTerms.map((term, index) => (
              <tr key={`additional-${index}`}>
                <td>{index + 1}.</td>
                <td>{term ? term : <span className="line" />}</td>
              </tr>
            ))}
          </tbody>
        </AdditionalTerms>
        <Signoff>
          <span>Yours truly,</span>
          <span>For <strong>Sita Shelters Pvt. Ltd.,</strong></span>
          <br />
          <strong>AUTHORISED SIGNATORY</strong>
        </Signoff>
        <Footer>
          <Rule />
          <div>{COMPANY.footer}</div>
        </Footer>
      </Inner>
    </Paper>
  );
}
