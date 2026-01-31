import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Modal, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSync, FaCheckCircle, FaExchangeAlt } from 'react-icons/fa';
import { NumericFormat } from 'react-number-format';
import DashboardLayout from '../components/DashboardLayout';
import authService from '../services/authService';

const ConvertCurrencyPage = () => {
    const navigate = useNavigate();
    const [user] = useState(authService.getCurrentUser());
    const [wallets, setWallets] = useState([]);
    const [fromWallet, setFromWallet] = useState(null);
    const [toWallet, setToWallet] = useState(null);
    const [amount, setAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [conversionResult, setConversionResult] = useState(null);

    useEffect(() => {
        if (user) {
            authService.getWallets(user.id).then(data => {
                setWallets(data);
                if (data.length > 0) {
                    setFromWallet(data[0]);
                    if (data.length > 1) setToWallet(data[1]);
                }
            }).catch(console.error);
        }
    }, [user]);

    // Fetch exchange rate when wallets change
    useEffect(() => {
        if (fromWallet && toWallet && fromWallet.id !== toWallet.id) {
            authService.getExchangeRate(fromWallet.currency, toWallet.currency)
                .then(data => setExchangeRate(data.rate))
                .catch(() => setExchangeRate(1));
        }
    }, [fromWallet, toWallet]);

    // Ensure wallets are different
    useEffect(() => {
        if (fromWallet && toWallet && fromWallet.id === toWallet.id) {
            const nextWallet = wallets.find(w => w.id !== fromWallet.id);
            if (nextWallet) setToWallet(nextWallet);
        }
    }, [fromWallet, toWallet, wallets]);

    const handleSwap = () => {
        const temp = fromWallet;
        setFromWallet(toWallet);
        setToWallet(temp);
        setAmount('');
    };

    const getReceiveAmount = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return '0.00';
        return (val * exchangeRate).toFixed(2);
    };

    const handleConvert = async () => {
        if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromWallet.balance) return;
        if (!fromWallet || !toWallet) return;

        setIsProcessing(true);

        try {
            const result = await authService.convertCurrency(
                fromWallet.id,
                toWallet.id,
                parseFloat(amount)
            );

            setConversionResult(result);
            setShowSuccessModal(true);

            // Refresh wallets
            authService.getWallets(user.id).then(data => {
                setWallets(data);
                const updatedFrom = data.find(w => w.id === fromWallet.id);
                const updatedTo = data.find(w => w.id === toWallet.id);
                if (updatedFrom) setFromWallet(updatedFrom);
                if (updatedTo) setToWallet(updatedTo);
            });

        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        setAmount('');
        navigate('/dashboard');
    };

    if (!fromWallet || wallets.length < 2) {
        return (
            <DashboardLayout>
                <Container className="py-5 text-center">
                    {wallets.length < 2 ? (
                        <>
                            <h4 className="text-muted mb-3">You need at least 2 wallets to convert currency</h4>
                            <Button as={Link} to="/dashboard" variant="primary">Create another wallet</Button>
                        </>
                    ) : (
                        <>
                            <Spinner animation="border" />
                            <p className="text-muted mt-2">Loading wallets...</p>
                        </>
                    )}
                </Container>
            </DashboardLayout>
        );
    }

    const availableToWallets = wallets.filter(w => w.id !== fromWallet.id);

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
                                            onChange={e => setFromWallet(wallets.find(w => w.id === parseInt(e.target.value)))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {wallets.map(w => <option key={w.id} value={w.id}>{w.flag} {w.currency}</option>)}
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
                                    <div className="d-flex justify-content-between mt-1">
                                        <small className="text-muted">{fromWallet.symbol}</small>
                                        {parseFloat(amount) > fromWallet.balance && <small className="text-danger">Insufficient funds</small>}
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
                                        <span className="small text-muted">Balance: {toWallet?.symbol}{toWallet?.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <Form.Select
                                            className="border-0 bg-transparent shadow-none fw-bold fs-5 p-0 w-auto"
                                            value={toWallet?.id}
                                            onChange={e => setToWallet(wallets.find(w => w.id === parseInt(e.target.value)))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {availableToWallets.map(w => <option key={w.id} value={w.id}>{w.flag} {w.currency}</option>)}
                                        </Form.Select>
                                        <div className="vr mx-2"></div>
                                        <div className="flex-grow-1 text-end fw-bold fs-3 text-success">
                                            {getReceiveAmount()}
                                        </div>
                                    </div>
                                    <div className="text-end text-muted small mt-1">
                                        {toWallet?.symbol}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                                    <span className="text-muted small fw-bold">Exchange Rate</span>
                                    <span className="fw-mono small bg-info-subtle text-info px-2 py-1 rounded">
                                        1 {fromWallet.currency} = {exchangeRate.toFixed(4)} {toWallet?.currency}
                                    </span>
                                </div>

                                <Button
                                    variant="primary"
                                    className="w-100 btn-gradient py-3 fw-bold fs-5"
                                    onClick={handleConvert}
                                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromWallet.balance || isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Converting...
                                        </>
                                    ) : 'Convert Now'}
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
                    <p className="text-muted mb-4">
                        You have successfully converted <span className="fw-bold text-dark">{fromWallet.symbol}{conversionResult?.amountDebited?.toLocaleString()}</span> to <span className="fw-bold text-dark">{toWallet?.symbol}{conversionResult?.amountCredited?.toLocaleString()}</span>.
                    </p>

                    <div className="bg-light p-3 rounded-3 mb-4 text-start">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Exchange Rate</span>
                            <span className="small text-dark">1 {conversionResult?.fromCurrency} = {conversionResult?.exchangeRate?.toFixed(4)} {conversionResult?.toCurrency}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">{fromWallet.currency} Wallet Balance</span>
                            <span className="small text-dark">{fromWallet.symbol}{conversionResult?.fromWalletBalance?.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="text-muted small">{toWallet?.currency} Wallet Balance</span>
                            <span className="small text-success fw-bold">{toWallet?.symbol}{conversionResult?.toWalletBalance?.toLocaleString()}</span>
                        </div>
                    </div>

                    <Button variant="primary" className="w-100 btn-gradient" onClick={handleCloseSuccess}>
                        Back to Dashboard
                    </Button>
                </Modal.Body>
            </Modal>

        </DashboardLayout>
    );
};

export default ConvertCurrencyPage;
