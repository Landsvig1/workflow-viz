import { Workflow } from "@/types/workflow";

export const invoiceProcessing: Workflow = {
  id: "invoice-processing",
  title: "AI Faktura-Behandling",
  description:
    "Indgående faktura via email → OCR + AI-udtræk → validering mod ERP → godkendelse → bogføring",
  category: "finance",
  tags: ["ERP", "OCR", "Finance", "AI", "Business Central"],
  complexity: "complex",
  nodes: [
    {
      id: "trigger-1",
      type: "workflowNode",
      position: { x: 50, y: 250 },
      data: {
        label: "Email Modtaget",
        type: "trigger",
        description: "Ny email i fakturapostkassen",
        tool: "Microsoft 365",
      },
    },
    {
      id: "llm-1",
      type: "workflowNode",
      position: { x: 280, y: 250 },
      data: {
        label: "OCR + Dataudtræk",
        type: "llm",
        description: "Udtræk leverandør, beløb, linjer, moms",
        tool: "GPT-4o Vision",
      },
    },
    {
      id: "api-1",
      type: "workflowNode",
      position: { x: 510, y: 150 },
      data: {
        label: "Valider Leverandør",
        type: "api",
        description: "Tjek CVR og leverandørstatus",
        tool: "CVR API",
      },
    },
    {
      id: "erp-1",
      type: "workflowNode",
      position: { x: 510, y: 350 },
      data: {
        label: "Match mod PO",
        type: "erp",
        description: "Find matchende Purchase Order i ERP",
        tool: "Business Central",
      },
    },
    {
      id: "condition-1",
      type: "workflowNode",
      position: { x: 740, y: 250 },
      data: {
        label: "Auto-godkend?",
        type: "condition",
        description: "Beløb < 5.000 kr og match fundet",
      },
    },
    {
      id: "human-1",
      type: "workflowNode",
      position: { x: 970, y: 150 },
      data: {
        label: "Manuel Godkendelse",
        type: "human",
        description: "Økonomiansvarlig godkender i Teams",
        tool: "Microsoft Teams",
      },
    },
    {
      id: "erp-2",
      type: "workflowNode",
      position: { x: 970, y: 350 },
      data: {
        label: "Bogfør Faktura",
        type: "erp",
        description: "Post faktura og opret betaling",
        tool: "Business Central",
      },
    },
    {
      id: "action-1",
      type: "workflowNode",
      position: { x: 1200, y: 250 },
      data: {
        label: "Bekræftelse Email",
        type: "action",
        description: "Send bekræftelse til leverandør",
        tool: "Microsoft 365",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "llm-1", animated: true },
    { id: "e2", source: "llm-1", target: "api-1" },
    { id: "e3", source: "llm-1", target: "erp-1" },
    { id: "e4", source: "api-1", target: "condition-1" },
    { id: "e5", source: "erp-1", target: "condition-1" },
    { id: "e6", source: "condition-1", target: "human-1", label: "Manuel" },
    { id: "e7", source: "condition-1", target: "erp-2", label: "Auto" },
    { id: "e8", source: "human-1", target: "erp-2", label: "Godkendt" },
    { id: "e9", source: "erp-2", target: "action-1" },
  ],
};
