import React, { useMemo } from "react";
import styled from "styled-components";
import { useData } from "../../contexts/DataContext";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card } from "../common/StyledComponents";
import FeatherIcon from "../common/FeatherIconWrapper";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardContainer = styled.div`
  padding: 2rem;
  .header {
    margin-bottom: 2rem;
    h1 {
      font-size: 2.5rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }
  }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  .chart-container {
    height: 400px;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--shadow-color);
  }
`;

const KpiCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }

  .kpi-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .kpi-icon {
    background-color: var(--primary-color-light);
    padding: 0.8rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      color: var(--primary-color);
      width: 24px;
      height: 24px;
    }
  }
  h4 {
    margin: 0;
    font-size: 1rem;
    color: var(--text-color-light);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }
  p {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-color);
    line-height: 1;
  }
`;

const Dashboard = () => {
  const { transactions, friends, stores } = useData();

  const dashboardData = useMemo(() => {
    let totalFromStore = 0; // Total from Store
    let totalToFriends = 0; // Total to Friends (Distribution)
    let totalReturnedFromFriends = 0; // Total Returned (Friend to Store)
    let myAccountInflow = 0; // Money coming into My Account
    let myAccountOutflow = 0; // Money going out of My Account
    const returnsByStoreCount = {};

    stores.forEach((store) => {
      returnsByStoreCount[store.id] = 0;
    });

    transactions.forEach((t) => {
      const amt = parseFloat(t.amount);

      // Calculate My Account Inflow and Outflow
      if (t.to === "My Account" || t.to === "Bank Account") {
        myAccountInflow += amt;
      }
      if (t.from === "My Account" || t.from === "Bank Account") {
        myAccountOutflow += amt;
      }

      // Calculate other KPIs based on transaction layer
      if (t.layer === "StoreToPersonal") {
        totalFromStore += amt;
      }
      if (t.layer === "Distribution") {
        totalToFriends += amt;
      }
      if (t.layer === "Return") {
        totalReturnedFromFriends += amt;
        if (t.storeId) {
          returnsByStoreCount[t.storeId] += 1;
        } else if (stores.length === 1) {
          // Fallback for single store if storeId is missing
          returnsByStoreCount[stores[0].id] += 1;
        }
      }
    });

    const myAccountBalance = myAccountInflow - myAccountOutflow;
    const pendingReturn = totalToFriends - totalReturnedFromFriends;

    return {
      totalFromStore,
      totalToFriends,
      totalReturnedFromFriends,
      pendingReturn,
      totalFriends: friends.length,
      myAccountBalance,
      returnsByStoreCount,
    };
  }, [transactions, friends, stores]);

  const chartData = {
    labels: ["From Store", "To Friends", "Returned", "Pending Return"],
    datasets: [
      {
        data: [
          dashboardData.totalFromStore,
          dashboardData.totalToFriends,
          dashboardData.totalReturnedFromFriends,
          dashboardData.pendingReturn,
        ],
        backgroundColor: ["#4f46e5", "#6366f1", "#a5b4fc", "#818cf8"],
      },
    ],
  };

  return (
    <DashboardContainer>
      <div className="header">
        <h1>Dashboard</h1>
      </div>
      <div className="kpi-grid">
        <KpiCard>
          <div className="kpi-content">
            <div className="kpi-icon">
              <FeatherIcon name="DollarSign" />
            </div>
            <h4>My Account Balance</h4>
          </div>
          <p>Rs. {dashboardData.myAccountBalance.toFixed(2)}</p>
        </KpiCard>
        <KpiCard>
          <div className="kpi-content">
            <div className="kpi-icon">
              <FeatherIcon name="ShoppingCart" />
            </div>
            <h4>Total from Store</h4>
          </div>
          <p>Rs. {dashboardData.totalFromStore.toFixed(2)}</p>
        </KpiCard>
        <KpiCard>
          <div className="kpi-content">
            <div className="kpi-icon">
              <FeatherIcon name="ArrowRight" />
            </div>
            <h4>Total to Friends</h4>
          </div>
          <p>Rs. {dashboardData.totalToFriends.toFixed(2)}</p>
        </KpiCard>
        <KpiCard>
          <div className="kpi-content">
            <div className="kpi-icon">
              <FeatherIcon name="ArrowLeft" />
            </div>
            <h4>Total Returned</h4>
          </div>
          <p>Rs. {dashboardData.totalReturnedFromFriends.toFixed(2)}</p>
        </KpiCard>

        <KpiCard>
          <div className="kpi-content">
            <div className="kpi-icon">
              <FeatherIcon name="Clock" />
            </div>
            <h4>Pending Return</h4>
          </div>
          <p>Rs. {dashboardData.pendingReturn.toFixed(2)}</p>
        </KpiCard>
        <KpiCard>
          <div className="kpi-content">
            <div className="kpi-icon">
              <FeatherIcon name="Users" />
            </div>
            <h4>Total Friends</h4>
          </div>
          <p>{dashboardData.totalFriends}</p>
        </KpiCard>
        {stores.map((store) => (
          <KpiCard key={store.id}>
            <div className="kpi-content">
              <div className="kpi-icon">
                <FeatherIcon name="Tag" />
              </div>
              <h4>Returns to {store.name}</h4>
            </div>
            <p>{dashboardData.returnsByStoreCount[store.id] || 0} </p>
          </KpiCard>
        ))}
      </div>
      <Card className="chart-container">
        <Doughnut
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </Card>
    </DashboardContainer>
  );
};

export default Dashboard;
