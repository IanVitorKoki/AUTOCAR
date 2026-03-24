export function timestampToIso(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  return null;
}

export function serializeDoc(snapshot) {
  const data = snapshot.data();

  return {
    ...data,
    id: data.id ?? snapshot.id,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export function serializeCollection(snapshot) {
  return snapshot.docs.map((docSnapshot) => serializeDoc(docSnapshot));
}

export function normalizePlate(plate = '') {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

