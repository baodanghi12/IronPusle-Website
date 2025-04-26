import React, { useEffect, useState } from 'react';
import { Card, Divider, Spin, Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { VND } from '../utils/handleCurrency';
import ProfitRevenueChart from '../components/ProfitRevenueChart';
import axios from 'axios';
import * as XLSX from 'xlsx'; // 👉 import thêm thư viện xuất Excel

const ReportScreen = () => {
  const [totalProfitDatas, setTotalProfitDatas] = useState({
    bills: 0,
    orders: 0,
    revenue: 0,
    totalCost: 0,
    profitMOM: 0,
    profitYOY: 0,
  });
  const [bestCategories, setBestCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTotalProfit = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/statistics/orders');
      const data = res.data;

      setTotalProfitDatas({
        bills: data.totalBills || 0,
        orders: data.totalOrders || 0,
        revenue: data.revenue || 0,
        totalCost: data.totalCost || 0,
        profitMOM: data.profitMOM || 0,
        profitYOY: data.profitYOY || 0,
      });
      setBestCategories(data.bestSellingCategories || []);
      console.log('Best Categories:', data.bestSellingCategories);
    } catch (error) {
      console.error('Error loading profit data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Tự động fetch khi mở trang
  useEffect(() => {
    getTotalProfit();
  }, []);

  // 🆕 Hàm xuất file Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        'Total Bills': totalProfitDatas.bills,
        'Total Orders': totalProfitDatas.orders,
        'Revenue': totalProfitDatas.revenue,
        'Total Cost': totalProfitDatas.totalCost,
        'Profit MOM': totalProfitDatas.profitMOM,
        'Profit YOY': totalProfitDatas.profitYOY,
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'report.xlsx');
  };

  const CustomStatistic = ({ title, value }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: 'gray' }}>{title}</div>
    </div>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
        <Button type="primary" onClick={exportToExcel}>
          📤 Xuất Excel
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <Card title="Overviews" style={{ flex: 1, minWidth: '500px' }}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <Spin />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <CustomStatistic
                  title="Profit"
                  value={VND.format(totalProfitDatas.revenue - totalProfitDatas.totalCost)}
                />
                <CustomStatistic
                  title="Revenue"
                  value={VND.format(totalProfitDatas.revenue)}
                />
                <CustomStatistic
                  title="Total Cost"
                  value={VND.format(totalProfitDatas.totalCost)}
                />
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <CustomStatistic
                  title="Total Bills"
                  value={totalProfitDatas.bills.toLocaleString()}
                />
                <CustomStatistic
                  title="Total Orders"
                  value={totalProfitDatas.orders.toLocaleString()}
                />
                <CustomStatistic
                  title="Profit MOM"
                  value={VND.format(totalProfitDatas.profitMOM)}
                />
                <CustomStatistic
                  title="Profit YOY"
                  value={VND.format(totalProfitDatas.profitYOY)}
                />
              </div>
            </>
          )}
        </Card>

        <Card
          title="Best selling categories"
          extra={<Link to="#">See all</Link>}
          style={{ flex: 1, minWidth: '500px' }}
          
        >
            <Table
    dataSource={bestCategories}
    rowKey="title"
    pagination={{ pageSize: 5, hideOnSinglePage: true }}
    columns={[
      {
        key: 'title',
        title: 'Product',
        dataIndex: 'title',
        render: (categories) => <strong>{categories}</strong>,
      },
      {
        key: 'turnOver',
        title: 'Turn Over',
        dataIndex: 'turnOver',
        render: (turnOver) => VND.format(turnOver),
      },
      {
        key: 'increaseBy',
        title: 'Increase By',
        dataIndex: 'increaseBy',
        render: (increaseBy) => `${increaseBy}%`,
      },
    ]}
  />
        </Card>
      </div>

      <ProfitRevenueChart />

      <Table
        dataSource={[]}
        columns={[]}
        pagination={false}
        style={{ marginTop: '2rem' }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>Best selling product</span>
            <a href="#">See All</a>
          </div>
        )}
      />
    </div>
  );
};

export default ReportScreen;
