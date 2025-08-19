import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useFileUploadActions } from "../providers/FileUploadProvider";

export interface UseFileUploadConfig {
  maxSizeInMB?: number;
  allowedTypes?: string[];
  successMessage?: string;
  errorMessage?: string;
  deleteSuccessMessage?: string;
  deleteErrorMessage?: string;
}

export function useFileUpload(config: UseFileUploadConfig = {}) {
  const {
    generateUploadUrl,
    saveFile,
    deleteFile: providedDeleteFile,
  } = useFileUploadActions();

  const {
    maxSizeInMB = 10,
    allowedTypes = [],
    successMessage = "File uploaded successfully!",
    errorMessage = "Failed to upload file",
    deleteSuccessMessage = "File deleted successfully!",
    deleteErrorMessage = "Failed to delete file.",
  } = config;

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const validateFile = useCallback(
    (file: File): string | null => {
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
    async (file: File): Promise<string> => {
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
          body: file,
        });

        if (!result.ok) throw new Error(`Upload failed: ${result.statusText}`);

        const { storageId } = await result.json();

        await saveFile({
          name: file.name,
          storageId,
          type: file.type,
          size: file.size,
        });

        setIsUploading(false);
        toast.success(successMessage, { id: loadingToast });
        return storageId as string;
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
    async (files: File[]): Promise<string[]> => {
      const loadingToast = toast.loading(`Uploading ${files.length} files...`);
      try {
        const storageIds = await Promise.all(files.map(uploadFile));
        toast.success(`Successfully uploaded ${files.length} files!`, {
          id: loadingToast,
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
    async (args: { storageId: string }) => {
      setIsDeleting(true);
      const loadingToast = toast.loading("Deleting file...");
      try {
        await providedDeleteFile(args);
        toast.success(deleteSuccessMessage, { id: loadingToast });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : deleteErrorMessage;
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
    isDeleting,
  };
}
