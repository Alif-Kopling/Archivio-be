const stripUploadPrefix = (fileName) => {
  if (typeof fileName !== "string") {
    return "";
  }

  return fileName.replace(/^\d{13}-/, "");
};

const getDownloadFileNameFromPath = (filePath, fallback = "document.pdf") => {
  if (typeof filePath !== "string" || !filePath.trim()) {
    return fallback;
  }

  const baseName = filePath.split(/[\\/]/).pop() || "";
  const cleanedName = stripUploadPrefix(baseName);

  return cleanedName || fallback;
};

module.exports = {
  getDownloadFileNameFromPath,
  stripUploadPrefix,
};
