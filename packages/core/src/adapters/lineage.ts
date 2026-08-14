import { CATEGORY_TO_LINEAGE_ID } from "../categories";
import { greenfield, lineageRecords } from "../data/lineage";
import type { RawLineage } from "../raw";
import type { Category, LineageView } from "../types";

function toView(raw: RawLineage, category: Category): LineageView {
  return {
    jobId: raw.jobId,
    category,
    status: raw.status === "VERIFIED" ? "VERIFIED" : "UNVERIFIED",
    agentId: raw.agentId,
    metric: raw.metricDetail.metric,
    metricUnit: raw.metricDetail.unit,
    metricValue: raw.metricDetail.value,
    metricFormula: raw.metricDetail.formula,
    scoreVersion: raw.scoreVersion,
    schemaVersion: raw.schemaVersion,
    startBlock: raw.startBlock,
    endBlock: raw.endBlock,
    dataCutoffBlock: raw.dataCutoffBlock,
    evidenceUri: raw.evidenceUri,
    evidenceContentHash: raw.evidenceContentHash,
    recordHash: raw.recordHash,
    mandateHash: raw.mandateHash,
    taskHash: raw.taskHash,
    transactions: raw.transactions,
    selfClaims: raw.selfClaims ?? {}
  };
}

export function getLineage(category: Category): LineageView {
  const id = CATEGORY_TO_LINEAGE_ID[category];
  const record = lineageRecords[id];
  if (!record) throw new Error(`UNKNOWN_LINEAGE_ID: ${id}`);
  return toView(record, category);
}

export function getAllLineage(): LineageView[] {
  return (Object.keys(CATEGORY_TO_LINEAGE_ID) as Category[]).map(getLineage);
}

export interface GreenfieldObjectView {
  category: string;
  gnfdUri: string;
  objectName: string;
  contentSha256: string;
  createObjectTx: string;
  downloadVerified: boolean;
}

export function getGreenfieldByUri(uri: string): GreenfieldObjectView | null {
  const obj = greenfield.objects.find((o) => o.gnfdUri === uri);
  if (!obj) return null;
  return {
    category: obj.category,
    gnfdUri: obj.gnfdUri,
    objectName: obj.objectName,
    contentSha256: obj.downloadedByteSha256,
    createObjectTx: obj.createObjectTx,
    downloadVerified: obj.downloadVerified
  };
}
