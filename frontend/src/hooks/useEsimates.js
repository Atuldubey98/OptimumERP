import { useEffect, useState } from "react";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import { useParams } from "react-router-dom";

export default function useEsitamtes() {
    const [estimates, setEstimates] = useState([]);
    const {requestAsyncHandler}  =useAsyncCall();
    const {orgId}=useParams();
    const fetchQuotes = requestAsyncHandler(async ()=>{
        const {data} = await instance.get(`/api/v1/organizations/${orgId}/quotes`)
        setEstimates(data.data);
    },[])
    useEffect(()=>{
        fetchQuotes();
    },[])
    return {estimates}
}