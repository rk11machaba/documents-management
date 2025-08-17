'use client'
import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { detectFileType } from '@/utils/documentConverter';
import 'react-toastify/dist/ReactToastify.css';

const AddDocument: React.FC = () => {
    const [documentName, setDocumentName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [image, setImage] = useState<string>('');
    const [fileType, setFileType] = useState<string>('');
    const [fileSize, setFileSize] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    const handleDocumentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentName(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (file.size > maxSize) {
                toast.error('File size must be less than 10MB');
                return;
            }

            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                const detectedType = detectFileType(file);
                setFileType(detectedType);
                setFileSize(formatFileSize(file.size));
                
                if (!documentName) {
                    setDocumentName(file.name);
                }
                setIsUploading(false);
            };
            reader.onerror = () => {
                toast.error('Error reading file');
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddDocument = () => {
        if (!documentName.trim()) {
            toast.error('Please enter a document name.');
            return;
        }
        
        if (!image) {
            toast.error('Please select a file to upload.');
            return;
        }

        try {
            const currentDate = new Date().toLocaleDateString();
            const existingDocuments: any[] = JSON.parse(
                localStorage.getItem('documents') || '[]'
            );
            
            const newDocument = {
                id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
                name: documentName,
                description,
                image,
                fileType,
                size: fileSize,
                date: currentDate,
            };
            
            const updatedDocuments = [...existingDocuments, newDocument];
            localStorage.setItem('documents', JSON.stringify(updatedDocuments));
            
            setDocumentName('');
            setDescription('');
            setImage('');
            setFileType('');
            setFileSize('');
            
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
            
            toast.success('Document added successfully!');
            
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            toast.error('An error occurred while saving the document.');
        }
    };

    const getAcceptedFileTypes = () => {
        return '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.bmp';
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Add New Document</h3>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="documentName" className="block text-sm font-medium text-gray-300 mb-2">
                            Document Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 text-gray-900 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            id="documentName"
                            placeholder="Enter document name..."
                            value={documentName}
                            onChange={handleDocumentNameChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 text-gray-900 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                            id="description"
                            rows={3}
                            placeholder="Enter document description..."
                            value={description}
                            onChange={handleDescriptionChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
                            Select File
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                className="hidden"
                                id="file-upload"
                                accept={getAcceptedFileTypes()}
                                onChange={handleImageChange}
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center w-full px-4 py-3 bg-white text-gray-700 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {isUploading ? 'Uploading...' : (image ? `File selected: ${fileType.toUpperCase()}` : 'Choose file')}
                            </label>
                        </div>
                        {fileSize && (
                            <p className="mt-2 text-sm text-gray-400">File size: {fileSize}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            Supported formats: PDF, Word (DOC, DOCX), Text (TXT), Images (PNG, JPG, GIF, BMP)
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            onClick={handleAddDocument}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Processing...' : 'Add Document'}
                        </button>
                        <button
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                            onClick={() => {
                                setDocumentName('');
                                setDescription('');
                                setImage('');
                                setFileType('');
                                setFileSize('');
                                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                                if (fileInput) {
                                    fileInput.value = '';
                                }
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" theme="dark" />
        </div>
    );
};

export default AddDocument;