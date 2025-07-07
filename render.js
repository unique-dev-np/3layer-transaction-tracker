import { getFriends, getTransactions, getBackups, removeFriend, deleteTransaction, copyBackup } from './utils.js';
import { FUNDING_LAYER_NAME, DISTRIBUTION_LAYER_NAME, RETURN_LAYER_NAME } from './constants.js';

const table = document.getElementById("transactionTable");
const overviewPanel = document.getElementById("overviewPanel");
const friendBalances = document.getElementById("friendBalances");
const distributeSelect = document.getElementById("distributeFriendSelect");
const returnSelect = document.getElementById("returnFriendSelect");

export function renderFriendControls() {
  const friends = getFriends();
  distributeSelect.innerHTML = "";
  returnSelect.innerHTML = "";

  friends.forEach((friend) => {
    const opt1 = document.createElement("option");
    opt1.value = friend;
    opt1.textContent = friend;
    distributeSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = friend;
    opt2.textContent = friend;
    returnSelect.appendChild(opt2);
  });
}

export function renderOverviewPanel() {
  const txns = getTransactions();
  const friends = getFriends();

  let store = 0,
    distributed = 0,
    returned = 0,
    totalReturns = 0;

  txns.forEach((t) => {
    const amt = parseFloat(t.amount);
    if (t.layer === FUNDING_LAYER_NAME) store += amt;
    if (t.layer === DISTRIBUTION_LAYER_NAME) distributed += amt;
    if (t.layer === RETURN_LAYER_NAME) {
      returned += amt;
      totalReturns++;
    }
  });

  const toBeReturned = distributed - returned;
  const toBeDistributed = store - distributed;

  overviewPanel.innerHTML = "";

  const kpiGrid = document.createElement("div");
  kpiGrid.className = "kpi-grid";

  const kpiData = [
    { label: "Total from Store", value: `Rs. ${store.toFixed(2)}` },
    { label: "Total to Friends", value: `Rs. ${distributed.toFixed(2)}` },
    { label: "Total Returned", value: `Rs. ${returned.toFixed(2)}` },
    {
      label: "Pending Distribution",
      value: `Rs. ${toBeDistributed.toFixed(2)}`,
    },
    { label: "Pending Return", value: `Rs. ${toBeReturned.toFixed(2)}` },
    { label: "Total Friends", value: friends.length },
    { label: "Total Returns", value: totalReturns },
  ];

  kpiData.forEach((kpi) => {
    const card = document.createElement("div");
    card.className = "kpi-card";

    const title = document.createElement("h4");
    title.textContent = kpi.label;
    card.appendChild(title);

    const value = document.createElement("p");
    value.textContent = kpi.value;
    card.appendChild(value);

    kpiGrid.appendChild(card);
  });

  overviewPanel.appendChild(kpiGrid);

  const chartCard = document.createElement("div");
  chartCard.className = "card chart-container";
  const canvas = document.createElement("canvas");
  canvas.id = "overviewChart";
  chartCard.appendChild(canvas);
  overviewPanel.appendChild(chartCard);

  const ctx = canvas.getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["To Friends", "Returned", "To Be Distributed"],
      datasets: [
        {
          data: [distributed, returned, toBeDistributed],
          backgroundColor: ["#4f46e5", "#6366f1", "#a5b4fc"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function getFriendBalances(txns) {
  const balances = {};
  getFriends().forEach((f) => (balances[f] = { balance: 0, count: 0 }));
  txns.forEach((t) => {
    if (balances.hasOwnProperty(t.from)) {
      balances[t.from].balance -= parseFloat(t.amount);
      balances[t.from].count++;
    }
    if (balances.hasOwnProperty(t.to)) {
      balances[t.to].balance += parseFloat(t.amount);
      balances[t.to].count++;
    }
  });
  return balances;
}

export function renderFriendBalances() {
  const balances = getFriendBalances(getTransactions());
  friendBalances.innerHTML = "";
  for (const [friend, data] of Object.entries(balances)) {
    const card = document.createElement("div");
    card.className = "card friend-card";

    const content = document.createElement("div");

    const friendName = document.createElement("h4");
    friendName.textContent = friend;
    content.appendChild(friendName);

    const balanceText = document.createElement("p");
    balanceText.textContent = `Balance: Rs. ${data.balance.toFixed(2)}`;
    content.appendChild(balanceText);

    const transactionCount = document.createElement("p");
    transactionCount.textContent = `Transactions: ${data.count}`;
    content.appendChild(transactionCount);

    card.appendChild(content);

    const actions = document.createElement("div");
    actions.className = "actions";

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => removeFriend(friend);
    actions.appendChild(removeButton);

    card.appendChild(actions);

    friendBalances.appendChild(card);
  }
}

export function renderTransactionTable() {
  const txns = getTransactions();
  const fromFilter = document.getElementById("filterFrom").value.toLowerCase();
  const toFilter = document.getElementById("filterTo").value.toLowerCase();
  const layerFilter = document
    .getElementById("filterLayer")
    .value.toLowerCase();
  const startDateFilter = document.getElementById("filterStartDate").value;
  const endDateFilter = document.getElementById("filterEndDate").value;

  const filteredTxns = txns.filter((txn) => {
    const fromMatch = txn.from.toLowerCase().includes(fromFilter);
    const toMatch = txn.to.toLowerCase().includes(toFilter);
    const layerMatch = txn.layer.toLowerCase().includes(layerFilter);
    const date = new Date(txn.date);
    const startDate = startDateFilter ? new Date(startDateFilter) : null;
    const endDate = endDateFilter ? new Date(endDateFilter) : null;

    if (startDate && date < startDate) {
      return false;
    }
    if (endDate && date > endDate) {
      return false;
    }

    return fromMatch && toMatch && layerMatch;
  });

  table.innerHTML = "";
  filteredTxns
    .slice()
    .reverse()
    .forEach((txn) => {
      const index = txns.indexOf(txn);
      const row = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = txn.date;
      row.appendChild(dateCell);

      const fromCell = document.createElement("td");
      fromCell.textContent = txn.from;
      row.appendChild(fromCell);

      const toCell = document.createElement("td");
      toCell.textContent = txn.to;
      row.appendChild(toCell);

      const amountCell = document.createElement("td");
      amountCell.textContent = `Rs. ${txn.amount}`;
      row.appendChild(amountCell);

      const layerCell = document.createElement("td");
      layerCell.textContent = txn.layer;
      row.appendChild(layerCell);

      const noteCell = document.createElement("td");
      noteCell.textContent = txn.note || "";
      row.appendChild(noteCell);

      const actionCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "🗑️";
      deleteButton.onclick = () => deleteTransaction(index);
      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);

      table.appendChild(row);
    });
}

export function renderBackups() {
  const backups = getBackups();

  const backupContainer = document.querySelector("#backupContainer");

  backupContainer.innerHTML = "";
  backups.forEach((backup, index) => {
    const li = document.createElement("li");

    const dateSpan = document.createElement("span");
    dateSpan.textContent = backup.date;
    li.appendChild(dateSpan);

    const buttonContainer = document.createElement("div");

    const removeButton = document.createElement("button");
    removeButton.style.marginLeft = "20px";
    removeButton.textContent = "🗑️";
    removeButton.onclick = () => removeBackup(index);
    buttonContainer.appendChild(removeButton);

    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy JSON";
    copyButton.onclick = () => copyBackup(index);
    buttonContainer.appendChild(copyButton);

    li.appendChild(buttonContainer);

    backupContainer.appendChild(li);
  });
}

export function renderAll() {
  renderFriendControls();
  renderOverviewPanel();
  renderFriendBalances();
  renderTransactionTable();
  renderBackups();
}