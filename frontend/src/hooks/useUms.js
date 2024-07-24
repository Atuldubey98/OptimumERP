import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../instance";
import useQuery from "./useQuery";
import { useToast } from "@chakra-ui/react";

export default function useUms() {
  const [ums, setUms] = useState([]);
  const [status, setStatus] = useState("idle");
  const query = useQuery();
  const toast = useToast();
  const search = query.get("query") || "";
  const { orgId } = useParams();
  const [hasReachedLimit, setHasReachedLimit] = useState(true);
  useEffect(() => {
    fetchUms();
  }, [search]);
  const fetchUms = async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/ums?search=${search}`
    );
    setUms(data.data);
    setHasReachedLimit(data.reachedLimit);
    setStatus("idle");
  };
  const toggleStatus = async (selectedUm) => {
    setUms(
      ums.map((um) =>
        um._id === selectedUm._id ? { ...um, enabled: !um.enabled } : um
      )
    );
    const { _id, org, createdAt, updatedAt, __v, ...um } = selectedUm;
    const { data } = await instance.patch(
      `/api/v1/organizations/${orgId}/ums/${_id}`,
      { ...um, enabled: !selectedUm.enabled }
    );
    toast({
      title: "Success",
      description: data.message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  const onDeleteUm = (um) => async () => {
    try {
      const { data } = await instance.delete(
        `/api/v1/organizations/${orgId}/ums/${um._id}`
      );
      toast({
        title: "Success",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchUms();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  return { ums, fetchUms, status, toggleStatus, onDeleteUm, hasReachedLimit };
}
