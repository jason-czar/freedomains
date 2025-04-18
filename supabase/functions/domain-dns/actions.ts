
import { updateDomainSettings } from "./domain-settings.ts";
import { 
  checkDomain, 
  createDomain,
  verifyDomainRecords,
  checkVercelVerification
} from "./dns-actions.ts";
import { 
  deleteDomain, 
  listRecords, 
  addRecord, 
  deleteRecord, 
  updateRecord 
} from "./dns-management.ts";

// Export all functions for use in index.ts
export {
  checkDomain,
  createDomain,
  deleteDomain,
  listRecords,
  addRecord,
  deleteRecord,
  updateRecord,
  updateDomainSettings,
  verifyDomainRecords,
  checkVercelVerification
};
