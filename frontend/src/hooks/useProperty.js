import { useCallback, useEffect, useState } from 'react';
import instance from '../instance';

export default function useProperty(name) {
    const [status, setStatus] = useState("loading");
    const [value, setValue] = useState();
    const fetchValue = useCallback( async ()=>{
        setStatus("loading");
        const response = await instance.get(`/api/v1/property/${name}`);        
        setValue(response.data.data);
        setStatus("idle");
    },[name])
    useEffect(()=>{
        fetchValue()
    },[name])
    return {fetchValue, status, value};
}
