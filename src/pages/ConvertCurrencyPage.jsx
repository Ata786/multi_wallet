import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSync, FaCheckCircle, FaExchangeAlt } from 'react-icons/fa'; // Changed Icon to FaSync or FaExchangeAlt
import { motion, AnimatePresence } from 'framer-motion';
import { NumericFormat } from 'react-number-format';
import DashboardLayout from '../components/DashboardLayout';

// Mock Data (Same as TransferMoneyPage essentially)
const WALLETS = [
    { id: 1, currency: 'USD', symbol: '$', balance: 1250.50, flag: '🇺🇸', name: 'USD Wallet' },
    { id: 2, currency: 'EUR', symbol: '€', balance: 800.00, flag: '🇪🇺', name: 'EUR Wallet' },
    { id: 3, currency: 'INR', symbol: '₹', balance: 5000.00, flag: '🇮🇳', name: 'INR Wallet' },
];

const ConvertCurrencyPage = () => {
    const navigate = useNavigate();
    const [fromWallet, setFromWallet] = useState(WALLETS[0]);
    const [toWallet, setToWallet] = useState(WALLETS[1]);
    const [amount, setAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState(0.92);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const change = (Math.random() - 0.5) * 0.01;
            setExchangeRate(prev => parseFloat((prev + change).toFixed(4)));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Ensure wallets are different
    useEffect(() => {
        if (fromWallet.id === toWallet.id) {
            const nextWallet = WALLETS.find(w => w.id !== fromWallet.id);
            if (nextWallet) setToWallet(nextWallet);
        }
    }, [fromWallet, toWallet]);

    const handleSwap = () => {
        const temp = fromWallet;
        setFromWallet(toWallet);
        setToWallet(temp);
        setAmount('');
    };

    const getReceiveAmount = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return 0;
        return (val * exchangeRate).toFixed(2);
    };

    const handleConvert = () => {
        if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromWallet.balance) return;

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setTransactionId(`CNV-${Math.floor(Math.random() * 1000000)}`);
            setShowSuccessModal(true);
        }, 2000);
    };

    return (
        <DashboardLayout>
            <Container className="py-4">
                <div className="mb-4">
                    <Link to="/dashboard" className="text-decoration-none text-muted d-inline-flex align-items-center gap-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                </div>

                <Row className="justify-content-center">
                    <Col lg={6} md={8}>
                        <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <div className="bg-info-subtle text-info rounded-circle d-inline-flex p-3 mb-3">
                                        <FaSync size={32} />
                                    </div>
                                    <h3 className="fw-bold">Convert Currency</h3>
                                    <p className="text-muted">Instant conversion between your wallets</p>
                                </div>

                                <div className="bg-light rounded-4 p-4 mb-4 position-relative">
                                    {/* From */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small text-muted fw-bold text-uppercase">From</span>
                                        <span className="small text-muted">Balance: {fromWallet.symbol}{fromWallet.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Form.Select
                                            className="border-0 bg-transparent shadow-none fw-bold fs-5 p-0 w-auto"
                                            value={fromWallet.id}
                                            onChange={e => setFromWallet(WALLETS.find(w => w.id === parseInt(e.target.value)))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {WALLETS.map(w => <option key={w.id} value={w.id}>{w.code}</option>)}
                                        </Form.Select>
                                        <div className="vr mx-2"></div>
                                        <NumericFormat
                                            className="form-control border-0 bg-transparent shadow-none fw-bold fs-3 text-end p-0"
                                            placeholder="0.00"
                                            value={amount}
                                            onValueChange={(v) => setAmount(v.value)}
                                            thousandSeparator={true}
                                        />
                                    </div>
                                    <div className="text-end text-muted small mt-1">
                                        {fromWallet.symbol}
                                    </div>

                                    {/* Switch Button */}
                                    <div className="position-absolute start-50 top-50 translate-middle z-1">
                                        <Button variant="white" className="rounded-circle shadow-sm border btn-icon" onClick={handleSwap} style={{ width: '40px', height: '40px' }}>
                                            <FaExchangeAlt className="text-primary rotate-90" style={{ transform: 'rotate(90deg)' }} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-light rounded-4 p-4 mb-4">
                                    {/* To */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small text-muted fw-bold text-uppercase">To</span>
                                        <span className="small text-muted">Balance: {toWallet.symbol}{toWallet.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <Form.Select
                                            className="border-0 bg-transparent shadow-none fw-bold fs-5 p-0 w-auto"
                                            value={toWallet.id}
                                            onChange={e => setToWallet(WALLETS.find(w => w.id === parseInt(e.target.value)))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {WALLETS.filter(w => w.id !== fromWallet.id).map(w => <option key={w.id} value={w.id}>{w.code}</option>)}
                                        </Form.Select>
                                        <div className="vr mx-2"></div>
                                        <div className="flex-grow-1 text-end fw-bold fs-3 text-success">
                                            {amount ? getReceiveAmount() : '0.00'}
                                        </div>
                                    </div>
                                    <div className="text-end text-muted small mt-1">
                                        {toWallet.symbol}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                                    <span className="text-muted small fw-bold">Exchange Rate</span>
                                    <span className="fw-mono small bg-info-subtle text-info px-2 py-1 rounded">1 {fromWallet.code} = {exchangeRate} {toWallet.code}</span>
                                </div>

                                <Button
                                    variant="primary"
                                    className="w-100 btn-gradient py-3 fw-bold fs-5"
                                    onClick={handleConvert}
                                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromWallet.balance || isProcessing}
                                >
                                    {isProcessing ? 'Converting...' : 'Convert Now'}
                                </Button>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => { }} centered backdrop="static" contentClassName="border-0 shadow-lg text-center p-4">
                <Modal.Body>
                    <div className="mb-4 text-success">
                        <FaCheckCircle size={80} />
                    </div>
                    <h3 className="fw-bold mb-2">Conversion Successful!</h3>
                    <p className="text-muted mb-4">You have successfully converted <span className="fw-bold text-dark">{fromWallet.symbol}{parseFloat(amount || 0).toLocaleString()}</span> to <span className="fw-bold text-dark">{toWallet.symbol}{getReceiveAmount()}</span>.</p>

                    <div className="bg-light p-3 rounded-3 mb-4 text-start">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Transaction ID</span>
                            <span className="fw-mono small text-dark">{transactionId}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Rate</span>
                            <span className="small text-dark">1 {fromWallet.code} = {exchangeRate} {toWallet.code}</span>
                        </div>
                    </div>

                    <Button variant="primary" className="w-100 btn-gradient" onClick={() => { setShowSuccessModal(false); navigate('/dashboard'); }}>
                        Back to Dashboard
                    </Button>
                </Modal.Body>
            </Modal>

        </DashboardLayout>
    );
};

export default ConvertCurrencyPage;
