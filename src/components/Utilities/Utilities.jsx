
import React, { useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useData } from '../../contexts/DataContext';
import { Card, Input, Select, Button, FormGroup } from '../common/StyledComponents';
import FeatherIcon from "../common/FeatherIconWrapper";

const UtilitiesContainer = styled.div`
    .header {
        margin-bottom: 2rem;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
`;

const getTodayDate = () => new Date().toISOString().split('T')[0];

const Utilities = () => {
  const { stores, friends, addTransaction, exportData, importData } = useData();
  const [exportedData, setExportedData] = useState('');
  const [importDataText, setImportDataText] = useState('');
  const exportTextAreaRef = useRef(null);

  // State for each form
  const [distribute, setDistribute] = useState({ friendId: '', amount: '', date: getTodayDate() });
  const [friendToMy, setFriendToMy] = useState({ friendId: '', amount: '', date: getTodayDate() });
  const [storeToMy, setStoreToMy] = useState({ storeId: '', amount: '', date: getTodayDate() });
  const [friendToStore, setFriendToStore] = useState({ friendId: '', storeId: '', amount: '', date: getTodayDate() });

  const createTxn = (date, from, to, amount, layer) => ({
    date,
    from,
    to,
    amount: parseFloat(amount),
    layer,
  });

  const handleDistribute = () => {
    if (!distribute.friendId) return alert('Please select a friend.');
    if (!distribute.amount || parseFloat(distribute.amount) <= 0) return alert('Please enter a valid amount.');
    
    const friendName = friends.find(f => f.id === distribute.friendId)?.name;
    const newTxn = createTxn(distribute.date, 'My Account', friendName, distribute.amount, 'Distribution');
    addTransaction(newTxn, null); // Personal transaction
    alert('Transaction recorded!');
    setDistribute({ friendId: '', amount: '' });
  };

  const handleFriendToMy = () => {
    if (!friendToMy.friendId) return alert('Please select a friend.');
    if (!friendToMy.amount || parseFloat(friendToMy.amount) <= 0) return alert('Please enter a valid amount.');

    const friendName = friends.find(f => f.id === friendToMy.friendId)?.name;
    const newTxn = createTxn(friendToMy.date, friendName, 'My Account', friendToMy.amount, 'FriendToPersonal');
    addTransaction(newTxn, null); // Personal transaction
    alert('Transaction recorded!');
    setFriendToMy({ friendId: '', amount: '' });
  };

  const handleStoreToMy = () => {
    if (!storeToMy.storeId) return alert('Please select a store.');
    if (!storeToMy.amount || parseFloat(storeToMy.amount) <= 0) return alert('Please enter a valid amount.');

    const storeName = stores.find(s => s.id === storeToMy.storeId)?.name;
    const newTxn = createTxn(storeToMy.date, storeName, 'My Account', storeToMy.amount, 'StoreToPersonal');
    addTransaction(newTxn, storeToMy.storeId);
    alert('Transaction recorded!');
    setStoreToMy({ storeId: '', amount: '' });
  };

  const handleFriendToStore = () => {
    if (!friendToStore.friendId) return alert('Please select a friend.');
    if (!friendToStore.storeId) return alert('Please select a store.');
    if (!friendToStore.amount || parseFloat(friendToStore.amount) <= 0) return alert('Please enter a valid amount.');

    const friendName = friends.find(f => f.id === friendToStore.friendId)?.name;
    const storeName = stores.find(s => s.id === friendToStore.storeId)?.name;
    const newTxn = createTxn(friendToStore.date, friendName, storeName, friendToStore.amount, 'Return');
    addTransaction(newTxn, friendToStore.storeId);
    alert('Transaction recorded!');
    setFriendToStore({ friendId: '', storeId: '', amount: '' });
  };

  const handleExport = () => {
    const data = exportData();
    setExportedData(data);
    if (exportTextAreaRef.current) {
      exportTextAreaRef.current.select();
      document.execCommand('copy');
      alert('Data copied to clipboard!');
    }
  };

  const handleImport = () => {
    if (window.confirm('Are you sure you want to import data? This will overwrite your current data.')) {
      importData(importDataText);
      setImportDataText('');
    }
  };

  return (
    <UtilitiesContainer>
        <div className="header">
            <h1>Utilities</h1>
        </div>
        <div className="grid">
            <Card>
                <h3>Distribute to Friends</h3>
                <FormGroup>
                    <label>Date</label>
                    <Input type="date" value={distribute.date} onChange={(e) => setDistribute({...distribute, date: e.target.value})} />
                </FormGroup>
                <FormGroup>
                    <label>Friend</label>
                    <Select value={distribute.friendId} onChange={(e) => setDistribute({...distribute, friendId: e.target.value})}>
                        <option value="">Select Friend</option>
                        {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </Select>
                </FormGroup>
                <FormGroup>
                    <label>Amount</label>
                    <Input type="number" value={distribute.amount} onChange={(e) => setDistribute({...distribute, amount: e.target.value})} placeholder="Amount" />
                </FormGroup>
                <Button onClick={handleDistribute}><FeatherIcon name="Send" size={18} style={{marginRight: '0.5rem'}} />Distribute</Button>
            </Card>
            <Card>
                <h3>Friend → My Account</h3>
                <FormGroup>
                    <label>Date</label>
                    <Input type="date" value={friendToMy.date} onChange={(e) => setFriendToMy({...friendToMy, date: e.target.value})} />
                </FormGroup>
                <FormGroup>
                    <label>Friend</label>
                    <Select value={friendToMy.friendId} onChange={(e) => setFriendToMy({...friendToMy, friendId: e.target.value})}>
                        <option value="">Select Friend</option>
                        {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </Select>
                </FormGroup>
                <FormGroup>
                    <label>Amount</label>
                    <Input type="number" value={friendToMy.amount} onChange={(e) => setFriendToMy({...friendToMy, amount: e.target.value})} placeholder="Amount" />
                </FormGroup>
                <Button onClick={handleFriendToMy}><FeatherIcon name="Download" size={18} style={{marginRight: '0.5rem'}} />Record Transaction</Button>
            </Card>
            <Card>
                <h3>Store → My Account</h3>
                <FormGroup>
                    <label>Date</label>
                    <Input type="date" value={storeToMy.date} onChange={(e) => setStoreToMy({...storeToMy, date: e.target.value})} />
                </FormGroup>
                <FormGroup>
                    <label>Store</label>
                    <Select value={storeToMy.storeId} onChange={(e) => setStoreToMy({...storeToMy, storeId: e.target.value})}>
                        <option value="">Select Store</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </FormGroup>
                <FormGroup>
                    <label>Amount</label>
                    <Input type="number" value={storeToMy.amount} onChange={(e) => setStoreToMy({...storeToMy, amount: e.target.value})} placeholder="Amount" />
                </FormGroup>
                <Button onClick={handleStoreToMy}><FeatherIcon name="Download" size={18} style={{marginRight: '0.5rem'}} />Record Transaction</Button>
            </Card>
            <Card>
                <h3>Friend → Store</h3>
                <FormGroup>
                    <label>Date</label>
                    <Input type="date" value={friendToStore.date} onChange={(e) => setFriendToStore({...friendToStore, date: e.target.value})} />
                </FormGroup>
                <FormGroup>
                    <label>Friend</label>
                    <Select value={friendToStore.friendId} onChange={(e) => setFriendToStore({...friendToStore, friendId: e.target.value})}>
                        <option value="">Select Friend</option>
                        {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </Select>
                </FormGroup>
                <FormGroup>
                    <label>Store</label>
                    <Select value={friendToStore.storeId} onChange={(e) => setFriendToStore({...friendToStore, storeId: e.target.value})}>
                        <option value="">Select Store</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </FormGroup>
                <FormGroup>
                    <label>Amount</label>
                    <Input type="number" value={friendToStore.amount} onChange={(e) => setFriendToStore({...friendToStore, amount: e.target.value})} placeholder="Amount" />
                </FormGroup>
                <Button onClick={handleFriendToStore}><FeatherIcon name="Upload" size={18} style={{marginRight: '0.5rem'}} />Record Return</Button>
            </Card>
            <Card>
                <h3>Export Data</h3>
                <Button onClick={handleExport}><FeatherIcon name="UploadCloud" size={18} style={{marginRight: '0.5rem'}} />Export All Data</Button>
                {exportedData && (
                    <FormGroup>
                        <label>Copy this data:</label>
                        <textarea
                            ref={exportTextAreaRef}
                            value={exportedData}
                            readOnly
                            rows="10"
                            style={{ width: '100%', backgroundColor: 'var(--input-background)', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '0.5rem' }}
                        />
                    </FormGroup>
                )}
            </Card>
            <Card>
                <h3>Import Data</h3>
                <FormGroup>
                    <label>Paste data here:</label>
                    <textarea
                        value={importDataText}
                        onChange={(e) => setImportDataText(e.target.value)}
                        rows="10"
                        placeholder="Paste your exported JSON data here..."
                        style={{ width: '100%', backgroundColor: 'var(--input-background)', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '0.5rem' }}
                    />
                </FormGroup>
                <Button onClick={handleImport}><FeatherIcon name="DownloadCloud" size={18} style={{marginRight: '0.5rem'}} />Import Data</Button>
            </Card>
        </div>
    </UtilitiesContainer>
  );
};

export default Utilities;
