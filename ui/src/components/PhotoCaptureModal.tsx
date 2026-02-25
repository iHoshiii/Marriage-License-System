"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, Loader2, Upload, Paperclip } from "lucide-react";
import { uploadApplicationPhoto } from "@/app/dashboard/admin/applications/actions";

interface PhotoCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicationCode?: string;
    onSuccess?: (result: any) => void;
}

export default function PhotoCaptureModal({
    isOpen,
    onClose,
    applicationCode: initialApplicationCode = "",
    onSuccess
}: PhotoCaptureModalProps) {
    const [applicationCode, setApplicationCode] = useState(initialApplicationCode);
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoMessage, setPhotoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Camera refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Update application code when prop changes
    useEffect(() => {
        setApplicationCode(initialApplicationCode);
    }, [initialApplicationCode]);

    // Camera setup effect
    useEffect(() => {
        if (showCamera && !capturedImage) {
            const startCamera = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' },
                        audio: false
                    });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (error) {
                    console.error('Error accessing camera:', error);
                    setPhotoMessage({ type: 'error', text: 'Unable to access camera' });
                }
            };

            startCamera();
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [showCamera, capturedImage]);

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Compress by resizing to max 800px width/height while maintaining aspect ratio
        const maxSize = 800;
        let { videoWidth: width, videoHeight: height } = video;

        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);

        // Use lower quality for better compression
        const imageData = canvas.toDataURL('image/jpeg', 0.6);
        setCapturedImage(imageData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setCapturedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!capturedImage) return;

        setUploadingPhoto(true);
        setPhotoMessage(null);

        try {
            // Convert base64 to blob/file
            const response = await fetch(capturedImage);
            const blob = await response.blob();

            // Get proper extension from mime type
            const mimeType = blob.type;
            const extension = mimeType.split('/')[1] || 'jpg';
            const file = new File([blob], `photo.${extension}`, { type: mimeType });

            const formData = new FormData();
            formData.append('applicationCode', applicationCode);
            formData.append('photoType', 'groom'); // Default photo type
            formData.append('photo', file);

            const result = await uploadApplicationPhoto(formData);

            if (result.success) {
                const successMessage = `Success! Application ${result.applicationCode} for ${result.groomName} and ${result.brideName} is now approved. The couple has visited the office, shown their documents physically, and provided the required photo.`;
                setPhotoMessage({ type: 'success', text: successMessage });

                // Call onSuccess callback if provided
                if (onSuccess) {
                    onSuccess(result);
                }

                setTimeout(() => {
                    handleClose();
                }, 5000); // Show longer for detailed message
            } else {
                setPhotoMessage({ type: 'error', text: result.error || 'Upload failed' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setPhotoMessage({ type: 'error', text: 'An error occurred during upload' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleClose = () => {
        setShowCamera(false);
        setCapturedImage(null);
        setPhotoMessage(null);
        setApplicationCode(initialApplicationCode); // Reset to initial value
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Photo Capture</h3>
                    <button
                        onClick={handleClose}
                        className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all"
                    >
                        <X className="h-4 w-4 text-zinc-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {capturedImage ? (
                        <>
                            <div className="relative">
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full h-64 bg-zinc-100 rounded-2xl object-cover"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setCapturedImage(null);
                                        // If we were in camera mode, stay there. 
                                        // If we weren't (file upload), this takes us back to initial selection.
                                    }}
                                    className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-2xl font-bold text-sm transition-all"
                                >
                                    Retake / Clear
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploadingPhoto}
                                    className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploadingPhoto ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Upload Photo
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : showCamera ? (
                        <>
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-64 bg-zinc-100 rounded-2xl object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <button
                                onClick={handleCapture}
                                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/20"
                            >
                                Capture Photo
                            </button>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Application Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter application code (e.g., ABC123)"
                                    className="w-full h-12 bg-white border border-zinc-100 rounded-2xl px-4 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                                    value={applicationCode}
                                    onChange={(e) => setApplicationCode(e.target.value.toUpperCase())}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowCamera(true)}
                                    disabled={!applicationCode.trim()}
                                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Camera className="h-4 w-4" />
                                    Open Camera
                                </button>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={!applicationCode.trim()}
                                        className="w-full h-12 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400 text-zinc-900 rounded-2xl font-bold text-sm transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        Upload File
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {photoMessage && (
                        <div className={`p-4 rounded-2xl text-sm font-bold ${photoMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {photoMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}