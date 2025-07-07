import { FRIEND_KEY, STORAGE_KEY, BACKUPS_KEY } from './constants.js';

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
    confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)
  ) {
    let friends = getFriends().filter((f) => f !== name);
    localStorage.setItem(FRIEND_KEY, JSON.stringify(friends));
    return true;
  }
  return false;
}

export function getTransactions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveTransaction(txn) {
  const txns = getTransactions();
  txns.push(txn);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
}

export function deleteTransaction(index) {
  if (
    confirm(
      `Are you sure you want to delete this transaction? This action cannot be undone.`
    )
  ) {
    const txns = getTransactions();
    txns.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
    return true;
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
  const transactions = getTransactions();
  const friends = getFriends();

  const backup = {
    transactions,
    friends,
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