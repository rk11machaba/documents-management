'use client';
import React, { useState, useEffect } from 'react';
import { convertWordToPdfAdvanced, convertWordToPdfBasic, convertTextToPdf, downloadFile, detectFileType, canConvertToPdf } from '@/utils/documentConverter';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Document {
    id: string;
    name: string;
    date: string;
    image?: string;
    fileType?: string;
    size?: string;
    description?: string;
}

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isConverting, setIsConverting] = useState<string | null>(null);
    const [showConversionModal, setShowConversionModal] = useState(false);
    const [selectedDocumentForConversion, setSelectedDocumentForConversion] = useState<Document | null>(null);

    useEffect(() => {
        try {
            const storedDocuments = JSON.parse(localStorage.getItem('documents') || '[]') as Document[];
            setDocuments(storedDocuments);
        } catch (error) {
            console.error('Error parsing documents from localStorage:', error);
        }
    }, []);

    const handleViewDocument = (id: string) => {
        const document = documents.find((doc) => doc.id === id) || null;
        setSelectedDocument(document);
        setShowModal(true);
    };

    const handleDeleteDocument = (id: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            const updatedDocuments = documents.filter((document) => document.id !== id);
            setDocuments(updatedDocuments);
            localStorage.setItem('documents', JSON.stringify(updatedDocuments));
            toast.success('Document deleted successfully');
        }
    };

    const handleShowConversionModal = (document: Document) => {
        setSelectedDocumentForConversion(document);
        setShowConversionModal(true);
    };

    const handleConvertToPdf = async (document: Document, useAdvanced: boolean = true) => {
        setIsConverting(document.id);
        setShowConversionModal(false);
        
        try {
            if (!document.image) {
                toast.error('No file data available for conversion');
                return;
            }

            const base64Data = document.image.split(',')[1];
            const mimeType = document.image.split(':')[1].split(';')[0];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const file = new File([blob], document.name, { type: mimeType });
            
            const fileType = detectFileType(file);
            
            if (fileType === 'docx' || fileType === 'doc') {
                toast.info('Converting document... This may take a moment.');
                const result = useAdvanced 
                    ? await convertWordToPdfAdvanced(file)
                    : await convertWordToPdfBasic(file);
                    
                if (result.success && result.data && result.filename) {
                    downloadFile(result.data, result.filename);
                    toast.success('Document converted to PDF successfully!');
                } else {
                    toast.error(result.error || 'Conversion failed');
                }
            } else if (fileType === 'txt') {
                const text = await file.text();
                const result = convertTextToPdf(text, document.name);
                if (result.success && result.data && result.filename) {
                    downloadFile(result.data, result.filename);
                    toast.success('Text file converted to PDF successfully!');
                } else {
                    toast.error(result.error || 'Conversion failed');
                }
            } else {
                toast.error('This file type cannot be converted to PDF');
            }
        } catch (error) {
            toast.error('Error converting document: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsConverting(null);
        }
    };

    const filteredDocuments = documents.filter((document) =>
        document.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (fileType?: string) => {
        switch (fileType) {
            case 'pdf':
                return '📄';
            case 'docx':
            case 'doc':
                return '📝';
            case 'txt':
                return '📃';
            case 'image':
                return '🖼️';
            default:
                return '📎';
        }
    };

    return (
        <>
            <div className="w-full max-w-6xl mx-auto p-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-6">Document Library</h2>
                        
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-4 py-3 pr-12 text-gray-900 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setSearchQuery(e.target.value)
                                }
                            />
                            <svg className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-gray-300">No documents found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="text-left py-3 px-4 text-gray-300 font-semibold">Type</th>
                                        <th className="text-left py-3 px-4 text-gray-300 font-semibold">Name</th>
                                        <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                                        <th className="text-left py-3 px-4 text-gray-300 font-semibold">Size</th>
                                        <th className="text-center py-3 px-4 text-gray-300 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocuments.map((document) => (
                                        <tr key={document.id} className="border-b border-gray-700 hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4">
                                                <span className="text-2xl">{getFileIcon(document.fileType)}</span>
                                            </td>
                                            <td className="py-4 px-4 text-white font-medium">{document.name}</td>
                                            <td className="py-4 px-4 text-gray-300">{document.date}</td>
                                            <td className="py-4 px-4 text-gray-300">{document.size || 'N/A'}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                                                        onClick={() => handleViewDocument(document.id)}
                                                    >
                                                        View
                                                    </button>
                                                    {document.fileType && canConvertToPdf(document.fileType) && document.fileType !== 'pdf' && (
                                                        <button
                                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => handleShowConversionModal(document)}
                                                            disabled={isConverting === document.id}
                                                        >
                                                            {isConverting === document.id ? 'Converting...' : 'To PDF'}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                                                        onClick={() => handleDeleteDocument(document.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && selectedDocument && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">{selectedDocument.name}</h3>
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowModal(false)}
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            {selectedDocument.description && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-700 mb-2">Description:</h4>
                                    <p className="text-gray-600">{selectedDocument.description}</p>
                                </div>
                            )}
                            {selectedDocument.image && (
                                <div className="flex justify-center">
                                    {selectedDocument.fileType === 'image' ? (
                                        <img
                                            src={selectedDocument.image}
                                            alt="Document"
                                            className="max-w-full h-auto rounded-lg shadow-lg"
                                        />
                                    ) : (
                                        <div className="text-center py-12">
                                            <span className="text-6xl">{getFileIcon(selectedDocument.fileType)}</span>
                                            <p className="mt-4 text-gray-600">Preview not available for this file type</p>
                                            {selectedDocument.fileType && canConvertToPdf(selectedDocument.fileType) && selectedDocument.fileType !== 'pdf' && (
                                                <button
                                                    className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                                                    onClick={() => {
                                                        setShowModal(false);
                                                        handleShowConversionModal(selectedDocument);
                                                    }}
                                                >
                                                    Convert to PDF
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showConversionModal && selectedDocumentForConversion && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowConversionModal(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Conversion Quality</h3>
                            <p className="text-gray-600 mb-6">
                                Select the conversion method for &quot;{selectedDocumentForConversion.name}&quot;
                            </p>
                            
                            <div className="space-y-4">
                                <button
                                    className="w-full p-4 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors duration-200"
                                    onClick={() => handleConvertToPdf(selectedDocumentForConversion, true)}
                                    disabled={isConverting === selectedDocumentForConversion.id}
                                >
                                    <div className="font-semibold text-green-800">High Quality (Recommended)</div>
                                    <div className="text-sm text-green-600 mt-1">
                                        Preserves formatting, fonts, and layout. Takes longer but better results.
                                    </div>
                                </button>
                                
                                <button
                                    className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200"
                                    onClick={() => handleConvertToPdf(selectedDocumentForConversion, false)}
                                    disabled={isConverting === selectedDocumentForConversion.id}
                                >
                                    <div className="font-semibold text-blue-800">Fast Conversion</div>
                                    <div className="text-sm text-blue-600 mt-1">
                                        Quick conversion with basic formatting. Good for simple documents.
                                    </div>
                                </button>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    onClick={() => setShowConversionModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer position="bottom-right" theme="dark" />
        </>
    );
};

export default Documents;