import {
  FRIEND_KEY,
  STORAGE_KEY,
  BACKUPS_KEY,
  STORES_KEY,
  ACTIVE_STORE_KEY,
  MY_ACCOUNT_NAME,
  FUNDING_LAYER_NAME,
  STORE_TO_MY_LAYER_NAME,
} from "./constants.js";

export function today() {
  return new Date().toISOString().split("T")[0];
}

export function getFriends() {
  return JSON.parse(localStorage.getItem(FRIEND_KEY) || "[]");
}

export function saveFriend(name) {
  const friends = getFriends();
  if (!friends.includes(name)) {
    friends.push(name);
    localStorage.setItem(FRIEND_KEY, JSON.stringify(friends));
    return true;
  }
  return false;
}

export function removeFriend(name) {
  if (
    confirm(
      `Are you sure you want to remove ${name}? This action cannot be undone.`
    )
  ) {
    let friends = getFriends().filter((f) => f !== name);
    localStorage.setItem(FRIEND_KEY, JSON.stringify(friends));
    return true;
  }
  return false;
}

export function getTransactions(storeName = getActiveStore()) {
  const allTransactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return allTransactions[storeName] || [];
}

export function saveTransaction(txn, storeName = getActiveStore()) {
  const allTransactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (!allTransactions[storeName]) {
    allTransactions[storeName] = [];
  }
  allTransactions[storeName].push(txn);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allTransactions));
}

export function deleteTransaction(index, storeName = getActiveStore()) {
  if (
    confirm(
      `Are you sure you want to delete this transaction? This action cannot be undone.`
    )
  ) {
    const allTransactions = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );
    if (allTransactions[storeName]) {
      allTransactions[storeName].splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTransactions));
      return true;
    }
  }
  return false;
}

export function createTransaction(date, from, to, amount, note = "", layer) {
  return {
    date,
    from,
    to,
    amount,
    note,
    layer,
  };
}

export function getBackups() {
  return JSON.parse(localStorage.getItem(BACKUPS_KEY)) || [];
}

export function addBackup() {
  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const friends = getFriends();
  const stores = getStores();

  const backup = {
    transactions,
    friends,
    stores,
    date: today(),
  };

  const backups = getBackups();

  backups.push(backup);

  localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));

  return true;
}

export function removeBackup(index) {
  let backups = getBackups();
  backups.splice(parseInt(index), 1);

  localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
  return true;
}

export function copyBackup(index) {
  const backups = getBackups();

  const backup = backups.splice(index, 1);

  navigator.clipboard.writeText(
    JSON.stringify({ ...backup[0], type: "backup" })
  );
}

export function getStores() {
  return JSON.parse(localStorage.getItem(STORES_KEY) || "[]");
}

export function saveStore(storeName) {
  const stores = getStores();
  if (!stores.includes(storeName)) {
    stores.push(storeName);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    return true;
  }
  return false;
}

export function removeStore(storeName) {
  if (
    confirm(
      `Are you sure you want to remove store ${storeName}? This action cannot be undone.`
    )
  ) {
    let stores = getStores().filter((s) => s !== storeName);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    const allTransactions = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );
    delete allTransactions[storeName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTransactions));
    if (getActiveStore() === storeName) {
      setActiveStore(stores.length > 0 ? stores[0] : null);
    }
    return true;
  }
  return false;
}

export function getActiveStore() {
  return localStorage.getItem(ACTIVE_STORE_KEY);
}

export function setActiveStore(storeName) {
  localStorage.setItem(ACTIVE_STORE_KEY, storeName);
}

export function migrateData() {
  const oldTransactions = JSON.parse(
    localStorage.getItem("layerTransactions") || "[]"
  );
  if (oldTransactions.length > 0 && !localStorage.getItem(STORES_KEY)) {
    console.log("Migrating old data...");
    const defaultStoreName = "Default Store";
    saveStore(defaultStoreName);
    setActiveStore(defaultStoreName);

    const newTransactions = {};
    newTransactions[defaultStoreName] = oldTransactions.map((txn) => {
      if (txn.layer === FUNDING_LAYER_NAME) {
        txn.layer = STORE_TO_MY_LAYER_NAME;
        txn.to = MY_ACCOUNT_NAME;
      }
      return txn;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
    localStorage.removeItem("layerTransactions");
    console.log("Data migration complete.");
  }
}
