import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ImagesToPDFConverter = forwardRef(({ images }, ref) => {
  const pdfRef = useRef(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const validImages = [];

      // Filter out inaccessible images
      for (let i = 0; i < images.length; i++) {
        try {
          const img = new Image();
          img.crossOrigin = 'Anonymous'; // Handle cross-origin images if possible
          img.src = images[i];

          // Wait for the image to load or fail
          await new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(`Image ${i + 1} is not accessible: ${images[i]}`);
          });

          validImages.push(images[i]); // Add to valid images if loaded successfully
        } catch (error) {
          setErrorMessages((prev) => [...prev, error]); // Log the error
        }
      }

      if (validImages.length === 0) {
        alert('No valid images to convert to PDF.');
        return;
      }

      // Render valid images and generate PDF
      const canvas = await html2canvas(pdfRef.current);
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 size: 210mm x 297mm
      pdf.save('images.pdf');
    },
  }));

  return (
    <div>
      <div ref={pdfRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`image-${index}`}
            style={{ width: '100%', marginBottom: '10px' }}
            onError={(e) => {
              e.target.style.display = 'none'; // Hide broken images
              setErrorMessages((prev) => [...prev, `Image ${index + 1} is not accessible: ${image}`]);
            }}
          />
        ))}
      </div>

      {/* Display error messages */}
      {errorMessages.length > 0 && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <h3>Errors:</h3>
          <ul>
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default ImagesToPDFConverter;
