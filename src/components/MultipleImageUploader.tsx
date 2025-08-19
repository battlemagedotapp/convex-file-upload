import React, { useRef, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";

export type MultipleImageUploaderRenderProps = {
    isUploading: boolean;
    imageFields: { id: string; value: string }[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleImageDelete: (index: number) => Promise<void>;
    triggerFileSelect: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    maxImages: number;
    canAddMore: boolean;
    remainingSlots: number;
};

export type MultipleImageUploaderProps = {
    imageFields: { id: string; value: string }[];
    appendImage: (img: { value: string }) => void;
    removeImage: (index: number) => void;
    maxImages: number;
    maxSizeInMB?: number;
    allowedTypes?: string[];
    successMessage?: string;
    errorMessage?: string;
    children: (props: MultipleImageUploaderRenderProps) => React.ReactNode;
};

export function MultipleImageUploader({
    imageFields,
    appendImage,
    removeImage,
    maxImages,
    maxSizeInMB,
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    successMessage = "Image uploaded successfully!",
    errorMessage = "Failed to upload image",
    children,
}: MultipleImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { uploadFile, uploadMultipleFiles, deleteFile } = useFileUpload({
        maxSizeInMB,
        allowedTypes,
        successMessage,
        errorMessage,
    });

    const handleImageDelete = async (index: number) => {
        await deleteFile({ storageId: imageFields[index].value });
        removeImage(index);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const filesArray = Array.from(files);
        const remaining = Math.max(0, maxImages - imageFields.length);

        if (remaining <= 0) {
            if (fileInputRef.current) fileInputRef.current.value = "";
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

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const canAddMore = imageFields.length < maxImages;
    const remainingSlots = Math.max(0, maxImages - imageFields.length);

    const renderProps: MultipleImageUploaderRenderProps = {
        isUploading,
        imageFields,
        handleFileChange,
        handleImageDelete,
        triggerFileSelect,
        fileInputRef,
        maxImages,
        canAddMore,
        remainingSlots,
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />
            {children(renderProps)}
        </>
    );
}
