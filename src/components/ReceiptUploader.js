import React, { useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

const ReceiptUploader = ({ onDataExtracted }) => {
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    setFileError('');

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      // Basic parsing logic
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const itemRegex = /^(.+?)\s+(\d+\.\d{2})$/;
      const parsedItems = [];

      for (const line of lines) {
        const match = line.match(itemRegex);
        if (match) {
          const itemName = match[1].trim();
          const price = parseFloat(match[2]);
          if (!isNaN(price)) {
            parsedItems.push({ name: itemName, price });
          }
        }
      }

      if (parsedItems.length === 0) {
        console.warn("No items found with given OCR logic.");
      }

      // Call onDataExtracted with the parsed items
      onDataExtracted(parsedItems);

    } catch (err) {
      console.error(err);
      setFileError('Error reading the receipt. Please try another image.');
    }

    setLoading(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="upload-area">
      <h3>Upload Your Receipt</h3>
      <p>Click the button below to choose an image of your receipt.</p>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <button className="upload-btn" onClick={handleUploadClick}>Choose File</button>
      {loading && <p>Processing OCR... Please wait.</p>}
      {fileError && <p style={{color:'red'}}>{fileError}</p>}
    </div>
  );
};

export default ReceiptUploader;
