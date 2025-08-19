import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';

type MultipleImageUploaderRenderProps = {
    isUploading: boolean;
    imageFields: {
        id: string;
        value: string;
    }[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleImageDelete: (index: number) => Promise<void>;
    triggerFileSelect: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    maxImages: number;
    canAddMore: boolean;
    remainingSlots: number;
};
type MultipleImageUploaderProps = {
    imageFields: {
        id: string;
        value: string;
    }[];
    appendImage: (img: {
        value: string;
    }) => void;
    removeImage: (index: number) => void;
    maxImages: number;
    maxSizeInMB?: number;
    allowedTypes?: string[];
    successMessage?: string;
    errorMessage?: string;
    children: (props: MultipleImageUploaderRenderProps) => React.ReactNode;
};
declare function MultipleImageUploader({ imageFields, appendImage, removeImage, maxImages, maxSizeInMB, allowedTypes, successMessage, errorMessage, children, }: MultipleImageUploaderProps): react_jsx_runtime.JSX.Element;

type SingleImageUploaderRenderProps = {
    isUploading: boolean;
    image?: {
        id: string;
        value: string;
    } | null;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleImageDelete: () => Promise<void>;
    triggerFileSelect: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    hasImage: boolean;
};
type SingleImageUploaderProps = {
    image?: {
        id: string;
        value: string;
    } | null;
    setImage: (img: {
        value: string;
    }) => void;
    removeImage: () => void;
    maxSizeInMB?: number;
    allowedTypes?: string[];
    successMessage?: string;
    errorMessage?: string;
    children: (props: SingleImageUploaderRenderProps) => React.ReactNode;
};
declare function SingleImageUploader({ image, setImage, removeImage, maxSizeInMB, allowedTypes, successMessage, errorMessage, children, }: SingleImageUploaderProps): react_jsx_runtime.JSX.Element;

interface UseFileUploadConfig {
    maxSizeInMB?: number;
    allowedTypes?: string[];
    successMessage?: string;
    errorMessage?: string;
    deleteSuccessMessage?: string;
    deleteErrorMessage?: string;
}
declare function useFileUpload(config?: UseFileUploadConfig): {
    uploadFile: (file: File) => Promise<string>;
    uploadMultipleFiles: (files: File[]) => Promise<string[]>;
    deleteFile: (args: {
        storageId: string;
    }) => Promise<void>;
    isUploading: boolean;
    isDeleting: boolean;
};

type GenerateUploadUrlFunc = () => Promise<string>;
type SaveFileFunc = (args: {
    name: string;
    storageId: string;
    type: string;
    size: number;
}) => Promise<unknown>;
type DeleteFileFunc = (args: {
    storageId: string;
}) => Promise<unknown>;
interface FileUploadContextState {
    generateUploadUrl: GenerateUploadUrlFunc;
    saveFile: SaveFileFunc;
    deleteFile: DeleteFileFunc;
}
interface FileUploadProviderProps {
    children: ReactNode;
    generateUploadUrl: GenerateUploadUrlFunc;
    saveFile: SaveFileFunc;
    deleteFile: DeleteFileFunc;
}
declare const FileUploadProvider: ({ children, generateUploadUrl, saveFile, deleteFile, }: FileUploadProviderProps) => react_jsx_runtime.JSX.Element;
declare const useFileUploadActions: () => FileUploadContextState;

export { type DeleteFileFunc, FileUploadProvider, type GenerateUploadUrlFunc, MultipleImageUploader, type MultipleImageUploaderProps, type MultipleImageUploaderRenderProps, type SaveFileFunc, SingleImageUploader, type SingleImageUploaderProps, type SingleImageUploaderRenderProps, type UseFileUploadConfig, useFileUpload, useFileUploadActions };
