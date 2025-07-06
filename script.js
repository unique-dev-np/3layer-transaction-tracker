const table = document.getElementById("transactionTable");
const overviewPanel = document.getElementById("overviewPanel");
const friendBalances = document.getElementById("friendBalances");
const distributeSelect = document.getElementById("distributeFriendSelect");
const returnSelect = document.getElementById("returnFriendSelect");

const STORAGE_KEY = "layerTransactions";
const FRIEND_KEY = "customFriends";
const BACKUPS_KEY = "backups";

const FUNDING_LAYER_NAME = "StoreToPersonal";
const DISTRIBUTION_LAYER_NAME = "Distribution";
const RETURN_LAYER_NAME = "Return";

// === Navigation ===

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


// === Friend Management ===
function getFriends() {
  return JSON.parse(localStorage.getItem(FRIEND_KEY) || "[]");
}

function saveFriend(name) {
  const friends = getFriends();
  if (!friends.includes(name)) {
    friends.push(name);
    localStorage.setItem(FRIEND_KEY, JSON.stringify(friends));
    renderAll();
  }
}

function renderFriendControls() {
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

function removeFriend(name) {
  if (
    confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)
  ) {
    let friends = getFriends().filter((f) => f !== name);
    localStorage.setItem(FRIEND_KEY, JSON.stringify(friends));
    renderAll();
  }
}

// === Transactions ===
function getTransactions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveTransaction(txn) {
  const txns = getTransactions();
  txns.push(txn);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
}

function deleteTransaction(index) {
  if (
    confirm(
      `Are you sure you want to delete this transaction? This action cannot be undone.`
    )
  ) {
    const txns = getTransactions();
    txns.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
    renderAll();
  }
}

function createTransaction(date, from, to, amount, note = "", layer) {
  return {
    date,
    from,
    to,
    amount,
    note,
    layer,
  };
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// === Backups ===

function addBackup() {
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

  renderBackups();
}

function getBackups() {
  return JSON.parse(localStorage.getItem(BACKUPS_KEY)) || [];
}

function removeBackup(index) {
  let backups = getBackups();
  backups.splice(parseInt(index), 1);

  localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
  renderBackups();
}

function copyBackup(index) {
  const backups = getBackups();

  const backup = backups.splice(index, 1);

  navigator.clipboard.writeText(
    JSON.stringify({ ...backup[0], type: "backup" })
  );
}

function renderBackups() {
  const backups = getBackups();

  const backupContainer = document.querySelector("#backupContainer");

  backupContainer.innerHTML = "";
  backups.forEach((backup, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${backup.date} <button style="margin-left:20px;" onclick="removeBackup('${index}')">🗑️</button> <button onclick="copyBackup('${index}')">Copy JSON</button> `;
    backupContainer.appendChild(li);
  });
}

// === UI Render ===
function renderOverviewPanel() {
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

  overviewPanel.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <h4>Total from Store</h4>
        <p>Rs. ${store.toFixed(2)}</p>
      </div>
      <div class="kpi-card">
        <h4>Total to Friends</h4>
        <p>Rs. ${distributed.toFixed(2)}</p>
      </div>
      <div class="kpi-card">
        <h4>Total Returned</h4>
        <p>Rs. ${returned.toFixed(2)}</p>
      </div>
      <div class="kpi-card">
        <h4>Pending Distribution</h4>
        <p>Rs. ${toBeDistributed.toFixed(2)}</p>
      </div>
      <div class="kpi-card">
        <h4>Pending Return</h4>
        <p>Rs. ${toBeReturned.toFixed(2)}</p>
      </div>
       <div class="kpi-card">
        <h4>Total Friends</h4>
        <p>${friends.length}</p>
      </div>
        <div class="kpi-card">
        <h4>Total Returns</h4>
        <p>${totalReturns}</p>
      </div>
    </div>
    <div class="card chart-container">
        <canvas id="overviewChart"></canvas>
    </div>
  `;

  const ctx = document.getElementById("overviewChart").getContext("2d");
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

function renderFriendBalances() {
  const balances = getFriendBalances(getTransactions());
  friendBalances.innerHTML = "";
  for (const [friend, data] of Object.entries(balances)) {
    const card = document.createElement("div");
    card.className = "card friend-card";
    card.innerHTML = `
      <div>
        <h4>${friend}</h4>
        <p>Balance: Rs. ${data.balance.toFixed(2)}</p>
        <p>Transactions: ${data.count}</p>
      </div>
      <div class="actions">
        <button onclick="removeFriend('${friend}')">Remove</button>
      </div>
    `;
    friendBalances.appendChild(card);
  }
}

function renderTransactionTable() {
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
    .forEach((txn, i) => {
      const index = txns.indexOf(txn);
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${txn.date}</td>
      <td>${txn.from}</td>
      <td>${txn.to}</td>
      <td>Rs. ${txn.amount}</td>
      <td>${txn.layer}</td>
      <td>${txn.note || ""}</td>
      <td><button onclick="deleteTransaction(${index})">🗑️</button></td>
    `;
      table.appendChild(row);
    });
}

function renderAll() {
  renderFriendControls();
  renderOverviewPanel();
  renderFriendBalances();
  renderTransactionTable();
  renderBackups();
}

// === Event Listeners ===
document.getElementById("addFriendBtn").onclick = () => {
  const name = document.getElementById("newFriendInput").value.trim();
  if (name) {
    saveFriend(name);
    document.getElementById("newFriendInput").value = "";
  }
};

document.getElementById("distributeSubmitBtn").onclick = () => {
  const friend = distributeSelect.value;
  const amount = parseFloat(document.getElementById("distributeAmount").value);
  if (friend && amount > 0) {
    saveTransaction(
      createTransaction(
        today(),
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
        today(),
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

  try {
    const data = JSON.parse(pastedTxns);

    const confirmPaste = confirm(
      "Do you really want to paste new data? Everything befor will be ⚠erased⚠"
    );

    if (!confirmPaste) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.transactions));
    localStorage.setItem(FRIEND_KEY, JSON.stringify(data.friends));
    renderAll();
  } catch {
    console.log("Error");
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

