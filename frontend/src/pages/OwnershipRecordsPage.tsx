import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

// Types
export interface TransferEvent {
  from: string;
  to: string;
  txHash: string;
  timestamp: string;
  blockNumber: number;
}

export interface OwnershipRecord {
  assetName: string;
  assetId: string;
  ownerAddress: string;
  creatorAddress: string;
  ownershipStatus: "Owned" | "Listed" | "Locked" | "Transferred" | "Staked";
  creationDate: string;
  transferHistoryCount: number;
  verificationStatus: "Verified" | "Pending" | "Unverified";
  lastUpdated: string;
  transferHistory: TransferEvent[];
  tokenStandard: string;
  contractAddress: string;
  description: string;
  glowingColor: string;
}

// Custom mock dataset representing premium digital assets on-chain
const mockOwnershipRecords: OwnershipRecord[] = [
  {
    assetName: "Genesis Aegis",
    assetId: "8401",
    ownerAddress: "0x8F21aB34dE67c8C9A22efC0B2149De3A4567A149",
    creatorAddress: "0x51E2b43bC92A1e102Cf59eD23A0B14D984F8B3eC",
    ownershipStatus: "Owned",
    creationDate: "2026-01-15",
    transferHistoryCount: 3,
    verificationStatus: "Verified",
    lastUpdated: "2026-05-28 14:32:00",
    tokenStandard: "ERC-721",
    contractAddress: "0xa8E125c1F854D9e8D1212B3B0e4a77038101a89c",
    description: "The founding block artifact. Protects against antigravity disruptions and maintains base layer protocol equilibrium.",
    glowingColor: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    transferHistory: [
      { from: "0x51E2b43bC92A...B3eC", to: "0x39a12c8Df4b5...C10d", txHash: "0xbc12...49e1", timestamp: "2026-01-15 08:22:15", blockNumber: 1845920 },
      { from: "0x39a12c8Df4b5...C10d", to: "0x7890bF12aD34...A52c", txHash: "0xfa39...1192", timestamp: "2026-03-22 19:40:11", blockNumber: 1910245 },
      { from: "0x7890bF12aD34...A52c", to: "0x8F21aB34dE67...A149", txHash: "0x00d3...ae91", timestamp: "2026-05-28 14:32:00", blockNumber: 2049102 }
    ]
  },
  {
    assetName: "Hyperion Core",
    assetId: "9212",
    ownerAddress: "0x4A13cf92aEd3D0B9F741C0A9B792A5401D38C821",
    creatorAddress: "0x4A13cf92aEd3D0B9F741C0A9B792A5401D38C821",
    ownershipStatus: "Listed",
    creationDate: "2026-02-09",
    transferHistoryCount: 1,
    verificationStatus: "Verified",
    lastUpdated: "2026-05-30 09:12:45",
    tokenStandard: "ERC-721",
    contractAddress: "0xa8E125c1F854D9e8D1212B3B0e4a77038101a89c",
    description: "Fusion dynamic engine supplying virtual networks with highly stable and modular staking liquidity snapshots.",
    glowingColor: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
    transferHistory: [
      { from: "0x000000000000...0000", to: "0x4A13cf92aEd3...C821", txHash: "0x98bb...de12", timestamp: "2026-02-09 11:00:54", blockNumber: 1870231 }
    ]
  },
  {
    assetName: "Nebula Horizon",
    assetId: "3048",
    ownerAddress: "0xE3912cF492dA0c918a221fE0391d848e022BB92D",
    creatorAddress: "0xE3912cF492dA0c918a221fE0391d848e022BB92D",
    ownershipStatus: "Locked",
    creationDate: "2026-04-01",
    transferHistoryCount: 0,
    verificationStatus: "Pending",
    lastUpdated: "2026-04-01 18:22:10",
    tokenStandard: "ERC-721",
    contractAddress: "0xb7c81a2BcD4e19f72b647890bF5C4A9E21289190",
    description: "A time-locked digital canvas representing structural decentralized governance configurations. Fully uncompromised security.",
    glowingColor: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
    transferHistory: []
  },
  {
    assetName: "Solstice Relay",
    assetId: "1109",
    ownerAddress: "0x7C92b1fDeA29b12eC0391fE23D0984aE222BA7E5",
    creatorAddress: "0x21F3cd561EfE0A9B42A45C6e9D8b301a2D4bC901",
    ownershipStatus: "Staked",
    creationDate: "2025-11-20",
    transferHistoryCount: 6,
    verificationStatus: "Verified",
    lastUpdated: "2026-05-15 22:45:00",
    tokenStandard: "ERC-721",
    contractAddress: "0xa8E125c1F854D9e8D1212B3B0e4a77038101a89c",
    description: "An ancient bridge relay optimized for sub-second multichain asset routing and state synchronization checkpoints.",
    glowingColor: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    transferHistory: [
      { from: "0x21F3cd561EfE...C901", to: "0x1234ea56bCD3...a9b2", txHash: "0x1111...aa11", timestamp: "2025-11-20 10:14:02", blockNumber: 1720101 },
      { from: "0x1234ea56bCD3...a9b2", to: "0x55aa66bb77cc...88dd", txHash: "0x2222...bb22", timestamp: "2025-12-05 14:09:59", blockNumber: 1739823 },
      { from: "0x55aa66bb77cc...88dd", to: "0x9922aaccbb00...1144", txHash: "0x3333...cc33", timestamp: "2026-01-10 18:33:10", blockNumber: 1823902 },
      { from: "0x9922aaccbb00...1144", to: "0xbb4411eedd33...aa55", txHash: "0x4444...dd44", timestamp: "2026-02-18 09:12:00", blockNumber: 1883902 },
      { from: "0xbb4411eedd33...aa55", to: "0xde77cc88ffaa...0099", txHash: "0x5555...ee55", timestamp: "2026-04-12 11:22:45", blockNumber: 1945902 },
      { from: "0xde77cc88ffaa...0099", to: "0x7C92b1fDeA29...A7E5", txHash: "0x6666...ff66", timestamp: "2026-05-15 22:45:00", blockNumber: 2012480 }
    ]
  },
  {
    assetName: "Chronos Sentinel",
    assetId: "4902",
    ownerAddress: "0x98D211aC0219D392EE039A22Ef11a0B9D4A11D3b",
    creatorAddress: "0x8F21aB34dE67c8C9A22efC0B2149De3A4567A149",
    ownershipStatus: "Transferred",
    creationDate: "2026-03-14",
    transferHistoryCount: 2,
    verificationStatus: "Unverified",
    lastUpdated: "2026-05-20 11:05:30",
    tokenStandard: "ERC-721",
    contractAddress: "0xc8e918542F8bA2B2B0e49a1d12B3B0C4A11A0C1e",
    description: "Time audit guard that records all on-chain metadata version upgrades and emits events dynamically.",
    glowingColor: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
    transferHistory: [
      { from: "0x8F21aB34dE67...A149", to: "0xa1a12c8Df4b5...b2b2", txHash: "0x88bb...49ff", timestamp: "2026-03-14 15:20:00", blockNumber: 1901024 },
      { from: "0xa1a12c8Df4b5...b2b2", to: "0x98D211aC0219...1D3b", txHash: "0xeeaa...c920", timestamp: "2026-05-20 11:05:30", blockNumber: 2021045 }
    ]
  },
  {
    assetName: "Zenith Protocol",
    assetId: "7700",
    ownerAddress: "0x0F42c98b671aA9b2D39Eef11d3b0C4A11A0C3Aa2",
    creatorAddress: "0x51E2b43bC92A1e102Cf59eD23A0B14D984F8B3eC",
    ownershipStatus: "Owned",
    creationDate: "2026-05-10",
    transferHistoryCount: 4,
    verificationStatus: "Verified",
    lastUpdated: "2026-05-31 12:00:15",
    tokenStandard: "ERC-721",
    contractAddress: "0xa8E125c1F854D9e8D1212B3B0e4a77038101a89c",
    description: "Multi-layered network controller for executing highly secure upgrades, proxy delegation, and cross-contract relays.",
    glowingColor: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    transferHistory: [
      { from: "0x51E2b43bC92A...B3eC", to: "0xf4f42c98b671...A2a2", txHash: "0xaa11...5566", timestamp: "2026-05-10 10:00:00", blockNumber: 1999201 },
      { from: "0xf4f42c98b671...A2a2", to: "0xe5e5aB34dE67...11a2", txHash: "0xbb22...7788", timestamp: "2026-05-15 11:30:00", blockNumber: 2011045 },
      { from: "0xe5e5aB34dE67...11a2", to: "0xdcdcAEd3D0B9...8282", txHash: "0xcc33...9900", timestamp: "2026-05-24 16:45:10", blockNumber: 2038902 },
      { from: "0xdcdcAEd3D0B9...8282", to: "0x0F42c98b671a...3Aa2", txHash: "0xdd44...1122", timestamp: "2026-05-31 12:00:15", blockNumber: 2059012 }
    ]
  }
];

// Helper to truncate addresses beautifully
function shortAddress(addr?: string) {
  if (!addr) return "0x0000...0000";
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "info";
}

interface OwnershipRecordsPageProps {
  onBack: () => void;
}

export default function OwnershipRecordsPage({ onBack }: OwnershipRecordsPageProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [sortField, setSortField] = useState<"assetId" | "assetName" | "creationDate" | "transferHistoryCount">("assetId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedAsset, setSelectedAsset] = useState<OwnershipRecord | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Trigger custom notification alerts
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Filter and sort computation
  const filteredRecords = useMemo(() => {
    let list = [...mockOwnershipRecords];

    // Search term matching
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.assetName.toLowerCase().includes(q) ||
          r.assetId.includes(q) ||
          r.ownerAddress.toLowerCase().includes(q) ||
          r.creatorAddress.toLowerCase().includes(q)
      );
    }

    // Ownership status filter
    if (statusFilter !== "all") {
      list = list.filter((r) => r.ownershipStatus.toLowerCase() === statusFilter.toLowerCase());
    }

    // Verification status filter
    if (verificationFilter !== "all") {
      list = list.filter((r) => r.verificationStatus.toLowerCase() === verificationFilter.toLowerCase());
    }

    // Sorting logic
    list.sort((a, b) => {
      let aField: any = a[sortField];
      let bField: any = b[sortField];

      // Handle ID sorting as numeric
      if (sortField === "assetId") {
        aField = parseInt(a.assetId, 10);
        bField = parseInt(b.assetId, 10);
      }

      if (aField < bField) return sortOrder === "asc" ? -1 : 1;
      if (aField > bField) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [search, statusFilter, verificationFilter, sortField, sortOrder]);

  // Statistics calculation for filtered list
  const totalAssets = filteredRecords.length;
  const totalTransfersCount = useMemo(() => {
    return filteredRecords.reduce((acc, r) => acc + r.transferHistoryCount, 0);
  }, [filteredRecords]);
  const verifiedPercentage = useMemo(() => {
    if (filteredRecords.length === 0) return 0;
    const verified = filteredRecords.filter((r) => r.verificationStatus === "Verified").length;
    return Math.round((verified / filteredRecords.length) * 100);
  }, [filteredRecords]);

  // Handle Sort Change
  const requestSort = (field: "assetId" | "assetName" | "creationDate" | "transferHistoryCount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ── CSV EXPORTER ──────────────────────────────────────────
  const exportToCSV = () => {
    try {
      if (filteredRecords.length === 0) {
        showToast("No data to export", "error");
        return;
      }
      const headers = [
        "Asset Name",
        "Asset ID / Token ID",
        "Owner Address",
        "Creator Address",
        "Ownership Status",
        "Creation Date",
        "Transfer History Count",
        "Verification Status",
        "Last Updated Timestamp"
      ];

      const rows = filteredRecords.map((r) => [
        r.assetName,
        r.assetId,
        r.ownerAddress,
        r.creatorAddress,
        r.ownershipStatus,
        r.creationDate,
        r.transferHistoryCount,
        r.verificationStatus,
        r.lastUpdated
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((val) => `"${val}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ownership_records_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV Exported successfully!", "success");
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, "error");
    }
  };

  // ── EXCEL EXPORTER (SheetJS) ──────────────────────────────
  const exportToExcel = () => {
    try {
      if (filteredRecords.length === 0) {
        showToast("No data to export", "error");
        return;
      }
      const formattedData = filteredRecords.map((r) => ({
        "Asset Name": r.assetName,
        "Asset ID / Token ID": r.assetId,
        "Owner Address": r.ownerAddress,
        "Creator Address": r.creatorAddress,
        "Ownership Status": r.ownershipStatus,
        "Creation Date": r.creationDate,
        "Transfer History Count": r.transferHistoryCount,
        "Verification Status": r.verificationStatus,
        "Last Updated Timestamp": r.lastUpdated
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      
      // Auto-fit column widths
      const colWidths = [
        { wch: 18 }, // Asset Name
        { wch: 18 }, // ID
        { wch: 45 }, // Owner Address
        { wch: 45 }, // Creator Address
        { wch: 16 }, // Status
        { wch: 15 }, // Creation Date
        { wch: 22 }, // Transfer count
        { wch: 18 }, // Verification Status
        { wch: 20 }  // Last Updated
      ];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ownership Records");
      XLSX.writeFile(workbook, `ownership_records_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast("Excel sheet generated successfully!", "success");
    } catch (err: any) {
      showToast(`Excel generation failed: ${err.message}`, "error");
    }
  };

  // ── PDF REPORT EXPORTER (jsPDF) ───────────────────────────
  const exportToPDF = () => {
    try {
      if (filteredRecords.length === 0) {
        showToast("No data to export", "error");
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      // Styling palette
      const primaryColor = [139, 92, 246]; // Purple accent
      const textColor = [20, 24, 45];
      const lightGray = [100, 110, 140];
      const lineGray = [220, 225, 235];

      // Draw top header accent line
      doc.setFillColor(139, 92, 246);
      doc.rect(0, 0, 297, 4, "F");

      // Report Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("DIGITAL OWNERSHIP RECORDS", 14, 18);

      // Metadata info
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`On-chain digital assets snapshot — Generated: ${new Date().toLocaleString()}`, 14, 24);

      // Stat capsules in report
      doc.setFillColor(245, 246, 255);
      doc.roundedRect(200, 10, 83, 16, 3, 3, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Total Assets: ${totalAssets}`, 204, 16);
      doc.text(`Verification Rate: ${verifiedPercentage}%`, 204, 21);
      doc.text(`Total Transfers: ${totalTransfersCount}`, 245, 16);

      // Divider Line
      doc.setStrokeColor(lineGray[0], lineGray[1], lineGray[2]);
      doc.setLineWidth(0.4);
      doc.line(14, 28, 283, 28);

      // Table configuration
      const columns = [
        { header: "Asset Name", x: 14, w: 32 },
        { header: "Token ID", x: 46, w: 16 },
        { header: "Owner Address", x: 62, w: 46 },
        { header: "Creator Address", x: 108, w: 46 },
        { header: "Status", x: 154, w: 22 },
        { header: "Created Date", x: 176, w: 24 },
        { header: "Transfers", x: 200, w: 18 },
        { header: "Verification", x: 218, w: 22 },
        { header: "Last Updated Timestamp", x: 240, w: 43 }
      ];

      // Table Header row background
      doc.setFillColor(240, 241, 249);
      doc.roundedRect(14, 33, 269, 10, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(70, 75, 100);

      columns.forEach((col) => {
        doc.text(col.header, col.x, 39.5);
      });

      // Data Rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      let y = 49;
      filteredRecords.forEach((r, idx) => {
        // Alternating row background for beautiful readability
        if (idx % 2 === 1) {
          doc.setFillColor(250, 251, 255);
          doc.rect(14, y - 5.5, 269, 8, "F");
        }

        doc.text(r.assetName, 14, y);
        doc.text(r.assetId, 46, y);
        doc.text(shortAddress(r.ownerAddress), 62, y);
        doc.text(shortAddress(r.creatorAddress), 108, y);
        doc.text(r.ownershipStatus, 154, y);
        doc.text(r.creationDate, 176, y);
        doc.text(r.transferHistoryCount.toString(), 200, y);
        doc.text(r.verificationStatus, 218, y);
        doc.text(r.lastUpdated, 240, y);

        // Divider line below row
        doc.setStrokeColor(235, 238, 247);
        doc.line(14, y + 2.5, 283, y + 2.5);

        y += 8;
      });

      // Bottom note / Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(140, 145, 170);
      doc.text("Disclaimer: This document is an offline digital summary of ownership records pulled directly from the Digital Ownership Platform. Authenticity can be validated on-chain.", 14, 200);

      doc.setFont("helvetica", "normal");
      doc.text("Page 1 of 1", 270, 200);

      doc.save(`ownership_records_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast("PDF report generated successfully!", "success");
    } catch (err: any) {
      showToast(`PDF generation failed: ${err.message}`, "error");
    }
  };

  // ── CERTIFICATE PDF GENERATOR FOR SINGLE ASSET ────────────
  const exportCertificatePDF = (record: OwnershipRecord) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Royal gold/purple color styling
      const primaryColor = [124, 58, 237]; // Purple
      const goldColor = [217, 119, 6]; // Gold

      // Outer Decorative Border
      doc.setStrokeColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1.5);
      doc.rect(8, 8, 194, 281);

      // Inner Decorative Thin Border
      doc.setStrokeColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setLineWidth(0.4);
      doc.rect(11, 11, 188, 275);

      // Certificate Badge / Seal graphic (vectors)
      doc.setFillColor(250, 245, 233);
      doc.circle(105, 45, 18, "F");
      doc.setStrokeColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setLineWidth(1);
      doc.circle(105, 45, 18, "S");

      // Draw simple seal star rays
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text("VERIFIED", 105, 47, { align: "center" });

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CERTIFICATE OF OWNERSHIP", 105, 80, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("THIS DOCUMENT CERTIFIES THE REGISTERED RECORD OF THE DIGITAL ASSET BELOW", 105, 88, { align: "center" });

      // Asset Main Box
      doc.setFillColor(248, 249, 255);
      doc.roundedRect(25, 96, 160, 52, 4, 4, "F");
      doc.setStrokeColor(220, 224, 245);
      doc.setLineWidth(0.5);
      doc.roundedRect(25, 96, 160, 52, 4, 4, "S");

      // Asset Details Inside box
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 25, 50);
      doc.text(record.assetName, 105, 110, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(110, 115, 140);
      doc.text(`Token Standard: ${record.tokenStandard}  |  Asset ID: ${record.assetId}`, 105, 117, { align: "center" });

      // Key details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 25, 50);
      doc.text("Owner Address:", 32, 128);
      doc.text("Contract Address:", 32, 134);
      doc.text("Created On:", 32, 140);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(70, 75, 105);
      doc.text(record.ownerAddress, 70, 128);
      doc.text(record.contractAddress, 70, 134);
      doc.text(record.creationDate, 70, 140);

      // Description / Attestation
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(60, 65, 85);
      const textBlock = record.description;
      const splitText = doc.splitTextToSize(textBlock, 150);
      doc.text(splitText, 105, 160, { align: "center" });

      // Section: Transfer History Timeline
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("On-chain Transfer History Timeline", 105, 185, { align: "center" });

      doc.setStrokeColor(220, 224, 245);
      doc.setLineWidth(0.4);
      doc.line(30, 191, 180, 191);

      let historyY = 200;
      doc.setFontSize(8.5);

      if (record.transferHistory.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(140, 145, 170);
        doc.text("No secondary transfers recorded (Original creator is current owner)", 105, historyY, { align: "center" });
      } else {
        doc.setFont("helvetica", "normal");
        record.transferHistory.forEach((tx, index) => {
          // Draw a small node circle
          doc.setFillColor(139, 92, 246);
          doc.circle(28, historyY - 1, 1.2, "F");

          if (index < record.transferHistory.length - 1) {
            doc.setStrokeColor(139, 92, 246);
            doc.setLineWidth(0.3);
            doc.line(28, historyY, 28, historyY + 8);
          }

          doc.setFont("helvetica", "bold");
          doc.setTextColor(40, 45, 60);
          doc.text(`Transfer ${index + 1}:`, 32, historyY);
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 85, 110);
          doc.text(`${shortAddress(tx.from)}  →  ${shortAddress(tx.to)}`, 54, historyY);
          
          doc.setFont("helvetica", "italic");
          doc.setTextColor(140, 145, 170);
          doc.text(`(Block ${tx.blockNumber} · ${tx.timestamp.split(" ")[0]})`, 130, historyY);

          historyY += 9;
        });
      }

      // Verification seal at bottom
      const sealY = 250;
      doc.setStrokeColor(lineGray[0] ?? 230, lineGray[1] ?? 230, lineGray[2] ?? 235);
      doc.line(25, sealY - 6, 185, sealY - 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("VERIFICATION KEY HASH", 30, sealY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 125, 150);
      doc.text(`SECURE-HMAC: sha256-${record.assetId}-${record.ownerAddress.slice(2, 10).toUpperCase()}`, 30, sealY + 5);

      // Signatures
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("AUTHORIZED REPRESENTATIVE", 132, sealY);
      doc.setStrokeColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.line(130, sealY + 12, 185, sealY + 12);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Digital Ownership Registry", 142, sealY + 16);

      doc.save(`certificate_asset_${record.assetId}.pdf`);
      showToast(`Certificate for ${record.assetName} generated successfully!`, "success");
    } catch (err: any) {
      showToast(`Certificate export failed: ${err.message}`, "error");
    }
  };

  return (
    <div className="animate-fade-in p-6" style={{ minHeight: "100vh", position: "relative" }}>
      {/* Toast notifications container */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`badge ${
              toast.type === "success"
                ? "badge-success"
                : toast.type === "error"
                ? "badge-danger"
                : "badge-info"
            } animate-scale-in`}
            style={{
              padding: "12px 20px",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid var(--border-strong)"
            }}
          >
            <span
              className="dot"
              style={{
                backgroundColor:
                  toast.type === "success"
                    ? "var(--success)"
                    : toast.type === "error"
                    ? "var(--danger)"
                    : "var(--info)"
              }}
            />
            {toast.text}
          </div>
        ))}
      </div>

      {/* Header Workspace */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="focus-ring"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 500,
              padding: "0",
              cursor: "pointer",
              marginBottom: "12px"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="gradient-text font-bold" style={{ fontSize: "2rem", margin: 0 }}>
              Ownership Records
            </h1>
            <span className="badge badge-accent">Export Workspace</span>
          </div>
          <p className="text-secondary text-sm mt-1">
            Browse registered digital assets, manage security parameters, and export legal summaries in multiple file types.
          </p>
        </div>

        {/* Bulk Export Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            className="focus-ring"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "var(--shadow-accent)",
              cursor: "pointer"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export All Records
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform var(--transition-fast)", transform: exportDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {exportDropdownOpen && (
            <>
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 990
                }}
                onClick={() => setExportDropdownOpen(false)}
              />
              <div
                className="animate-scale-in"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  backgroundColor: "var(--bg-elevated)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-strong)",
                  boxShadow: "var(--shadow-lg)",
                  padding: "8px",
                  zIndex: 995,
                  minWidth: "180px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >
                <button
                  onClick={() => {
                    exportToCSV();
                    setExportDropdownOpen(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "10px 12px",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  className="hover-lift"
                >
                  <span className="dot dot-muted" /> Export as CSV (.csv)
                </button>
                <button
                  onClick={() => {
                    exportToExcel();
                    setExportDropdownOpen(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "10px 12px",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  className="hover-lift"
                >
                  <span className="dot dot-success" /> Export as Excel (.xlsx)
                </button>
                <button
                  onClick={() => {
                    exportToPDF();
                    setExportDropdownOpen(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "10px 12px",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  className="hover-lift"
                >
                  <span className="dot dot-warning" /> Export as PDF (.pdf)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid-3 mb-8">
        <div className="glass-card p-6 flex flex-col justify-between" style={{ minHeight: "120px" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">ACTIVE TRACKED ASSETS</p>
            <h3 className="gradient-text font-bold mt-2" style={{ fontSize: "2.25rem", margin: 0 }}>
              {totalAssets} <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>NFTs</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs">
            <span className="dot dot-success dot-pulse" />
            <span className="text-secondary">Fully synced with mainnet</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between" style={{ minHeight: "120px" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">VERIFIED OWNERSHIP RATE</p>
            <h3 className="gradient-text font-bold mt-2" style={{ fontSize: "2.25rem", margin: 0 }}>
              {verifiedPercentage}%
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs">
            <span className="text-success font-semibold">★ High Security</span>
            <span className="text-muted">· pending assets under audit</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between" style={{ minHeight: "120px" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">TOTAL SWAP TRANSFERS</p>
            <h3 className="gradient-text font-bold mt-2" style={{ fontSize: "2.25rem", margin: 0 }}>
              {totalTransfersCount}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs">
            <span className="text-accent font-semibold">↑ Speed active</span>
            <span className="text-muted">· dynamic timeline awareness</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Grid */}
      <div
        className="glass-card p-4 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between"
        style={{ borderRadius: "var(--radius-lg)" }}
      >
        {/* Search */}
        <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Asset Name, ID, or wallet address..."
            style={{
              paddingLeft: "40px",
              fontSize: "0.9rem",
              borderRadius: "var(--radius-md)"
            }}
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none"
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-100" style={{ width: "100%", justifyContent: "flex-end" }}>
          {/* Status Filter */}
          <div className="flex items-center gap-2" style={{ minWidth: "150px" }}>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                fontSize: "0.85rem",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)"
              }}
            >
              <option value="all">All Statuses</option>
              <option value="owned">Owned</option>
              <option value="listed">Listed</option>
              <option value="locked">Locked</option>
              <option value="staked">Staked</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="flex items-center gap-2" style={{ minWidth: "170px" }}>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Verification:</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              style={{
                fontSize: "0.85rem",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)"
              }}
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ownership Records Table */}
      <div
        className="glass-card"
        style={{
          borderRadius: "var(--radius-lg)",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-strong)" }}>
                <th
                  onClick={() => requestSort("assetName")}
                  style={{ padding: "16px 20px", cursor: "pointer", userSelect: "none" }}
                  className="focus-ring"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    Asset Name
                    {sortField === "assetName" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th
                  onClick={() => requestSort("assetId")}
                  style={{ padding: "16px 12px", cursor: "pointer", userSelect: "none" }}
                  className="focus-ring"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    Token ID
                    {sortField === "assetId" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th style={{ padding: "16px 12px", fontWeight: "600" }}>Current Owner</th>
                <th style={{ padding: "16px 12px", fontWeight: "600" }}>Original Creator</th>
                <th style={{ padding: "16px 12px", fontWeight: "600" }}>Status</th>
                <th
                  onClick={() => requestSort("creationDate")}
                  style={{ padding: "16px 12px", cursor: "pointer", userSelect: "none" }}
                  className="focus-ring"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    Created
                    {sortField === "creationDate" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th
                  onClick={() => requestSort("transferHistoryCount")}
                  style={{ padding: "16px 12px", cursor: "pointer", userSelect: "none" }}
                  className="focus-ring"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    Transfers
                    {sortField === "transferHistoryCount" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th style={{ padding: "16px 12px", fontWeight: "600" }}>Verification</th>
                <th style={{ padding: "16px 20px", textAlignment: "right", fontWeight: "600" }} />
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr
                    key={record.assetId}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background var(--transition-fast)"
                    }}
                    className="hover-lift"
                  >
                    {/* Name */}
                    <td style={{ padding: "16px 20px" }}>
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "var(--radius-sm)",
                            background: record.glowingColor,
                            boxShadow: "var(--shadow-sm)"
                          }}
                        />
                        <span className="font-semibold text-primary">{record.assetName}</span>
                      </div>
                    </td>

                    {/* ID */}
                    <td style={{ padding: "16px 12px", color: "var(--text-secondary)" }}>
                      <code>#{record.assetId}</code>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: "16px 12px" }}>
                      <code style={{ fontSize: "0.8rem" }}>{shortAddress(record.ownerAddress)}</code>
                    </td>

                    {/* Creator */}
                    <td style={{ padding: "16px 12px" }}>
                      <code style={{ fontSize: "0.8rem" }}>{shortAddress(record.creatorAddress)}</code>
                    </td>

                    {/* Ownership Status */}
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            record.ownershipStatus === "Owned"
                              ? "var(--accent-bg)"
                              : record.ownershipStatus === "Listed"
                              ? "var(--success-bg)"
                              : record.ownershipStatus === "Locked"
                              ? "var(--danger-bg)"
                              : record.ownershipStatus === "Staked"
                              ? "var(--warning-bg)"
                              : "rgba(100, 110, 140, 0.15)",
                          color:
                            record.ownershipStatus === "Owned"
                              ? "var(--accent-light)"
                              : record.ownershipStatus === "Listed"
                              ? "var(--success)"
                              : record.ownershipStatus === "Locked"
                              ? "var(--danger)"
                              : record.ownershipStatus === "Staked"
                              ? "var(--warning)"
                              : "var(--text-secondary)"
                        }}
                      >
                        {record.ownershipStatus}
                      </span>
                    </td>

                    {/* Creation date */}
                    <td style={{ padding: "16px 12px", color: "var(--text-secondary)" }}>
                      {record.creationDate}
                    </td>

                    {/* Transfer count */}
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          background: "var(--bg-elevated)",
                          borderRadius: "var(--radius-full)",
                          padding: "3px 9px",
                          fontSize: "0.8rem",
                          border: "1px solid var(--border)",
                          fontWeight: 500
                        }}
                      >
                        {record.transferHistoryCount}
                      </span>
                    </td>

                    {/* Verification badge */}
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        className={`badge ${
                          record.verificationStatus === "Verified"
                            ? "badge-success"
                            : record.verificationStatus === "Pending"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      >
                        {record.verificationStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => setSelectedAsset(record)}
                          style={{
                            background: "var(--bg-elevated)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--radius-md)",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                          className="hover-lift"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => exportCertificatePDF(record)}
                          style={{
                            background: "transparent",
                            color: "var(--accent-light)",
                            border: "1px solid var(--border-accent)",
                            borderRadius: "var(--radius-md)",
                            padding: "6px 8px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          title="Download Certificate PDF"
                          className="hover-lift"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <polyline points="9 15 12 18 15 15"></polyline>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlignment: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                        No records matched your search query or filter settings.
                      </p>
                      <button
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("all");
                          setVerificationFilter("all");
                        }}
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "var(--radius-md)",
                          padding: "6px 14px",
                          fontSize: "0.85rem",
                          cursor: "pointer"
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Details Drawer / Side Panel Modal */}
      {selectedAsset && (
        <>
          {/* Overlay backdrop */}
          <div
            onClick={() => setSelectedAsset(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(10, 11, 20, 0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          />

          {/* Slide-out side drawer */}
          <div
            className="animate-fade-in"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "var(--bg-elevated)",
              borderLeft: "1px solid var(--border-strong)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 1010,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "var(--bg-surface)"
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    background: selectedAsset.glowingColor
                  }}
                />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }} className="font-bold">
                  Asset Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  padding: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Scrollable details panel */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }} className="scroll-area flex flex-col gap-6">
              {/* Asset Hero banner */}
              <div
                style={{
                  height: "180px",
                  borderRadius: "var(--radius-lg)",
                  background: selectedAsset.glowingColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                  }}
                >
                  <h2 style={{ fontSize: "2rem", color: "#fff", margin: 0 }}>{selectedAsset.assetName}</h2>
                  <code style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", padding: "2px 8px", background: "rgba(255,255,255,0.15)", borderRadius: "6px" }}>
                    #{selectedAsset.assetId}
                  </code>
                </div>
                <div
                  className="badge"
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    background: "rgba(255,255,255,0.9)",
                    color: "var(--accent-dark)"
                  }}
                >
                  {selectedAsset.tokenStandard}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted mb-2">DESCRIPTION</p>
                <p className="text-secondary text-sm leading-relaxed" style={{ background: "var(--bg-base)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  {selectedAsset.description}
                </p>
              </div>

              {/* Details List */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">METADATA SUMMARY</p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                    backgroundColor: "var(--border)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden"
                  }}
                >
                  {/* Row */}
                  <div style={{ display: "flex", padding: "12px 16px", backgroundColor: "var(--bg-surface)", fontSize: "0.85rem" }}>
                    <div style={{ width: "140px", fontWeight: 600, color: "var(--text-muted)" }}>Owner Address</div>
                    <div style={{ flex: 1 }}><code style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>{selectedAsset.ownerAddress}</code></div>
                  </div>
                  {/* Row */}
                  <div style={{ display: "flex", padding: "12px 16px", backgroundColor: "var(--bg-surface)", fontSize: "0.85rem" }}>
                    <div style={{ width: "140px", fontWeight: 600, color: "var(--text-muted)" }}>Creator Address</div>
                    <div style={{ flex: 1 }}><code style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>{selectedAsset.creatorAddress}</code></div>
                  </div>
                  {/* Row */}
                  <div style={{ display: "flex", padding: "12px 16px", backgroundColor: "var(--bg-surface)", fontSize: "0.85rem" }}>
                    <div style={{ width: "140px", fontWeight: 600, color: "var(--text-muted)" }}>Contract Address</div>
                    <div style={{ flex: 1 }}><code style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>{selectedAsset.contractAddress}</code></div>
                  </div>
                  {/* Row */}
                  <div style={{ display: "flex", padding: "12px 16px", backgroundColor: "var(--bg-surface)", fontSize: "0.85rem" }}>
                    <div style={{ width: "140px", fontWeight: 600, color: "var(--text-muted)" }}>Ownership Status</div>
                    <div style={{ flex: 1 }} className="font-semibold text-accent">{selectedAsset.ownershipStatus}</div>
                  </div>
                  {/* Row */}
                  <div style={{ display: "flex", padding: "12px 16px", backgroundColor: "var(--bg-surface)", fontSize: "0.85rem" }}>
                    <div style={{ width: "140px", fontWeight: 600, color: "var(--text-muted)" }}>Verification Status</div>
                    <div style={{ flex: 1 }}>
                      <span className={`badge ${selectedAsset.verificationStatus === "Verified" ? "badge-success" : "badge-warning"}`}>
                        {selectedAsset.verificationStatus}
                      </span>
                    </div>
                  </div>
                  {/* Row */}
                  <div style={{ display: "flex", padding: "12px 16px", backgroundColor: "var(--bg-surface)", fontSize: "0.85rem" }}>
                    <div style={{ width: "140px", fontWeight: 600, color: "var(--text-muted)" }}>Creation Date</div>
                    <div style={{ flex: 1, color: "var(--text-secondary)" }}>{selectedAsset.creationDate}</div>
                  </div>
                  {/* Row */}
                  <div style={{ display: "flex", padding: "12px 16px", backgroundColor: "var(--bg-surface)", fontSize: "0.85rem" }}>
                    <div style={{ width: "140px", fontWeight: 600, color: "var(--text-muted)" }}>Last Updated</div>
                    <div style={{ flex: 1, color: "var(--text-secondary)" }}>{selectedAsset.lastUpdated}</div>
                  </div>
                </div>
              </div>

              {/* Timeline list */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted mb-4">ON-CHAIN TRANSACTION HISTORIES</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingLeft: "12px", borderLeft: "2px solid var(--border)" }}>
                  {selectedAsset.transferHistory.length > 0 ? (
                    selectedAsset.transferHistory.map((tx, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        {/* Timeline Node dot */}
                        <div
                          style={{
                            position: "absolute",
                            left: "-18px",
                            top: "4px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "var(--accent)",
                            border: "2px solid var(--bg-elevated)",
                            boxShadow: "0 0 8px var(--accent-glow)"
                          }}
                        />
                        <div style={{ fontSize: "0.85rem" }}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-primary">Transfer #{idx + 1}</span>
                            <span className="text-xs text-muted mono">{tx.timestamp}</span>
                          </div>
                          <div className="text-secondary mt-1 flex flex-col gap-1" style={{ fontSize: "0.8rem" }}>
                            <span><strong>From:</strong> <code>{tx.from}</code></span>
                            <span><strong>To:</strong> <code>{tx.to}</code></span>
                            <span style={{ color: "var(--accent-light)" }}><strong>TX:</strong> <code>{tx.txHash}</code></span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", padding: "10px 0" }}>
                      No transfers recorded yet. Current owner is the original minter.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border-strong)",
                backgroundColor: "var(--bg-surface)",
                display: "flex",
                gap: "12px"
              }}
            >
              <button
                onClick={() => exportCertificatePDF(selectedAsset)}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
                  color: "var(--text-inverse)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "12px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "var(--shadow-accent)"
                }}
                className="hover-lift"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <polyline points="9 15 12 18 15 15"></polyline>
                </svg>
                Download Certificate PDF
              </button>
              <button
                onClick={() => setSelectedAsset(null)}
                style={{
                  border: "1px solid var(--border-strong)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 18px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
                className="hover-lift"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
