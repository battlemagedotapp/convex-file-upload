import React, { useRef, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";

export type SingleImageUploaderRenderProps = {
    isUploading: boolean;
    image?: { id: string; value: string } | null;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleImageDelete: () => Promise<void>;
    triggerFileSelect: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    hasImage: boolean;
};

export type SingleImageUploaderProps = {
    image?: { id: string; value: string } | null;
    setImage: (img: { value: string }) => void;
    removeImage: () => void;
    maxSizeInMB?: number;
    allowedTypes?: string[];
    successMessage?: string;
    errorMessage?: string;
    children: (props: SingleImageUploaderRenderProps) => React.ReactNode;
};

export function SingleImageUploader({
    image,
    setImage,
    removeImage,
    maxSizeInMB,
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    successMessage = "Image uploaded successfully!",
    errorMessage = "Failed to upload image",
    children,
}: SingleImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { uploadFile, deleteFile } = useFileUpload({
        maxSizeInMB,
        allowedTypes,
        successMessage,
        errorMessage,
    });

    const handleImageDelete = async () => {
        if (!image) return;
        await deleteFile({ storageId: image.value });
        removeImage();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        setIsUploading(true);
        try {
            const storageId = await uploadFile(file);
            setImage({ value: storageId });
        } finally {
            setIsUploading(false);
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const hasImage = Boolean(image);

    const renderProps: SingleImageUploaderRenderProps = {
        isUploading,
        image,
        handleFileChange,
        handleImageDelete,
        triggerFileSelect,
        fileInputRef,
        hasImage,
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            {children(renderProps)}
        </>
    );
}
