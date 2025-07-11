import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/api';
import './QRCodeDisplay.css';

const QRCodeDisplay = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/qr`);
      const data = await response.json();
      setQrData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="qr-display">
        <div className="qr-loading">Generating QR code...</div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="qr-display">
        <div className="qr-error">Failed to generate QR code</div>
      </div>
    );
  }

  return (
    <div className="qr-display">
      <div className="qr-container">
        <h3>📱 Scan to Join from Mobile</h3>
        <div className="qr-code">
          <img src={qrData.qrCode} alt="QR Code to join chat" />
        </div>
        <div className="qr-info">
          <p><strong>Or visit:</strong></p>
          <code className="url-display">{qrData.url}</code>
          <p className="qr-note">
            📡 Make sure your device is connected to the same Wi-Fi network
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
