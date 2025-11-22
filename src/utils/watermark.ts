/**
 * Embed an invisible watermark into an image using steganography
 * Encodes the inscription txid into the least significant bits of pixels
 */
export const embedWatermark = (imageDataUrl: string, txid: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert txid to binary
      const message = `TROVE:${txid}`;
      const messageBits: number[] = [];
      
      for (let i = 0; i < message.length; i++) {
        const charCode = message.charCodeAt(i);
        for (let bit = 7; bit >= 0; bit--) {
          messageBits.push((charCode >> bit) & 1);
        }
      }

      // Add length header (16 bits for message length)
      const lengthBits: number[] = [];
      for (let bit = 15; bit >= 0; bit--) {
        lengthBits.push((messageBits.length >> bit) & 1);
      }

      const allBits = [...lengthBits, ...messageBits];

      // Embed bits into LSB of red channel
      for (let i = 0; i < allBits.length && i < data.length / 4; i++) {
        const pixelIndex = i * 4; // R channel of each pixel
        // Clear LSB and set new bit
        data[pixelIndex] = (data[pixelIndex] & 0xFE) | allBits[i];
      }

      ctx.putImageData(imageData, 0, 0);
      
      const watermarkedImage = canvas.toDataURL('image/png', 1.0);
      resolve(watermarkedImage);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
};

/**
 * Extract watermark from an image
 */
export const extractWatermark = (imageDataUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Extract length from first 16 bits
      let messageLength = 0;
      for (let i = 0; i < 16; i++) {
        const bit = data[i * 4] & 1;
        messageLength = (messageLength << 1) | bit;
      }

      // Extract message bits
      const messageBits: number[] = [];
      for (let i = 16; i < 16 + messageLength && i < data.length / 4; i++) {
        messageBits.push(data[i * 4] & 1);
      }

      // Convert bits to string
      let message = '';
      for (let i = 0; i < messageBits.length; i += 8) {
        let charCode = 0;
        for (let bit = 0; bit < 8 && i + bit < messageBits.length; bit++) {
          charCode = (charCode << 1) | messageBits[i + bit];
        }
        message += String.fromCharCode(charCode);
      }

      if (message.startsWith('TROVE:')) {
        const txid = message.substring(6);
        resolve(txid);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageDataUrl;
  });
};
