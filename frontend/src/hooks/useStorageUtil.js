export default function useStorageUtil() {
  const getFileUrl = (filePath) => {
    if (filePath && !filePath.startsWith("http")) {
      return `${import.meta.env.VITE_API_URL}/${filePath}`;
    }
    return filePath;
  };

  return { getFileUrl };
}
  