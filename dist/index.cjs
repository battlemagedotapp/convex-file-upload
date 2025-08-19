"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  FileUploadProvider: () => FileUploadProvider,
  MultipleImageUploader: () => MultipleImageUploader,
  SingleImageUploader: () => SingleImageUploader,
  useFileUpload: () => useFileUpload,
  useFileUploadActions: () => useFileUploadActions
});
module.exports = __toCommonJS(src_exports);

// src/components/MultipleImageUploader.tsx
var import_react3 = require("react");

// src/hooks/useFileUpload.ts
var import_react2 = require("react");
var import_sonner = require("sonner");

// src/providers/FileUploadProvider.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var FileUploadContext = (0, import_react.createContext)(void 0);
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUploadContext.Provider, { value, children });
};
var useFileUploadActions = () => {
  const context = (0, import_react.useContext)(FileUploadContext);
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
  const [isUploading, setIsUploading] = (0, import_react2.useState)(false);
  const [isDeleting, setIsDeleting] = (0, import_react2.useState)(false);
  const validateFile = (0, import_react2.useCallback)(
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
  const uploadFile = (0, import_react2.useCallback)(
    async (file) => {
      const validationError = validateFile(file);
      if (validationError) {
        import_sonner.toast.error(validationError);
        throw new Error(validationError);
      }
      setIsUploading(true);
      const loadingToast = import_sonner.toast.loading(`Uploading ${file.name}...`);
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
        import_sonner.toast.success(successMessage, { id: loadingToast });
        return storageId;
      } catch (error) {
        setIsUploading(false);
        const message = error instanceof Error ? error.message : errorMessage;
        import_sonner.toast.error(message, { id: loadingToast });
        throw error;
      }
    },
    [validateFile, generateUploadUrl, saveFile, successMessage, errorMessage]
  );
  const uploadMultipleFiles = (0, import_react2.useCallback)(
    async (files) => {
      const loadingToast = import_sonner.toast.loading(`Uploading ${files.length} files...`);
      try {
        const storageIds = await Promise.all(files.map(uploadFile));
        import_sonner.toast.success(`Successfully uploaded ${files.length} files!`, {
          id: loadingToast
        });
        return storageIds;
      } catch (error) {
        import_sonner.toast.error("Some files failed to upload.", { id: loadingToast });
        throw error;
      }
    },
    [uploadFile]
  );
  const deleteFile = (0, import_react2.useCallback)(
    async (args) => {
      setIsDeleting(true);
      const loadingToast = import_sonner.toast.loading("Deleting file...");
      try {
        await providedDeleteFile(args);
        import_sonner.toast.success(deleteSuccessMessage, { id: loadingToast });
      } catch (error) {
        const message = error instanceof Error ? error.message : deleteErrorMessage;
        import_sonner.toast.error(message, { id: loadingToast });
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
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  const fileInputRef = (0, import_react3.useRef)(null);
  const [isUploading, setIsUploading] = (0, import_react3.useState)(false);
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
var import_react4 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
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
  const fileInputRef = (0, import_react4.useRef)(null);
  const [isUploading, setIsUploading] = (0, import_react4.useState)(false);
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FileUploadProvider,
  MultipleImageUploader,
  SingleImageUploader,
  useFileUpload,
  useFileUploadActions
});
