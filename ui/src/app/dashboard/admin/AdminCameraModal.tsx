"use client";

import PhotoCaptureModal from "@/components/PhotoCaptureModal";

interface AdminCameraModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminCameraModal({ isOpen, onClose }: AdminCameraModalProps) {
    return (
        <PhotoCaptureModal
            isOpen={isOpen}
            onClose={onClose}
        />
    );
}
