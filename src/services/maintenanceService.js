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
import { sortByDate } from '../utils/formatters';
import { db } from '../firebase';

function getMaintenancePayload(values, userId, vehicleId) {
  return {
    userId,
    vehicleId,
    type: values.type,
    description: values.description.trim(),
    date: values.date,
    cost: Number(values.cost),
    mileage: Number(values.mileage),
    notes: values.notes?.trim() ?? '',
  };
}

export async function getMaintenancesByUser(userId) {
  const snapshot = await getDocs(query(collection(db, 'maintenances'), where('userId', '==', userId)));
  return sortByDate(serializeCollection(snapshot));
}

export async function getMaintenancesByVehicle({ userId, vehicleId }) {
  const maintenances = await getMaintenancesByUser(userId);
  return maintenances.filter((item) => item.vehicleId === vehicleId);
}

export async function getMaintenanceById({ maintenanceId, userId }) {
  const snapshot = await getDoc(doc(db, 'maintenances', maintenanceId));

  if (!snapshot.exists()) {
    throw new Error('Manutenção não encontrada.');
  }

  const maintenance = serializeDoc(snapshot);

  if (maintenance.userId !== userId) {
    throw new Error('Você não tem permissão para acessar esta manutenção.');
  }

  return maintenance;
}

export async function createMaintenance(values, userId, vehicleId) {
  const maintenanceRef = doc(collection(db, 'maintenances'));
  const payload = {
    id: maintenanceRef.id,
    ...getMaintenancePayload(values, userId, vehicleId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(maintenanceRef, payload);
  return maintenanceRef.id;
}

export async function updateMaintenance(maintenanceId, values, userId, vehicleId) {
  const maintenanceRef = doc(db, 'maintenances', maintenanceId);
  const snapshot = await getDoc(maintenanceRef);

  if (!snapshot.exists() || snapshot.data().userId !== userId) {
    throw new Error('Manutenção não encontrada.');
  }

  await setDoc(
    maintenanceRef,
    {
      ...snapshot.data(),
      ...getMaintenancePayload(values, userId, vehicleId),
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
    throw new Error('Manutenção não encontrada.');
  }

  await deleteDoc(maintenanceRef);
}

