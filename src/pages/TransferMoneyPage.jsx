import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Modal, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExchangeAlt, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericFormat } from 'react-number-format';
import DashboardLayout from '../components/DashboardLayout';

// Mock Data
const WALLETS = [
    { id: 1, currency: 'USD', symbol: '$', balance: 1250.50, flag: '🇺🇸', name: 'USD Wallet' },
    { id: 2, currency: 'EUR', symbol: '€', balance: 800.00, flag: '🇪🇺', name: 'EUR Wallet' },
    { id: 3, currency: 'INR', symbol: '₹', balance: 5000.00, flag: '🇮🇳', name: 'INR Wallet' },
];

const TransferMoneyPage = () => {
    const navigate = useNavigate();
    const [sourceWallet, setSourceWallet] = useState(WALLETS[0]);
    const [destWallet, setDestWallet] = useState(WALLETS[1]);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [exchangeRate, setExchangeRate] = useState(0.92);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    // Update exchange rate simulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate rate slightly
            const change = (Math.random() - 0.5) * 0.01;
            setExchangeRate(prev => parseFloat((prev + change).toFixed(4)));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Ensure source and dest are different
    useEffect(() => {
        if (sourceWallet.id === destWallet.id) {
            const nextWallet = WALLETS.find(w => w.id !== sourceWallet.id);
            if (nextWallet) setDestWallet(nextWallet);
        }
    }, [sourceWallet, destWallet]);

    const handleMaxAmount = () => {
        setAmount(sourceWallet.balance);
    };

    const getReceiveAmount = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return 0;
        // Simple conversion logic mock
        // If USD -> EUR (Rate ~0.92)
        // If EUR -> USD (Rate ~1.08)
        // For demo, we just use the 'exchangeRate' state if currencies differ
        if (sourceWallet.currency === destWallet.currency) return val;

        // This is a simplified demo logic. In real app, we'd fetch specific pair rates.
        // We will just use the current random exchangeRate for demonstration.
        return (val * exchangeRate).toFixed(2);
    };

    const handleTransfer = () => {
        if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > sourceWallet.balance) return;

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setTransactionId(`TRX-${Math.floor(Math.random() * 1000000)}`);
            setShowSuccessModal(true);
        }, 2000);
    };

    const availableDestWallets = WALLETS.filter(w => w.id !== sourceWallet.id);

    return (
        <DashboardLayout>
            <Container className="py-4">
                <div className="mb-4">
                    <Link to="/dashboard" className="text-decoration-none text-muted d-inline-flex align-items-center gap-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                </div>

                <Row className="justify-content-center">
                    <Col lg={8} xl={6}>
                        <Card className="border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <Card.Body className="p-4 p-md-5">
                                <h3 className="fw-bold mb-4 text-center">Transfer Money</h3>

                                <Form>
                                    {/* Source Wallet */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold text-muted small text-uppercase">From</Form.Label>
                                        <Form.Select
                                            size="lg"
                                            className="shadow-none border-light bg-light fw-bold"
                                            value={sourceWallet.id}
                                            onChange={e => setSourceWallet(WALLETS.find(w => w.id === parseInt(e.target.value)))}
                                        >
                                            {WALLETS.map(w => (
                                                <option key={w.id} value={w.id}>
                                                    {w.flag} {w.name} • {w.symbol}{w.balance.toLocaleString()}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <div className="d-flex justify-content-center mb-4 position-relative">
                                        <div className="bg-white rounded-circle border shadow-sm p-2 position-absolute top-50 start-50 translate-middle z-1">
                                            <FaExchangeAlt className="text-primary" />
                                        </div>
                                        <hr className="w-100 my-0 text-muted opacity-25" />
                                    </div>

                                    {/* Destination Wallet */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold text-muted small text-uppercase">To</Form.Label>
                                        <Form.Select
                                            size="lg"
                                            className="shadow-none border-light bg-light fw-bold"
                                            value={destWallet.id}
                                            onChange={e => setDestWallet(WALLETS.find(w => w.id === parseInt(e.target.value)))}
                                        >
                                            {availableDestWallets.map(w => (
                                                <option key={w.id} value={w.id}>
                                                    {w.flag} {w.name} • {w.symbol}{w.balance.toLocaleString()}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    {/* Amount */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold text-muted small text-uppercase">Amount to Send</Form.Label>
                                        <InputGroup className="input-group-lg border rounded-3 overflow-hidden">
                                            <InputGroup.Text className="bg-white border-0 fw-bold pl-3">{sourceWallet.symbol}</InputGroup.Text>
                                            <NumericFormat
                                                className="form-control border-0 shadow-none fw-bold fs-4"
                                                value={amount}
                                                onValueChange={(values) => setAmount(values.value)}
                                                thousandSeparator={true}
                                                placeholder="0.00"
                                            />
                                            <Button variant="link" className="text-decoration-none fw-bold" onClick={handleMaxAmount}>MAX</Button>
                                        </InputGroup>
                                        <div className="d-flex justify-content-between mt-2 px-1">
                                            <small className="text-muted">Available: {sourceWallet.symbol}{sourceWallet.balance.toLocaleString()}</small>
                                            {parseFloat(amount) > sourceWallet.balance && <small className="text-danger fw-bold">Insufficient funds</small>}
                                        </div>
                                    </Form.Group>

                                    {/* Exchange Rate Info */}
                                    <AnimatePresence>
                                        {sourceWallet.currency !== destWallet.currency && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-4"
                                            >
                                                <div className="bg-info-subtle p-3 rounded-3 border border-info border-opacity-25">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-bold text-info-emphasis">Exchange Rate</span>
                                                        <span className="badge bg-success bg-opacity-75 text-white d-flex align-items-center gap-1"><span className="spinner-grow spinner-grow-sm" style={{ width: '0.5rem', height: '0.5rem' }} role="status"></span> Live rate</span>
                                                    </div>
                                                    <div className="fs-5 fw-bold mb-1 ml-2">
                                                        1 {sourceWallet.currency} = {exchangeRate} {destWallet.currency}
                                                    </div>
                                                    <small className="text-muted">
                                                        You will receive: <span className="text-success fw-bold">{destWallet.symbol}{getReceiveAmount()}</span>
                                                    </small>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Note */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold text-muted small text-uppercase">Add a note (Optional)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            placeholder="What's this transfer for?"
                                            className="bg-light border-0 shadow-none"
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                        />
                                    </Form.Group>

                                    {/* Summary & Action */}
                                    <div className="d-grid gap-3">
                                        <Button
                                            size="lg"
                                            className="btn-gradient fw-bold py-3"
                                            onClick={handleTransfer}
                                            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > sourceWallet.balance || isProcessing}
                                        >
                                            {isProcessing ? 'Processing Transfer...' : 'Transfer Now'}
                                        </Button>
                                        <Button variant="light" className="text-muted" as={Link} to="/dashboard">Cancel</Button>
                                    </div>

                                </Form>
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
                    <h3 className="fw-bold mb-2">Transfer Successful!</h3>
                    <p className="text-muted mb-4">You have successfully sent <span className="fw-bold text-dark">{sourceWallet.symbol}{parseFloat(amount || 0).toLocaleString()}</span> to your {destWallet.name}.</p>

                    <div className="bg-light p-3 rounded-3 mb-4 text-start">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Transaction ID</span>
                            <span className="fw-mono small text-dark">{transactionId}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Date</span>
                            <span className="small text-dark">{new Date().toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="text-muted small">Amount Received</span>
                            <span className="fw-bold text-success">{destWallet.symbol}{getReceiveAmount()}</span>
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

export default TransferMoneyPage;
