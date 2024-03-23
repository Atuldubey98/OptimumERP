import { useState } from "react";

export default function useSaveAndNewForm(type = "save-new:invoice") {
  const [saveAndNew, setSaveAndNew] = useState(
    localStorage.getItem(type) ? true : false
  );
  const onToggleSaveAndNew = (checked) => {
    setSaveAndNew(checked);
    if (checked) {
      localStorage.setItem(type, checked);
    } else {
      localStorage.removeItem(type);
    }
  };
  return { onToggleSaveAndNew, saveAndNew };
}
