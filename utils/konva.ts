export const getImageData = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    let img = new Image();
    img.onload = () => {
      // TODO: 這裡暫時用瀏覽器生成的網址來處理，後續必須使用上傳後的網址
      resolve(img);
    };
    img.onerror = () => {
      reject(createError('Failed to load image.'));
    };
    img.src = url;
  });
};
