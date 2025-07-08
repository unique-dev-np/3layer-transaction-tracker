
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../../contexts/DataContext';
import { Card, Input, Button } from '../common/StyledComponents';
import FeatherIcon from "../common/FeatherIconWrapper";

const FriendsContainer = styled.div`
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

const FriendCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }

  .friend-info {
    margin-bottom: 1rem;
    h4 {
      font-size: 1.5rem;
      color: var(--heading-color);
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 1rem;
      color: var(--text-color-light);
      margin-bottom: 0.25rem;
    }
  }

  .actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    button {
      width: auto;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
  }
`;

const Friends = () => {
  const { friends, addFriend, removeFriend, transactions } = useData();
  const [newFriendName, setNewFriendName] = useState('');

  const handleAddFriend = () => {
    if (newFriendName.trim()) {
      addFriend(newFriendName.trim());
      setNewFriendName('');
    }
  };

  const getFriendAnalytics = useMemo(() => {
    const analytics = {};
    friends.forEach(friend => {
      let balance = 0;
      let transactionCount = 0;

      transactions.forEach(txn => {
        if (txn.from === friend.name) {
          balance -= parseFloat(txn.amount);
          transactionCount++;
        } else if (txn.to === friend.name) {
          balance += parseFloat(txn.amount);
        }
      });
      analytics[friend.id] = { balance, transactionCount };
    });
    return analytics;
  }, [friends, transactions]);

  return (
    <FriendsContainer>
      <div className="header">
        <h1>Friends</h1>
      </div>
      <div className="grid">
        <Card>
          <h3>Add New Friend</h3>
          <Input 
            type="text" 
            value={newFriendName} 
            onChange={(e) => setNewFriendName(e.target.value)} 
            placeholder="Enter friend's name"
          />
          <Button onClick={handleAddFriend} style={{marginTop: '1rem'}}><FeatherIcon name="UserPlus" size={18} style={{marginRight: '0.5rem'}} />Add Friend</Button>
        </Card>
        {friends.map(friend => (
          <FriendCard key={friend.id}>
            <div className="friend-info">
              <h4>{friend.name}</h4>
              <p>Balance: Rs. {getFriendAnalytics[friend.id]?.balance.toFixed(2) || '0.00'}</p>
              <p>Out Transactions: {getFriendAnalytics[friend.id]?.transactionCount || 0}</p>
            </div>
            <div className="actions">
              <Button className="delete" onClick={() => removeFriend(friend.id)}><FeatherIcon name="Trash2" size={18} style={{marginRight: '0.5rem'}} />Remove</Button>
            </div>
          </FriendCard>
        ))}
      </div>
    </FriendsContainer>
  );
};

export default Friends;
