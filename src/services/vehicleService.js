import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { normalizePlate, serializeCollection, serializeDoc } from '../lib/firestore';
import { db } from './firebase';

function getVehiclePayload(values, userId) {
  return {
    userId,
    nickname: values.nickname.trim(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    year: Number(values.year),
    plate: normalizePlate(values.plate),
    currentMileage: Number(values.currentMileage),
  };
}

export async function getVehiclesByUser(userId) {
  const snapshot = await getDocs(query(collection(db, 'vehicles'), where('userId', '==', userId)));

  return serializeCollection(snapshot).sort(
    (first, second) =>
      new Date(second.updatedAt || 0).getTime() - new Date(first.updatedAt || 0).getTime(),
  );
}

export async function getVehicleById(id, userId) {
  const snapshot = await getDoc(doc(db, 'vehicles', id));

  if (!snapshot.exists()) {
    throw new Error('Veículo não encontrado.');
  }

  const vehicle = serializeDoc(snapshot);

  if (vehicle.userId !== userId) {
    throw new Error('Você não tem permissão para acessar este veículo.');
  }

  return vehicle;
}

export async function createVehicle(values, userId) {
  const vehicleRef = doc(collection(db, 'vehicles'));
  const payload = {
    id: vehicleRef.id,
    ...getVehiclePayload(values, userId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(vehicleRef, payload);
  return vehicleRef.id;
}

export async function updateVehicle(id, values, userId) {
  const vehicleRef = doc(db, 'vehicles', id);
  const snapshot = await getDoc(vehicleRef);

  if (!snapshot.exists() || snapshot.data().userId !== userId) {
    throw new Error('Veículo não encontrado.');
  }

  await setDoc(
    vehicleRef,
    {
      ...snapshot.data(),
      ...getVehiclePayload(values, userId),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return id;
}

export async function deleteVehicle(id, userId) {
  const vehicleRef = doc(db, 'vehicles', id);
  const snapshot = await getDoc(vehicleRef);

  if (!snapshot.exists() || snapshot.data().userId !== userId) {
    throw new Error('Veículo não encontrado.');
  }

  const batch = writeBatch(db);
  const maintenancesSnapshot = await getDocs(
    query(collection(db, 'maintenances'), where('userId', '==', userId)),
  );
  const expensesSnapshot = await getDocs(query(collection(db, 'expenses'), where('userId', '==', userId)));

  maintenancesSnapshot.docs
    .filter((item) => item.data().vehicleId === id)
    .forEach((item) => batch.delete(item.ref));

  expensesSnapshot.docs
    .filter((item) => item.data().vehicleId === id)
    .forEach((item) => batch.delete(item.ref));

  batch.delete(vehicleRef);
  await batch.commit();
}

