// file: elios_FE/src/user/components/TopUpModal.js
import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { FiAlertCircle } from 'react-icons/fi'; // Import Alert Icon

const TopUpModal = ({ profile, onClose }) => {
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null); // Add error state

    const packages = [
        { value: 100000, label: '100K', bonus: '' },
        { value: 200000, label: '200K', bonus: '' },
        { value: 500000, label: '500K', bonus: '' },
        { value: 1000000, label: '1M', bonus: '' },
    ];

    const handleTopup = async () => {
        setError(null); // Clear previous errors
        const value = Number(amount);
        
        if (!value || value < 2000) {
            setError('Số tiền tối thiểu là 2,000 VND');
            return;
        }

        setProcessing(true);
        try {
            const payload = {
                totalAmount: value,
                description: `Nạp Token`, // Translated
                returnUrl: `${window.location.origin}/user/profile`,
                cancelUrl: `${window.location.origin}/user/profile`,
                buyerName: `${profile.firstName} ${profile.lastName}`,
                buyerEmail: profile.email || '',
                buyerPhone: profile.phone || '',
                buyerCompanyName: 'Elios Platform',
                buyerAddress: 'Vietnam',
                expiredAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                buyerNotGetInvoice: true,
                taxPercentage: 0,
                items: [
                    {
                        name: `Nạp ${value.toLocaleString()} VND`, // Translated
                        quantity: 1,
                        price: value,
                        unit: 'package',
                        taxPercentage: 0,
                    },
                ],
            };

            const { data } = await axios.post(API_ENDPOINTS.PAY_CREATE_ORDER, payload, {
                withCredentials: true,
            });

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }
        } catch (err) {
            setError('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="topup-modal-overlay" onClick={() => !processing && onClose()}>
            <div className="topup-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Nạp Token</h2>
                    <button className="btn-close" onClick={onClose} disabled={processing}>×</button>
                </div>

                <div className="modal-body">
                    {/* Error Notification inside Modal */}
                    {error && (
                        <div className="error-notification" style={{ marginBottom: '15px', padding: '10px' }}>
                            <FiAlertCircle className="error-icon" />
                            <span>{error}</span>
                        </div>
                    )}

                    <p className="current-balance">
                        Số dư hiện tại: <strong>{(profile.token || 0).toLocaleString()} Tokens</strong>
                    </p>

                    <div className="package-grid">
                        {packages.map(pkg => (
                            <button
                                key={pkg.value}
                                className={`package-btn ${amount === pkg.value ? 'selected' : ''}`}
                                onClick={() => { setAmount(pkg.value); setError(null); }}
                                disabled={processing}
                            >
                                <div className="package-price">{pkg.label}</div>
                                <div className="package-bonus">{pkg.bonus}</div>
                            </button>
                        ))}
                    </div>

                    <div className="custom-input">
                        <label>Hoặc nhập số tiền tùy chỉnh (VND)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => { setAmount(e.target.value); setError(null); }}
                            placeholder="100000"
                            min="10000"
                            step="10000"
                            disabled={processing}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={processing}>Hủy</button>
                    <button className="btn-confirm" onClick={handleTopup} disabled={processing || !amount}>
                        {processing ? 'Đang xử lý...' : 'Thanh toán ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopUpModal;