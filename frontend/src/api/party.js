import instance from "../instance";
import { getPartyUrl } from "./utils";

export const createParty = (party, orgId) => {
  return instance.post(getPartyUrl(orgId), party);
};

export const updateParty = (party, orgId) => {
  const { _id, ...partyToUpdate } = party;
  const url = `${getPartyUrl(orgId)}/${_id}`;
  return instance.patch(url, partyToUpdate);
};

export const deleteParty = (partyId, orgId) => {
  const url = `${getPartyUrl(orgId)}/${partyId}`;
  return instance.delete(url);
};
