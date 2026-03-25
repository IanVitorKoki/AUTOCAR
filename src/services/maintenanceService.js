import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { serializeCollection, serializeDoc } from '../lib/firestore';
import { deleteFilesByPaths, uploadMaintenanceFiles } from './storageService';
import { sortByDate } from '../utils/formatters';
import { db } from '../firebase';

function getReminderMileage(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

function getMaintenancePayload(values, userId, vehicleId, attachments = []) {
  return {
    userId,
    vehicleId,
    type: values.type,
    description: values.description.trim(),
    date: values.date,
    cost: Number(values.cost),
    mileage: Number(values.mileage),
    notes: values.notes?.trim() ?? '',
    reminderLabel: values.reminderLabel?.trim() ?? '',
    nextReminderDate: values.nextReminderDate ?? '',
    nextReminderMileage: getReminderMileage(values.nextReminderMileage),
    attachments,
  };
}

export async function getMaintenancesByUser(userId) {
  const snapshot = await getDocs(query(collection(db, 'maintenances'), where('userId', '==', userId)));

  return sortByDate(
    serializeCollection(snapshot).map((maintenance) => ({
      ...maintenance,
      attachments: Array.isArray(maintenance.attachments) ? maintenance.attachments : [],
      reminderLabel: maintenance.reminderLabel ?? '',
      nextReminderDate: maintenance.nextReminderDate ?? '',
      nextReminderMileage:
        maintenance.nextReminderMileage === undefined ? null : maintenance.nextReminderMileage,
    })),
  );
}

export async function getMaintenancesByVehicle({ userId, vehicleId }) {
  const maintenances = await getMaintenancesByUser(userId);
  return maintenances.filter((item) => item.vehicleId === vehicleId);
}

export async function getMaintenanceById({ maintenanceId, userId }) {
  const snapshot = await getDoc(doc(db, 'maintenances', maintenanceId));

  if (!snapshot.exists()) {
    throw new Error('Manutencao nao encontrada.');
  }

  const maintenance = serializeDoc(snapshot);

  if (maintenance.userId !== userId) {
    throw new Error('Voce nao tem permissao para acessar esta manutencao.');
  }

  return {
    ...maintenance,
    attachments: Array.isArray(maintenance.attachments) ? maintenance.attachments : [],
    reminderLabel: maintenance.reminderLabel ?? '',
    nextReminderDate: maintenance.nextReminderDate ?? '',
    nextReminderMileage:
      maintenance.nextReminderMileage === undefined ? null : maintenance.nextReminderMileage,
  };
}

export async function createMaintenance(values, userId, vehicleId, newFiles = []) {
  const maintenanceRef = doc(collection(db, 'maintenances'));
  let uploadedAttachments = [];

  try {
    if (newFiles.length) {
      uploadedAttachments = await uploadMaintenanceFiles({
        userId,
        vehicleId,
        maintenanceId: maintenanceRef.id,
        files: newFiles,
      });
    }

    const payload = {
      id: maintenanceRef.id,
      ...getMaintenancePayload(values, userId, vehicleId, uploadedAttachments),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(maintenanceRef, payload);
    return maintenanceRef.id;
  } catch (error) {
    if (uploadedAttachments.length) {
      await deleteFilesByPaths(uploadedAttachments.map((attachment) => attachment.path));
    }

    throw error;
  }
}

export async function updateMaintenance(
  maintenanceId,
  values,
  userId,
  vehicleId,
  { newFiles = [], removedAttachmentPaths = [] } = {},
) {
  const maintenanceRef = doc(db, 'maintenances', maintenanceId);
  const snapshot = await getDoc(maintenanceRef);

  if (!snapshot.exists() || snapshot.data().userId !== userId) {
    throw new Error('Manutencao nao encontrada.');
  }

  const currentAttachments = Array.isArray(snapshot.data().attachments) ? snapshot.data().attachments : [];

  if (removedAttachmentPaths.length) {
    await deleteFilesByPaths(removedAttachmentPaths);
  }

  const keptAttachments = currentAttachments.filter(
    (attachment) => !removedAttachmentPaths.includes(attachment.path),
  );

  const uploadedAttachments = newFiles.length
    ? await uploadMaintenanceFiles({
        userId,
        vehicleId,
        maintenanceId,
        files: newFiles,
      })
    : [];

  await setDoc(
    maintenanceRef,
    {
      ...snapshot.data(),
      ...getMaintenancePayload(values, userId, vehicleId, [...keptAttachments, ...uploadedAttachments]),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return maintenanceId;
}

export async function deleteMaintenance(maintenanceId, userId) {
  const maintenanceRef = doc(db, 'maintenances', maintenanceId);
  const snapshot = await getDoc(maintenanceRef);

  if (!snapshot.exists() || snapshot.data().userId !== userId) {
    throw new Error('Manutencao nao encontrada.');
  }

  const attachments = Array.isArray(snapshot.data().attachments) ? snapshot.data().attachments : [];

  if (attachments.length) {
    await deleteFilesByPaths(attachments.map((attachment) => attachment.path));
  }

  await deleteDoc(maintenanceRef);
}
