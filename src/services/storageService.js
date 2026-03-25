import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

function sanitizeFileName(fileName = '') {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export async function uploadMaintenanceFiles({ userId, vehicleId, maintenanceId, files }) {
  const uploadedFiles = [];

  try {
    for (const file of files) {
      const safeName = sanitizeFileName(file.name) || 'arquivo';
      const filePath = `maintenance-files/${userId}/${vehicleId}/${maintenanceId}/${crypto.randomUUID()}-${safeName}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      const url = await getDownloadURL(storageRef);

      uploadedFiles.push({
        name: file.name,
        url,
        path: filePath,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }

    return uploadedFiles;
  } catch (error) {
    if (uploadedFiles.length) {
      await deleteFilesByPaths(uploadedFiles.map((file) => file.path));
    }

    throw error;
  }
}

export async function deleteFilesByPaths(paths = []) {
  const deletions = paths
    .filter(Boolean)
    .map(async (filePath) => {
      try {
        await deleteObject(ref(storage, filePath));
      } catch (error) {
        if (error?.code !== 'storage/object-not-found') {
          throw error;
        }
      }
    });

  await Promise.all(deletions);
}
