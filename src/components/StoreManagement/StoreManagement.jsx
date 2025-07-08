
import React, { useState } from 'react';
import styled from 'styled-components';
import { useData } from '../../contexts/DataContext';
import { Card, Input, Button } from '../common/StyledComponents';
import FeatherIcon from "../common/FeatherIconWrapper";

const StoreManagementContainer = styled.div`
  padding: 2rem;
  .header {
    margin-bottom: 2rem;
    h1 {
      font-size: 2.5rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
`;

const StoreCard = styled(Card)`
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }

  h4 {
    font-size: 1.5rem;
    color: var(--heading-color);
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    button {
      width: auto;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
  }
`;

const StoreManagement = () => {
  const { stores, addStore, renameStore, removeStore } = useData();
  const [newStoreName, setNewStoreName] = useState('');

  const handleAddStore = () => {
    if (newStoreName.trim()) {
      addStore(newStoreName.trim());
      setNewStoreName('');
    }
  };

  const handleRename = (id, currentName) => {
    const newName = prompt('Enter new store name:', currentName);
    if (newName && newName.trim() !== currentName) {
      renameStore(id, newName.trim());
    }
  };

  return (
    <StoreManagementContainer>
        <div className="header">
            <h1>Store Management</h1>
        </div>
        <div className="grid">
            <Card>
                <h3>Add New Store</h3>
                <Input 
                    type="text" 
                    value={newStoreName} 
                    onChange={(e) => setNewStoreName(e.target.value)} 
                    placeholder="Enter store name"
                />
                <Button onClick={handleAddStore} style={{marginTop: '1rem'}}><FeatherIcon name="PlusCircle" size={18} style={{marginRight: '0.5rem'}} />Add Store</Button>
            </Card>
            {stores.map(store => (
                <StoreCard key={store.id}>
                    <h4>{store.name}</h4>
                    <div className="actions">
                        <Button onClick={() => handleRename(store.id, store.name)}><FeatherIcon name="Edit" size={18} style={{marginRight: '0.5rem'}} />Rename</Button>
                        <Button className="delete" onClick={() => removeStore(store.id)}><FeatherIcon name="Trash2" size={18} style={{marginRight: '0.5rem'}} />Delete</Button>
                    </div>
                </StoreCard>
            ))}
        </div>
    </StoreManagementContainer>
  );
};

export default StoreManagement;
