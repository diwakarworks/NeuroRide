"use client"

import React, { useState, useEffect } from 'react';
import { Camera, Home } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const EditProfilePage = ({ onCancel }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profilePicture: '',
    });
    const [preview, setPreview] = useState('');

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                // Replace with your API call to get user data
                const response = await fetch(`${API_URL}/api/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                // Check content type to ensure we're getting JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response. Please try again later.');
                }

                if (!response.ok) throw new Error('Failed to fetch user data');

                const userData = await response.json();
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    profilePicture: userData.profilePicture || '',
                });

                if (userData.profilePicture) {
                    setPreview(userData.profilePicture);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setMessage({ type: 'error', text: error.message || 'Error fetching profile' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            setFormData({ ...formData, profilePicture: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setMessage({ type: '', text: '' });

            // Replace with your API call to update profile
            const response = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });

            // Check content type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response. The API endpoint might be incorrect or the server might be experiencing issues.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update local storage with new user data if needed
            localStorage.setItem('user', JSON.stringify(data));

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Optional: Call a callback function if you want to redirect after success
            // if (onSuccess) setTimeout(() => onSuccess(), 2000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.message || 'An unexpected error occurred. Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleHome = () => {
        window.location.href= "/";
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">Edit Your Profile</h1>
                        <p className="text-gray-600 mt-2">Update your personal information</p>
                    </div>

                    {message.text && (
                        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-32 h-32 mb-4 group">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-indigo-100 shadow-md">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Profile preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400 text-4xl">
                                                {formData.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition">
                                    <Camera size={20} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500">Click the camera icon to update your photo</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Your full name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Your phone number"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={onCancel || (() => window.history.back())}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Home
                size={34}
                color="blue"
                className="flex ml-96 -mt-10 cursor-pointer"
                onClick={handleHome}
            />
        </div>
        
    );
};

export default EditProfilePage;