// src/components/MultipleImageUploader.tsx
import { useRef, useState as useState2 } from "react";

// src/hooks/useFileUpload.ts
import { useCallback, useState } from "react";
import { toast } from "sonner";

// src/providers/FileUploadProvider.tsx
import { createContext, useContext } from "react";
import { jsx } from "react/jsx-runtime";
var FileUploadContext = createContext(void 0);
var FileUploadProvider = ({
  children,
  generateUploadUrl,
  saveFile,
  deleteFile
}) => {
  const value = {
    generateUploadUrl,
    saveFile,
    deleteFile
  };
  return /* @__PURE__ */ jsx(FileUploadContext.Provider, { value, children });
};
var useFileUploadActions = () => {
  const context = useContext(FileUploadContext);
  if (context === void 0) {
    throw new Error("useFileUploadActions must be used within a FileUploadProvider");
  }
  return context;
};

// src/hooks/useFileUpload.ts
function useFileUpload(config = {}) {
  const {
    generateUploadUrl,
    saveFile,
    deleteFile: providedDeleteFile
  } = useFileUploadActions();
  const {
    maxSizeInMB = 10,
    allowedTypes = [],
    successMessage = "File uploaded successfully!",
    errorMessage = "Failed to upload file",
    deleteSuccessMessage = "File deleted successfully!",
    deleteErrorMessage = "Failed to delete file."
  } = config;
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const validateFile = useCallback(
    (file) => {
      if (file.size > maxSizeInMB * 1024 * 1024) {
        return `File size must be less than ${maxSizeInMB}MB`;
      }
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`;
      }
      return null;
    },
    [maxSizeInMB, allowedTypes]
  );
  const uploadFile = useCallback(
    async (file) => {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        throw new Error(validationError);
      }
      setIsUploading(true);
      const loadingToast = toast.loading(`Uploading ${file.name}...`);
      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file
        });
        if (!result.ok)
          throw new Error(`Upload failed: ${result.statusText}`);
        const { storageId } = await result.json();
        await saveFile({
          name: file.name,
          storageId,
          type: file.type,
          size: file.size
        });
        setIsUploading(false);
        toast.success(successMessage, { id: loadingToast });
        return storageId;
      } catch (error) {
        setIsUploading(false);
        const message = error instanceof Error ? error.message : errorMessage;
        toast.error(message, { id: loadingToast });
        throw error;
      }
    },
    [validateFile, generateUploadUrl, saveFile, successMessage, errorMessage]
  );
  const uploadMultipleFiles = useCallback(
    async (files) => {
      const loadingToast = toast.loading(`Uploading ${files.length} files...`);
      try {
        const storageIds = await Promise.all(files.map(uploadFile));
        toast.success(`Successfully uploaded ${files.length} files!`, {
          id: loadingToast
        });
        return storageIds;
      } catch (error) {
        toast.error("Some files failed to upload.", { id: loadingToast });
        throw error;
      }
    },
    [uploadFile]
  );
  const deleteFile = useCallback(
    async (args) => {
      setIsDeleting(true);
      const loadingToast = toast.loading("Deleting file...");
      try {
        await providedDeleteFile(args);
        toast.success(deleteSuccessMessage, { id: loadingToast });
      } catch (error) {
        const message = error instanceof Error ? error.message : deleteErrorMessage;
        toast.error(message, { id: loadingToast });
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [providedDeleteFile, deleteSuccessMessage, deleteErrorMessage]
  );
  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    isUploading,
    isDeleting
  };
}

// src/components/MultipleImageUploader.tsx
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";
function MultipleImageUploader({
  imageFields,
  appendImage,
  removeImage,
  maxImages,
  maxSizeInMB,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  successMessage = "Image uploaded successfully!",
  errorMessage = "Failed to upload image",
  children
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState2(false);
  const { uploadFile, uploadMultipleFiles, deleteFile } = useFileUpload({
    maxSizeInMB,
    allowedTypes,
    successMessage,
    errorMessage
  });
  const handleImageDelete = async (index) => {
    await deleteFile({ storageId: imageFields[index].value });
    removeImage(index);
  };
  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0)
      return;
    const filesArray = Array.from(files);
    const remaining = Math.max(0, maxImages - imageFields.length);
    if (remaining <= 0) {
      if (fileInputRef.current)
        fileInputRef.current.value = "";
      return;
    }
    if (filesArray.length > remaining) {
      filesArray.splice(remaining);
    }
    setIsUploading(true);
    try {
      if (filesArray.length === 1) {
        const storageId = await uploadFile(filesArray[0]);
        appendImage({ value: storageId });
      } else {
        const storageIds = await uploadMultipleFiles(filesArray);
        storageIds.forEach((storageId) => appendImage({ value: storageId }));
      }
    } finally {
      setIsUploading(false);
    }
    if (fileInputRef.current)
      fileInputRef.current.value = "";
  };
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  const canAddMore = imageFields.length < maxImages;
  const remainingSlots = Math.max(0, maxImages - imageFields.length);
  const renderProps = {
    isUploading,
    imageFields,
    handleFileChange,
    handleImageDelete,
    triggerFileSelect,
    fileInputRef,
    maxImages,
    canAddMore,
    remainingSlots
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx2(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: "image/*",
        multiple: true,
        onChange: handleFileChange,
        className: "hidden"
      }
    ),
    children(renderProps)
  ] });
}

// src/components/SingleImageUploader.tsx
import { useRef as useRef2, useState as useState3 } from "react";
import { Fragment as Fragment2, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function SingleImageUploader({
  image,
  setImage,
  removeImage,
  maxSizeInMB,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  successMessage = "Image uploaded successfully!",
  errorMessage = "Failed to upload image",
  children
}) {
  const fileInputRef = useRef2(null);
  const [isUploading, setIsUploading] = useState3(false);
  const { uploadFile, deleteFile } = useFileUpload({
    maxSizeInMB,
    allowedTypes,
    successMessage,
    errorMessage
  });
  const handleImageDelete = async () => {
    if (!image)
      return;
    await deleteFile({ storageId: image.value });
    removeImage();
  };
  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0)
      return;
    const file = files[0];
    setIsUploading(true);
    try {
      const storageId = await uploadFile(file);
      setImage({ value: storageId });
    } finally {
      setIsUploading(false);
    }
    if (fileInputRef.current)
      fileInputRef.current.value = "";
  };
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  const hasImage = Boolean(image);
  const renderProps = {
    isUploading,
    image,
    handleFileChange,
    handleImageDelete,
    triggerFileSelect,
    fileInputRef,
    hasImage
  };
  return /* @__PURE__ */ jsxs2(Fragment2, { children: [
    /* @__PURE__ */ jsx3(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: "image/*",
        onChange: handleFileChange,
        className: "hidden"
      }
    ),
    children(renderProps)
  ] });
}
export {
  FileUploadProvider,
  MultipleImageUploader,
  SingleImageUploader,
  useFileUpload,
  useFileUploadActions
};
