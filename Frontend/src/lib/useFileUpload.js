import { useState, useCallback } from 'react';
import axios from 'axios';

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const uploadSingleFile = useCallback(async (url, formData, headers = {}) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
            setUploadStatus(`Uploading: ${percent}%`);
          }
        }
      });
      
      setUploadStatus('Upload complete');
      return response;
    } catch (error) {
      setUploadStatus('Upload failed');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);
  
  const uploadMultipleFiles = useCallback(async (
    url, 
    files, 
    prepareFormData,
    headers = {},
    onFileComplete = () => {}
  ) => {
    if (!files.length) return [];
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const results = [];
    const totalFiles = files.length;
    let completedFiles = 0;
    
    const updateTotalProgress = (currentFileProgress) => {
      const progress = ((completedFiles * 100) + currentFileProgress) / totalFiles;
      setUploadProgress(Math.round(progress));
    };
    
    try {
      for (const [index, file] of files.entries()) {
        setUploadStatus(`Uploading file ${index + 1} of ${totalFiles}: ${file.name}`);
        
        const formData = prepareFormData(file, index);
        
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...headers
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              updateTotalProgress(fileProgress);
            }
          }
        });
        
        results.push(response);
        completedFiles++;
        updateTotalProgress(0);
        onFileComplete(file, response, index);
      }
      
      setUploadStatus('All uploads complete');
      return results;
    } catch (error) {
      setUploadStatus('Upload failed');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);
  
  return {
    uploadProgress,
    isUploading,
    uploadStatus,
    uploadSingleFile,
    uploadMultipleFiles,
    setUploadStatus
  };
};
