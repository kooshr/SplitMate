import React, { useState, useRef } from 'react';
import ReceiptUploader from './components/ReceiptUploader';
import ReceiptTable from './components/ReceiptTable';

function App() {
  const splitSectionRef = useRef(null);

  // Move state for items and people to App
  const [items, setItems] = useState([
    { name: 'Sample Item', price: 10.00 }
  ]);
  const [people, setPeople] = useState(["John Doe"]);

  const scrollToSplitSection = () => {
    if (splitSectionRef.current) {
      splitSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // This will be called by ReceiptUploader after OCR finishes
  const handleReceiptData = (ocrItems) => {
    if (ocrItems && ocrItems.length > 0) {
      setItems(ocrItems);
    } else {
      console.log("No OCR items found or OCR returned empty list.");
    }
  };

  return (
    <>
      <div id="hero-section">
        <h1>WELCOME <span role="img" aria-label="wave">👋</span> TO <br/> SPLITMATE</h1>
        <h2>Splitting Receipts Made Easy</h2>
        <button className="scroll-down-btn" onClick={scrollToSplitSection}>
          Scroll Down <span>⬇️</span>
        </button>
      </div>

      <div id="split-section" ref={splitSectionRef}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Upload Your Receipt & Start Splitting
        </h2>
        <ReceiptUploader onDataExtracted={handleReceiptData} />
        <ReceiptTable 
          items={items} 
          setItems={setItems} 
          people={people} 
          setPeople={setPeople} 
        />
      </div>
    </>
  );
}

export default App;
