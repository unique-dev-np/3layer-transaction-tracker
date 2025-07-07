import { saveFriend, saveTransaction, createTransaction, addBackup } from './utils.js';
import { renderAll, renderTransactionTable } from './render.js';
import { DISTRIBUTION_LAYER_NAME, RETURN_LAYER_NAME } from './constants.js';

const distributeSelect = document.getElementById("distributeFriendSelect");
const returnSelect = document.getElementById("returnFriendSelect");

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".sidebar-nav a");
  const pages = document.querySelectorAll(".page");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);

      pages.forEach((page) => {
        page.classList.toggle("active", page.id === targetId);
      });

      navLinks.forEach((navLink) => {
        navLink.classList.toggle("active", navLink.getAttribute("href").substring(1) === targetId);
      });
    });
  });

  feather.replace();
  renderAll();
});

document.getElementById("addFriendBtn").onclick = () => {
  const name = document.getElementById("newFriendInput").value.trim();
  if (name) {
    if (saveFriend(name)) {
      renderAll();
    }
    document.getElementById("newFriendInput").value = "";
  }
};

document.getElementById("distributeSubmitBtn").onclick = () => {
  const friend = distributeSelect.value;
  const amount = parseFloat(document.getElementById("distributeAmount").value);
  if (friend && amount > 0) {
    saveTransaction(
      createTransaction(
        new Date().toISOString().split("T")[0],
        "Bank Account",
        friend,
        amount,
        "Manual Distribution",
        DISTRIBUTION_LAYER_NAME
      )
    );
    renderAll();

    document.getElementById("distributeAmount").value = "";
  }
};

document.getElementById("returnSubmitBtn").onclick = () => {
  const friend = returnSelect.value;
  const amount = parseFloat(document.getElementById("returnAmount").value);
  if (friend && amount > 0) {
    saveTransaction(
      createTransaction(
        new Date().toISOString().split("T")[0],
        friend,
        "Store Account",
        amount,
        "Manual Return",
        RETURN_LAYER_NAME
      )
    );
    renderAll();
    document.getElementById("returnAmount").value = "";
  }
};

document.getElementById("copyJSONBtn").onclick = () => {
  const txns = getTransactions();
  const friends = getFriends();

  navigator.clipboard.writeText(
    JSON.stringify({ transactions: txns, friends })
  );
};

document.getElementById("pasteJSONBtn").onclick = () => {
  const pastedTxns = prompt("Paste transactions");

  if (!pastedTxns) return;

  try {
    const data = JSON.parse(pastedTxns);

    if (!data.transactions || !data.friends) {
      alert("Invalid JSON format. Make sure it has 'transactions' and 'friends' arrays.");
      return;
    }

    const confirmPaste = confirm(
      "Do you really want to paste new data? Everything before will be ⚠erased⚠"
    );

    if (!confirmPaste) return;

    localStorage.setItem("layerTransactions", JSON.stringify(data.transactions));
    localStorage.setItem("customFriends", JSON.stringify(data.friends));
    renderAll();
  } catch (error) {
    alert("Invalid JSON. Please check the format and try again.");
    console.error("Error parsing JSON:", error);
  }
};

document.getElementById("filterFrom").addEventListener("input", renderTransactionTable);
document.getElementById("filterTo").addEventListener("input", renderTransactionTable);
document.getElementById("filterLayer").addEventListener("input", renderTransactionTable);
document.getElementById("filterStartDate").addEventListener("change", renderTransactionTable);
document.getElementById("filterEndDate").addEventListener("change", renderTransactionTable);

document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("filterFrom").value = "";
  document.getElementById("filterTo").value = "";
  document.getElementById("filterLayer").value = "";
  document.getElementById("filterStartDate").value = "";
  document.getElementById("filterEndDate").value = "";
  renderTransactionTable();
});

document.getElementById("addBackupBtn").onclick = () => {
  if (addBackup()) {
    renderAll();
  }
};