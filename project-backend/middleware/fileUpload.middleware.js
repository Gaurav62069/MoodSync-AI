import multer from 'multer';

// Hum memory storage use kar rahe hain taaki file buffer mein aaye
// aur hum usse seedha Base64 mein convert kar sakein (Profile Pic) ya Python ko bhej sakein (Audio)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // --- UPDATED FILTER ---
  // Ab yeh Audio, Video aur Images teeno ko allow karega
  if (
    file.mimetype.startsWith('audio/') ||  // Voice analysis ke liye
    file.mimetype.startsWith('video/') ||  // Future proofing
    file.mimetype.startsWith('image/') ||  // Profile Picture ke liye
    file.mimetype === 'application/octet-stream' || // Kabhi-kabhi audio blob is format mein aata hai
    file.mimetype === 'application/ogg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('File format not supported. Only Audio, Video, and Images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB limit (Audio aur Images ke liye kaafi hai)
  },
});

// Isse hum routes mein use karenge (e.g., uploadFile.single('field_name'))
export const uploadFile = upload;