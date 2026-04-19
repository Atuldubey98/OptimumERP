import { useState } from "react";
import { useToast } from "@chakra-ui/react";

export const useFileUpload = () => {
  const [attachment, setAttachment] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum size is 5MB",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        preview: reader.result,
        base64: reader.result.split(",")[1],
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const clearAttachment = () => setAttachment(null);

  return { attachment, handleFileChange, clearAttachment };
};