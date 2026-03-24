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

function getExpensePayload(values, userId, vehicleId) {
  return {
    userId,
    vehicleId,
    category: values.category,
    description: values.description.trim(),
    cost: Number(values.cost),
    date: values.date,
  };
}

export async function getExpensesByUser(userId) {
  const snapshot = await getDocs(query(collection(db, 'expenses'), where('userId', '==', userId)));
  return sortByDate(serializeCollection(snapshot));
}

export async function getExpensesByVehicle({ userId, vehicleId }) {
  const expenses = await getExpensesByUser(userId);
  return expenses.filter((item) => item.vehicleId === vehicleId);
}

export async function getExpenseById({ expenseId, userId }) {
  const snapshot = await getDoc(doc(db, 'expenses', expenseId));

  if (!snapshot.exists()) {
    throw new Error('Gasto não encontrado.');
  }

  const expense = serializeDoc(snapshot);

  if (expense.userId !== userId) {
    throw new Error('Você não tem permissão para acessar este gasto.');
  }

  return expense;
}

export async function createExpense(values, userId, vehicleId) {
  const expenseRef = doc(collection(db, 'expenses'));
  const payload = {
    id: expenseRef.id,
    ...getExpensePayload(values, userId, vehicleId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(expenseRef, payload);
  return expenseRef.id;
}

export async function updateExpense(expenseId, values, userId, vehicleId) {
  const expenseRef = doc(db, 'expenses', expenseId);
  const snapshot = await getDoc(expenseRef);

  if (!snapshot.exists() || snapshot.data().userId !== userId) {
    throw new Error('Gasto não encontrado.');
  }

  await setDoc(
    expenseRef,
    {
      ...snapshot.data(),
      ...getExpensePayload(values, userId, vehicleId),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return expenseId;
}

export async function deleteExpense(expenseId, userId) {
  const expenseRef = doc(db, 'expenses', expenseId);
  const snapshot = await getDoc(expenseRef);

  if (!snapshot.exists() || snapshot.data().userId !== userId) {
    throw new Error('Gasto não encontrado.');
  }

  await deleteDoc(expenseRef);
}

