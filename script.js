// === DOM Elements ===
const table = document.getElementById("transactionTable");
const overviewPanel = document.getElementById("overviewPanel");
const friendBalances = document.getElementById("friendBalances");
const friendListEl = document.getElementById("friendList");
const distributeSelect = document.getElementById("distributeFriendSelect");
const returnSelect = document.getElementById("returnFriendSelect");

const STORAGE_KEY = "layerTransactions";
const FRIEND_KEY = "customFriends";

const FUNDING_LAYER_NAME = "StoreToPersonal";
const DISTRIBUTION_LAYER_NAME = "Distribution";
const RETURN_LAYER_NAME = "Return";

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
  friendListEl.innerHTML = "";
  distributeSelect.innerHTML = "";
  returnSelect.innerHTML = "";

  friends.forEach((friend) => {
    const li = document.createElement("li");
    li.innerHTML = `${friend} <button onclick="removeFriend('${friend}')">🗑️</button>`;
    friendListEl.appendChild(li);

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
  let friends = getFriends().filter((f) => f !== name);
  localStorage.setItem(FRIEND_KEY, JSON.stringify(friends));
  renderAll();
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
  const txns = getTransactions();
  txns.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  renderAll();
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

// === UI Render ===
function renderOverviewPanel() {
  const txns = getTransactions();

  let store = 0,
    friends = 0,
    returned = 0;

  txns.forEach((t) => {
    const amt = parseFloat(t.amount);
    if (t.layer === FUNDING_LAYER_NAME) store += amt;
    if (t.layer === DISTRIBUTION_LAYER_NAME) friends += amt;
    if (t.layer === RETURN_LAYER_NAME) returned += amt;
  });

  const toBeReturned = friends - returned;

  overviewPanel.innerHTML = `
    <h3>Overview</h3>
    <ul>
      <li><strong>Total Sent from Store:</strong> Rs. ${store.toFixed(2)}</li>
      <li><strong>Total Sent to Friends:</strong> Rs. ${friends.toFixed(2)}</li>
      <li><strong>Total Returned to Store:</strong> Rs. ${returned.toFixed(
        2
      )}</li>
      <li><strong>To Be Returned to Store:</strong> Rs. ${toBeReturned.toFixed(
        2
      )}</li>
    </ul>
    <input type="number" id="storeToBankAmount" placeholder="Amount">
    <button onclick="handleStoreToBank()">Send Store → Personal</button>
  `;
}

function handleStoreToBank() {
  const amount = parseFloat(document.getElementById("storeToBankAmount").value);
  if (amount > 0) {
    saveTransaction(
      createTransaction(
        today(),
        "Store Account",
        "Bank Account",
        amount,
        "Manual Transfer"
      )
    );
    renderAll();
  }
}

function getFriendBalances(txns) {
  const balances = {};
  getFriends().forEach((f) => (balances[f] = 0));
  txns.forEach((t) => {
    if (balances.hasOwnProperty(t.from))
      balances[t.from] -= parseFloat(t.amount);
    if (balances.hasOwnProperty(t.to)) balances[t.to] += parseFloat(t.amount);
  });
  return balances;
}

function renderFriendBalances() {
  const balances = getFriendBalances(getTransactions());
  friendBalances.innerHTML = "<h3>Friend Balances</h3>";
  const ul = document.createElement("ul");
  for (const [friend, amount] of Object.entries(balances)) {
    const li = document.createElement("li");
    li.textContent = `${friend}: Rs. ${amount.toFixed(2)}`;
    ul.appendChild(li);
  }
  friendBalances.appendChild(ul);
}

function renderTransactionTable() {
  const txns = getTransactions();
  table.innerHTML = "";
  const dailyCount = {};
  txns
    .slice()
    .reverse()
    .forEach((txn, i) => {
      const index = txns.length - 1 - i;
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
      if (txn.layer === "Friend → Store") {
        dailyCount[txn.date] = (dailyCount[txn.date] || 0) + 1;
      }
    });
}

function renderAll() {
  renderFriendControls();
  renderOverviewPanel();
  renderFriendBalances();
  renderTransactionTable();
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
  }
};

window.onload = renderAll;
