import { useEffect, useRef, useState } from "react";

export default function useDebouncedInput(callback) {
  const [input, setInput] = useState("");
  const [deboucedInput, setDeboucedInput] = useState("");
  const debouceRef = useRef(null);
  const onChangeInput = (e) => {
    setInput(e.currentTarget.value);
  };
  useEffect(() => {
    if (debouceRef.current) clearTimeout(debouceRef.current);
    debouceRef.current = setTimeout(() => {
      setDeboucedInput(input);
      if (callback) callback();
    }, 1500);
    return () => {
      if (debouceRef.current) clearTimeout(debouceRef.current);
    };
  }, [debouceRef, input]);
  return {
    onChangeInput,
    deboucedInput,
    input,
  };
}
