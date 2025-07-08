
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../../contexts/DataContext';
import { Input, Select, Button } from '../common/StyledComponents';

const TransactionsContainer = styled.div`
  padding: 2rem;
  .header {
    margin-bottom: 2rem;
    h1 {
      font-size: 2.5rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }
  }
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    background: var(--card-background);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--shadow-color);
    align-items: center;

    input, select {
      flex: 1;
      min-width: 150px;
    }
  }
  .table-wrapper {
    overflow-x: auto;
    background: var(--card-background);
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--shadow-color);
    padding: 1.5rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }

    thead {
      background: var(--card-background);
      th {
        color: var(--text-color-light);
        text-transform: uppercase;
        font-size: 0.9rem;
      }
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    tbody tr:hover {
      background-color: #f9f9f9; /* Light hover effect */
    }
  }
`;

const Transactions = () => {
  const { transactions, deleteTransaction, stores } = useData();
  const [filters, setFilters] = useState({ from: '', to: '', layer: '', startDate: '', endDate: '' });

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const fromMatch = (t.from || '').toLowerCase().includes(filters.from.toLowerCase());
        const toMatch = (t.to || '').toLowerCase().includes(filters.to.toLowerCase());
        const layerMatch = (t.layer || '').toLowerCase().includes(filters.layer.toLowerCase());
        const date = new Date(t.date);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;

        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;

        return fromMatch && toMatch && layerMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <TransactionsContainer>
        <div className="header">
            <h1>All Transactions ({filteredTransactions.length})</h1>
        </div>
        <div className="filters">
            <Input type="text" name="from" placeholder="Filter by From..." value={filters.from} onChange={handleFilterChange} />
            <Input type="text" name="to" placeholder="Filter by To..." value={filters.to} onChange={handleFilterChange} />
            <Input type="text" name="layer" placeholder="Filter by Layer..." value={filters.layer} onChange={handleFilterChange} />
            <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </div>
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Layer</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map(txn => (
                        <tr key={txn.id}>
                            <td>{txn.date}</td>
                            <td>{txn.from}</td>
                            <td>{txn.to}</td>
                            <td>Rs. {txn.amount.toFixed(2)}</td>
                            <td>{txn.layer}</td>
                            <td>
                                <Button className="delete" onClick={() => deleteTransaction(txn.id)} style={{width: 'auto'}}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </TransactionsContainer>
  );
};

export default Transactions;
