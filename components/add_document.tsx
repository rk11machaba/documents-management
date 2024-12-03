'use client'
import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddDocument: React.FC = () => {
    const [documentName, setDocumentName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [image, setImage] = useState<string>('');

    const handleDocumentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentName(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddDocument = () => {
        if (!documentName.trim() || !description.trim() || !image) {
            toast.error('Please fill in all fields.');
            return;
        }

        try {
            const currentDate = new Date().toLocaleDateString();
            const existingDocuments: any[] = JSON.parse(
                localStorage.getItem('documents') || '[]'
            );
            const newDocument = {
                id: existingDocuments.length + 1,
                name: documentName,
                description,
                image,
                date: currentDate,
            };
            const updatedDocuments = [...existingDocuments, newDocument];
            localStorage.setItem('documents', JSON.stringify(updatedDocuments));
            setDocumentName('');
            setDescription('');
            setImage('');
            toast.success('Document added successfully.');
        } catch (error) {
            toast.error('An error occurred while saving the document.');
        }
    };

    return (
        <div>
            <div className="container mx-auto my-5 max-w-4xl">
                <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                    Document Name
                </label>
                <input
                    type="text"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    id="documentName"
                    value={documentName}
                    onChange={handleDocumentNameChange}
                />
                <label htmlFor="description" className="block mt-4 text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    id="description"
                    value={description}
                    onChange={handleDescriptionChange}
                />
                <label htmlFor="image" className="block mt-4 text-sm font-medium text-gray-700">
                    Select Image
                </label>
                <input
                    type="file"
                    className="block w-full mt-1"
                    id="image"
                    onChange={handleImageChange}
                />
                <button
                    className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    onClick={handleAddDocument}
                >
                    Add Document
                </button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default AddDocument;
