import multer from 'multer';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
    credentials: {
        type: "service_account",
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDUvhcjXm4cEzcA\nu62wKo572usyEpvRG8UewR9dNaY2KTy6l+jsH3FHWH2IscfGvt/Mm6zV5wgi5fkc\nwFBLmRAbWyBEao4vHUTsCbPuc2pKMumhYgWD2ZcnP70DqRZR5J1HMMvxa0ax85yE\n8PUNXkjk7W9T1R8sRYEai9gS3vzkW6oS6yr1W7ZpH6O7ZAcp35n85MNQ9AJBCuEY\nA4tWCxaJ1GmGwUs/h0drtPyyIDAPuX0Wfi/NZHEZF/ieWIZGwNf6MxHAYBhHjo0J\nvRGzGiIGrBSrmUnY5zz20FA5d3VkrQWT8+erWKTpLSt02bLDl3nY7tggVNnN5lrp\nDTiJZja/AgMBAAECggEAELsKUsvAWRDhyHr6A9q07eSfjoaMHnvSmsKRVuE7OxMv\nJXWA6eDnJbc92BwzG9wy+YJcq03KBASV/L7bEbbt31jhRsAigm4I149DyULmXwN2\nAC0XRfE8w+dtU/ZePP5/p/OcdlX7b087RfE1NGHv1aEemjcuhmrI5m+NBJ7owISY\nOI7C0qLiJHTaS1K4dPnAhdT4YwPDB1TPcUSns+IoTq31leSWNdDVr0Grk2/rV+ZL\nLZPAodnapYlpNZYtBkaJC4QqTJiQYxWWlTk4ZdiaGQUYqPmd+siMxOmHYrGoyaF4\n+BZ+tZWAkt6/3EBRbPwad3wGjsX4gVLi0uPMJZAgkQKBgQDwWWNybQnXmoyuvO4/\nrUJX+4srLefPMKkJNgDL4HHs1T+jRYouyjMRRYGVXSd5OqOdoXqVRQ5wJfkFguIC\nlqw4XC5FbLcc5EoS30YtaFaXruWrWYRC5h9fFIs3ZkwSjtrdTstaM0vQGkkar06I\nfzUxdl6IfdOgZgCfSUXTqKQEBQKBgQDimIAaNsan547yNCcc1c+/ZLcpePg624qI\nzdb9a8VCspTC4m+hdHt5y6JsvZoaes2ZVEjuyvgaNl8WH/a7fqGFlmik80HRYl/p\nYv+zwtENsIamnC0ekkuDzxUZzqWzIzGxYbIZb38Ql7D34wnwfFX95naUcBztJcRY\n5BgbMv+u8wKBgGtq5+E6Dk4HypxF4A0heCcuSvKPX6zfyIxPUGfN9dytKfXknG9w\n+wXbFKEWsw+hP4KxqsGPzXYd4n+uESirAmll+WAZyHTnKpvoocqleR3tksPUDCKC\nCr9JxTaLR7B7nCGQl53Gkzl8pfOBKg4jHDjw+Cr0YWKsc9a8vrJsCnGpAoGBANDR\nLsR5lCrpht8HVsAI/fFoNC8A7uj2pr0ZzDUwWtHzVooeODd268867Mz/EYOzhcL2\nXFvLKkalsozmGe+BbAJ6sKbKEe6OlMq0U+Zp81OFSSFDLYVN1k96x/xHZoYmOcY4\nvPMZv+QflpNqZB99xZU9DCwRAWc99arhUKHIJr4nAoGBAMujxEZev+eccwlAlpoE\niHwikaISmbjhwZ7NJZulhjZmohvqZ9hAB2LkRsc3t7QjDohb5tA151qPMtNagQlf\n1x+hCWNUVgqztP2TmurTzaxQJ8bT1/Cem0Gm654S8Y7yqtuiG/qgpqk5LcMo926i\nMJCPNXweLgFY/zJOi32jyDij\n-----END PRIVATE KEY-----\n",
        client_email: "nusawarga@fifth-sunup-433003-f1.iam.gserviceaccount.com",
        client_id: process.env.CLIENT_ID,
    },
});

const bucketName = "image_blogs_nusawarga";
const bucket = storage.bucket(bucketName);

const multerStorage = multer.memoryStorage();

const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File hanya mendukung PNG, JPG, dan JPEG'), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 2 }
});

async function uploadFile(file) {
    const filename = Date.now() + '-nusawarga';
    const filePath = `${filename}`;
    const blob = bucket.file(filePath);

    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    return new Promise((resolve, reject) => {
        blobStream
            .on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
                resolve(publicUrl);
            })
            .on('error', (err) => {
                reject('Gagal upload gambar, ulangi upload gambar');
            })
            .end(file.buffer);
    });
}

const getImages = async (req, res) => {
    try {
        const [files] = await bucket.getFiles();

        const imageDetails = files.map(file => ({
            name: file.name,
            url: `https://storage.googleapis.com/${bucketName}/${file.name}`
        }));

        return res.json(imageDetails);
    } catch (error) {
        return res.status(500).json({ message: 'Gagal mendapatkan gambar', error: error.message });
    }
};


const deleteImage = async (req, res) => {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ message: 'File name is required' });

    try {
        const file = bucket.file(fileName);
        await file.delete();
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
};

const deleteImageUpdate = async (fileName) => {
    try {
        const file = bucket.file(fileName);
        await file.delete();
        console.log(`Image ${fileName} deleted successfully`);
        return { success: true, message: `Image ${fileName} deleted successfully` };
    } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, message: 'Error deleting image', error: error.message };
    }
};




export { upload, uploadFile, getImages, deleteImage, deleteImageUpdate };