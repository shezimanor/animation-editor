// 傳入檔案產生圖片
export const getImageData = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    let img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(createError('Failed to load image.'));
    };
    img.src = url;
  });
};

// 傳入網址產生圖片
export const getImageDataByUrl = async (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(createError('Failed to load image.'));
    };
    img.src = url;
  });
};

// 檢查副檔名是否為圖片
export const isSupportedImageFile = (file: File): boolean => {
  return SUPPORTED_IMAGE_FORMATS.includes(file.type);
};
