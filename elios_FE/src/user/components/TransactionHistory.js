import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { API_ENDPOINTS } from '../../api/apiConfig';
import LoadingCircle1 from '../../components/loading/LoadingCircle1';

const TransactionHistory = () => {
    const [orders, setOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            setOrderLoading(true);
            try {
                const { data } = await axios.get(API_ENDPOINTS.PAY_GET_CURRENT_ORDERS, {
                    params: { limit: 50, sortBy: 'createdAt', descending: true },
                    withCredentials: true,
                });
                setOrders(data.data || []);
            } catch (err) {
                console.error('Failed to load orders:', err);
            } finally {
                setOrderLoading(false);
            }
        };
        loadOrders();
    }, []);

    const getStatusBadge = (status) => {
        const config = {
            PAID: { color: '#0f8a57', icon: <FiCheckCircle />, text: 'Thành công' },
            PENDING: { color: '#ef4444', icon: <FiXCircle />, text: 'Đã hủy' },
            EXPIRED: { color: '#6b7280', icon: <FiAlertCircle />, text: 'Hết hạn' },
        };
        const s = config[status] || config.PENDING;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px',
                backgroundColor: s.color + '22', color: s.color,
                fontSize: '0.85rem', fontWeight: '600'
            }}>
                {s.icon} {s.text}
            </span>
        );
    };

    return (
        <div className="history-container">
            <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Lịch sử giao dịch</h2>
            {orderLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}><LoadingCircle1 /></div>
            ) : orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#BBBBBB', fontStyle: 'italic', padding: '4rem' }}>
                    Chưa có giao dịch nào.
                </p>
            ) : (
                <div className="transaction-list">
                    {orders.map(order => (
                        <div key={order.id} className="transaction-item">
                            <div className="transaction-header">
                                <div>
                                    <strong>Mã đơn #{order.orderCode || order.id.slice(0, 8)}</strong>
                                    <span style={{ marginLeft: '8px', color: '#888', fontSize: '0.9rem' }}>
                                        {new Date(order.orderDate || order.createdAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>
                            <div className="transaction-body">
                                <div>
                                    <p style={{ margin: '8px 0', color: '#BBBBBB' }}>{order.description || 'Nạp Token'}</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd700' }}>
                                        {order.totalAmount.toLocaleString()} VND
                                    </p>
                                </div>
                                {order.checkoutUrl && (
                                    <a href={order.checkoutUrl} target="_blank" rel="noopener noreferrer"
                                       style={{ color: '#4ade80', textDecoration: 'underline', fontSize: '0.9rem' }}>
                                        Xem link thanh toán
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;