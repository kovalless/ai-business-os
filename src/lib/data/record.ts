import type { Note } from "@/lib/types";

export const notes: Note[] = [
  { id: "n1", title: "How we quote balustrades", kind: "process", updated: "12 Jul", body: "Metre rate plus fixings, plus 12% for site measure on anything above the second floor. Never quote a balustrade from drawings alone \u2014 Oberkassel cost us \u20AC2,100 in rework.", usedBy: "Quotes, The Table" },
  { id: "n2", title: "Dijkman price behaviour", kind: "supplier", updated: "29 Jul", body: "Raises in July and January, usually 4\u20136%. Gives no notice. Holds the old rate for orders already confirmed in writing.", usedBy: "Signals, Work", byMachine: true },
  { id: "n3", title: "The 2026 rate change", kind: "pricing", updated: "18 Mar", body: "Raised 8% across all fabrication in March. Explained by letter first, email second. No customer left. Revenue per job rose 11% by June.", usedBy: "Reach, The Long View" },
  { id: "n4", title: "Why we stopped taking domestic gates", kind: "decision", updated: "04 Feb", body: "Margin below 14% on every job in 2025, and they consume the small bay. Decision: refer to Brouwer, keep the relationship.", usedBy: "The Table" },
  { id: "n5", title: "Martin Kessler", kind: "person", updated: "13 Jun", body: "Pays late, always pays. Responds to a phone call, not an email. Knee surgery 20 June 2026. Ask before you invoice.", usedBy: "People, Moves" },
  { id: "n6", title: "Powder coating lead times", kind: "supplier", updated: "22 Jun", body: "Van Egmond needs 6 working days in summer, 9 in November. Book before the job is welded, not after." },
];

export type Doc = {
  id: string;
  title: string;
  kind: "document" | "playbook" | "meeting" | "process";
  updated: string;
  owner: string;
  body: string;
  pinned?: boolean;
  links?: string[];
};

export const docs: Doc[] = [
  { id: "d1", title: "Balustrade quoting playbook", kind: "playbook", updated: "12 Jul", owner: "Joris", pinned: true, links: ["Dijkman price behaviour", "The 2026 rate change"], body: "Metre rate plus fixings, plus 12% for site measure above the second floor. Never quote from drawings alone. Confirm steel in writing on the day of quoting so the supplier holds the rate." },
  { id: "d2", title: "Site measure method statement", kind: "process", updated: "18 Jun", owner: "Ruben", links: ["Balustrade quoting playbook"], body: "Two people, always. Laser plus tape as a check. Photograph every fixing face. Anything above 6m needs the tower booked the week before." },
  { id: "d3", title: "Monday production meeting \u2014 28 July", kind: "meeting", updated: "28 Jul", owner: "Marit", links: ["Powder coating lead times"], body: "Polderlicht frames must reach Van Egmond by Thursday. Ruben flagged the 40mm box section is down to four lengths. Joris to requote the three open jobs at the new rate." },
  { id: "d4", title: "Monday production meeting \u2014 21 July", kind: "meeting", updated: "21 Jul", owner: "Marit", body: "Herengracht signed off. Agreed to close 2\u20139 August. Marit to send the closure notice before the 1st." },
  { id: "d5", title: "How we handle a late delivery", kind: "playbook", updated: "04 Feb", owner: "Joris", pinned: true, body: "Phone the customer the day we know, not the day it slips. Name the new date once and hold it. Never discount before being asked; if asked, discount the next job, not this one." },
  { id: "d6", title: "Powder coating specification", kind: "document", updated: "22 Jun", owner: "Ruben", links: ["Powder coating lead times"], body: "RAL 7016 semi-matt as house standard. Zinc primer on anything exterior. Van Egmond needs 6 working days in summer, 9 in November." },
  { id: "d7", title: "Insurance and site cover", kind: "document", updated: "09 Jan", owner: "Marit", body: "Public liability to \u20AC2.5m, renewed each January. Tender work above \u20AC50k needs the certificate attached at submission." },
];
