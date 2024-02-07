import { useContext } from "react";
import OrgContext from "../contexts/OrgContext";

export default function useOrganizationSelect() {
  const orgContext = useContext(OrgContext);
  const selectOrg = orgContext?.selectedOrg;
  const status = orgContext?.status;
  const onSetOrg = orgContext?.onSetOrg;
  return { selectOrg, status, onSetOrg };
}
