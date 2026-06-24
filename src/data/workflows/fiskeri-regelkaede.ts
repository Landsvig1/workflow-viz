import { Workflow } from "@/types/workflow";

export const fiskeriRegelkaede: Workflow = {
  id: "fiskeri-regelkaede",
  title: "Fiskerikontrol — fra fangst til salgsnota",
  description:
    "Forhåndsmeddelelse → vejning → landingsopgørelse → første salg → salgsnota, med gennemførelses- og bemyndigelseslag (1224/2009 + 2025/2196) som afhængigheder.",
  summary:
    "12 EU-regeluddrag struktureret som én proceskæde: hvert trin viser sin kilde, hvad det afhænger af, hvad der overlapper, og de åbne spørgsmål man bør stille en jurist frem for at gætte.",
  category: "operations",
  tags: ["EU-forordning", "Fiskerikontrol", "Regelafhængighed", "Case", "Datamodel"],
  complexity: "complex",
  // The two axes of the case made visible: x = process sequence, lanes = the
  // regulation layer each rule lives in.
  lanes: [
    { id: "haendelse", label: "Hændelse" },
    { id: "grund", label: "Grundforordning · 1224/2009" },
    { id: "gennemf", label: "Gennemførelse · 2025/2196" },
  ],
  // Tightened from the engine defaults: this graph is wide (9 process layers),
  // so pull the layers closer and trim band height for a denser read.
  layout: {
    layerSpacing: 64,
    rowPitch: 150,
    laneGap: 44,
  },
  nodes: [
    {
      id: "trigger-1",
      lane: "haendelse",
      data: {
        label: "Fangstrejse → ankomst",
        type: "trigger",
        description:
          "Fartøj afslutter fangstrejsen og nærmer sig havn eller landingssted.",
        plainLanguage:
          "En fiskerbåd er færdig med at fiske og er på vej i havn med fangsten.",
        tool: "Hændelse",
        config: {
          "åbent spørgsmål":
            "Casen siger 12 uddrag fra 3 forordninger — kun 2 optræder (1224/2009 + 2025/2196). Mislabel, manglende forordning, eller tæller den 'henviste-men-ikke-udleverede'?",
        },
      },
    },
    {
      id: "D",
      lane: "grund",
      data: {
        label: "Forhåndsmeddelelse",
        type: "action",
        description:
          "≥4t før ankomst sendes fangst- og ankomstdata elektronisk til flagmedlemsstaten.",
        plainLanguage:
          "Inden båden lægger til, melder den til myndigheden hvad den har ombord og hvornår den ankommer.",
        tool: "Art 17.1 · 1224/2009",
        config: {
          lag: "grund 1224/2009",
          gælder: "fartøj ≥12 m",
          frist: "≥4 timer før ankomst",
          modtager: "flagmedlemsstat",
          datamodel:
            "fangstrejse-id · CFR-nr · FAO alfa-3 · mængder — deles med I og E",
          "ikke udleveret": "flerårige planer (særlige bestemmelser)",
        },
      },
    },
    {
      id: "J",
      lane: "grund",
      data: {
        label: "Kortere frist (kyst)",
        type: "condition",
        description:
          "Kystmedlemsstaten kan fastsætte en kortere frist for forhåndsmeddelelsen for visse fartøjskategorier.",
        plainLanguage:
          "Det land hvis havn bruges kan kræve kortere varsel end de 4 timer.",
        tool: "Art 17.1a · 1224/2009",
        config: {
          lag: "grund 1224/2009",
          modificerer: "D (art 17.1)",
          "åbent spørgsmål":
            "Flagmedlemsstat modtager (D), men kystmedlemsstat sætter fristen (J) — hvem styrer når det er to forskellige lande?",
        },
      },
    },
    {
      id: "B",
      lane: "grund",
      data: {
        label: "Vejning",
        type: "action",
        description:
          "Alle mængder vejes pr. art straks efter landing på godkendt vejesystem, før oplagring, transport eller omsætning.",
        plainLanguage:
          "Fangsten vejes med det samme når den er i land — art for art, på en godkendt vægt.",
        tool: "Art 60.1 · 1224/2009",
        config: {
          lag: "grund 1224/2009",
          krav: "godkendt vejesystem",
          tidspunkt: "straks efter landing",
        },
      },
    },
    {
      id: "F",
      lane: "gennemf",
      data: {
        label: "Transporteret før vejning?",
        type: "condition",
        description:
          "Hvis fisken transporteres fra landingsstedet før vejning, anses landingen først for afsluttet når der er vejet.",
        plainLanguage:
          "Flyttes fisken før den vejes, tæller landingen først som færdig når vejningen er sket.",
        tool: "Art 32.1 · 2025/2196",
        config: {
          lag: "gennemførelse 2025/2196",
          effekt: "omdefinerer 'landing afsluttet' for art 23, 24 og 66",
          "åbent spørgsmål":
            "Hvilken dato gælder så i landingsopgørelsen (I) — landing (felt f) vs. vejning (felt g)?",
          "ikke udleveret": "art 24 og art 66",
        },
      },
    },
    {
      id: "I",
      lane: "grund",
      data: {
        label: "Landingsopgørelse",
        type: "transform",
        description:
          "Dokument over landet fangst: art, mængde (vejet jf. art 60), sted, datoer, operatør og omregningsfaktorer.",
        plainLanguage:
          "Et dokument der opgør præcis hvad der blev landet — art, mængde, hvor og hvornår.",
        tool: "Art 23.2 · 1224/2009",
        config: {
          lag: "grund 1224/2009",
          "afhænger af": "B (vejning, art 60) og F ('afsluttet')",
          datamodel:
            "fangstrejse-id · CFR-nr · FAO alfa-3 · mængder — deles med D og E",
          "ikke udleveret": "art 60.5 (operatør)",
        },
      },
    },
    {
      id: "salg",
      lane: "grund",
      data: {
        label: "Hvor sker første salg?",
        type: "condition",
        description:
          "Første salg i EU eller uden for Unionen afgør hvem der indsender salgsnotaen.",
        plainLanguage:
          "Sælges fangsten i EU eller uden for? Det bestemmer hvem der skal indsende salgsdokumentet.",
        tool: "Art 62 · 1224/2009",
        config: { lag: "grund 1224/2009" },
      },
    },
    {
      id: "A",
      lane: "grund",
      data: {
        label: "Salgsnota — køber indsender",
        type: "action",
        description:
          "Registreret køber/auktion/PO indsender salgsnota ≤48t efter første salg til myndigheden, hvor salget sker.",
        plainLanguage:
          "Køberen sender et salgsdokument til myndigheden senest 48 timer efter salget.",
        tool: "Art 62.1 · 1224/2009",
        config: {
          lag: "grund 1224/2009",
          frist: "≤48t efter første salg",
          ansvarlig: "registreret køber / auktion / PO",
          overlap: "samme forpligtelse genfortælles i H (2025/2196)",
        },
      },
    },
    {
      id: "G",
      lane: "grund",
      data: {
        label: "Salgsnota — salg uden for EU",
        type: "action",
        description:
          "Sker første salg uden for Unionen, sender fartøjsføreren salgsnotaen ≤48t til flagmedlemsstaten.",
        plainLanguage:
          "Sælges fangsten uden for EU, er det kaptajnen der sender dokumentet til hjemlandet.",
        tool: "Art 62.4 · 1224/2009",
        config: {
          lag: "grund 1224/2009",
          frist: "≤48t efter første salg",
          ansvarlig: "fartøjsfører",
          "parallel til": "A — samme forpligtelse, anden kanal",
        },
      },
    },
    {
      id: "E",
      lane: "grund",
      data: {
        label: "Salgsnota — indhold",
        type: "transform",
        description:
          "Datakrav til salgsnotaen: fangstrejse-id, CFR, FAO-kode, mængder pr. præsentationsform, pris, valuta, påtænkt anvendelse m.m.",
        plainLanguage:
          "Specifikationen for hvilke felter et salgsdokument skal indeholde.",
        tool: "Art 64.1 · 1224/2009",
        config: {
          lag: "grund 1224/2009",
          datamodel:
            "fangstrejse-id · CFR-nr · FAO alfa-3 · mængder — deles med D og I",
          "præciseres af": "C (præsentationsform) og L (valuta)",
        },
      },
    },
    {
      id: "H",
      lane: "gennemf",
      data: {
        label: "Indsend elektronisk",
        type: "action",
        description:
          "Registrerede købere/auktioner/PO'er udfylder og indsender salgsnotaen elektronisk jf. art 62 og 64 samt bilag XIX.",
        plainLanguage:
          "Gennemførelsesreglen for hvordan salgsdokumentet rent praktisk indsendes elektronisk.",
        tool: "Art 34.1 · 2025/2196",
        config: {
          lag: "gennemførelse 2025/2196",
          implementerer: "A (art 62) + E (art 64)",
          "ikke udleveret": "bilag XIX, art 65 (undtagelser)",
        },
      },
    },
    {
      id: "C",
      lane: "gennemf",
      data: {
        label: "Præsentationsform",
        type: "transform",
        description:
          "Præsentationsformen skal omfatte forarbejdningstilstand jf. tabel 2 i bilag I.",
        plainLanguage:
          "Detaljeregel for hvordan fiskens tilstand (fx hel eller filet) skal angives i salgsnotaen.",
        tool: "Art 34.2 · 2025/2196",
        config: {
          lag: "gennemførelse 2025/2196",
          præciserer: "E — art 64.1, litra g",
          "ikke udleveret": "bilag I, tabel 2",
        },
      },
    },
    {
      id: "L",
      lane: "gennemf",
      data: {
        label: "Pris i valuta",
        type: "transform",
        description:
          "Prisen angives i valutaen i den medlemsstat, hvor salget finder sted.",
        plainLanguage: "Detaljeregel: prisen skal stå i salgslandets valuta.",
        tool: "Art 34.3 · 2025/2196",
        config: {
          lag: "gennemførelse 2025/2196",
          præciserer: "E — art 64.1, litra n",
        },
      },
    },
    {
      id: "K",
      lane: "grund",
      data: {
        label: "Bemyndigelse",
        type: "action",
        description:
          "Kommissionen kan ved gennemførelsesretsakter fastsætte nærmere regler for køberregistrering, salgsnota-format og elektronisk indsendelse.",
        plainLanguage:
          "Hjemlen der giver Kommissionen lov til senere at lave detailreglerne — dem 2025/2196 indeholder.",
        tool: "Art 62.6 · 1224/2009",
        config: {
          lag: "grund 1224/2009 (bemyndigelse)",
          "realiseret i": "2025/2196 → H, C og L",
          "ikke udleveret": "art 119.2 (undersøgelsesprocedure)",
        },
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "D", animated: true },
    { id: "e2", source: "D", target: "B", animated: true },
    { id: "e3", source: "B", target: "I", animated: true },
    { id: "e4", source: "I", target: "salg", animated: true },
    { id: "e5", source: "salg", target: "A", label: "Salg i EU", animated: true },
    { id: "e6", source: "salg", target: "G", label: "Uden for EU", animated: true },
    { id: "e7", source: "A", target: "E", animated: true },
    { id: "e8", source: "G", target: "E", animated: true },
    { id: "e9", source: "E", target: "H", animated: true },
    { id: "e10", source: "J", target: "D", label: "forkorter frist", kind: "modifies" },
    { id: "e11", source: "F", target: "I", label: "definerer 'afsluttet'", kind: "modifies" },
    { id: "e12", source: "K", target: "H", label: "bemyndiger", kind: "authorizes" },
    { id: "e13", source: "C", target: "E", label: "§64.1.g", kind: "refines" },
    { id: "e14", source: "L", target: "E", label: "§64.1.n", kind: "refines" },
    // Same obligation restated in the implementing regulation.
    { id: "e15", source: "H", target: "A", label: "dublerer", kind: "duplicates" },
    // The hidden data model: same catch data captured at three points.
    { id: "e16", source: "D", target: "I", label: "samme datafelter", kind: "shares-data" },
    { id: "e17", source: "I", target: "E", label: "samme datafelter", kind: "shares-data" },
  ],
};
