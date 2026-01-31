import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Modal, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaPaperPlane, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { NumericFormat } from 'react-number-format';
import DashboardLayout from '../components/DashboardLayout';
import authService from '../services/authService';

const TransferMoneyPage = () => {
    const navigate = useNavigate();
    const [user] = useState(authService.getCurrentUser());
    const [wallets, setWallets] = useState([]);
    const [sourceWallet, setSourceWallet] = useState(null);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    const [isProcessing, setIsProcessing] = useState(false);
    const [isCheckingRecipient, setIsCheckingRecipient] = useState(false);
    const [recipientInfo, setRecipientInfo] = useState(null);
    const [recipientError, setRecipientError] = useState('');

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [transferResult, setTransferResult] = useState(null);

    useEffect(() => {
        if (user) {
            authService.getWallets(user.id).then(data => {
                setWallets(data);
                if (data.length > 0) setSourceWallet(data[0]);
            }).catch(console.error);
        }
    }, [user]);

    // Debounce recipient email check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (recipientEmail && recipientEmail.includes('@') && sourceWallet) {
                checkRecipient();
            } else {
                setRecipientInfo(null);
                setRecipientError('');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [recipientEmail, sourceWallet]);

    const checkRecipient = async () => {
        if (!recipientEmail || !sourceWallet) return;

        // Don't allow sending to self
        if (recipientEmail.toLowerCase() === user.email?.toLowerCase()) {
            setRecipientError("You cannot send money to yourself");
            setRecipientInfo(null);
            return;
        }

        setIsCheckingRecipient(true);
        setRecipientError('');

        try {
            const result = await authService.checkRecipient(recipientEmail, sourceWallet.currency);
            if (result.exists) {
                setRecipientInfo(result);
                setRecipientError('');
            } else {
                setRecipientInfo(null);
                setRecipientError(result.message || 'User not found');
            }
        } catch (err) {
            setRecipientError('Failed to check recipient');
            setRecipientInfo(null);
        } finally {
            setIsCheckingRecipient(false);
        }
    };

    const handleMaxAmount = () => {
        if (sourceWallet) setAmount(sourceWallet.balance);
    };

    const getConvertedAmount = () => {
        if (!recipientInfo || !amount) return 0;
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum)) return 0;
        return (amountNum * recipientInfo.exchangeRate).toFixed(2);
    };

    const handleTransfer = async () => {
        if (!amount || parseFloat(amount) <= 0 || !sourceWallet || !recipientInfo) return;
        if (parseFloat(amount) > sourceWallet.balance) return;

        setIsProcessing(true);

        try {
            const result = await authService.sendMoney(
                sourceWallet.id,
                recipientEmail,
                parseFloat(amount),
                note
            );

            setTransferResult(result);
            setShowSuccessModal(true);

            // Refresh wallets
            authService.getWallets(user.id).then(data => {
                setWallets(data);
                const updated = data.find(w => w.id === sourceWallet.id);
                if (updated) setSourceWallet(updated);
            });

        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        setRecipientEmail('');
        setAmount('');
        setNote('');
        setRecipientInfo(null);
        navigate('/dashboard');
    };

    if (!sourceWallet) {
        return (
            <DashboardLayout>
                <Container className="py-5 text-center">
                    <Spinner animation="border" />
                    <p className="text-muted mt-2">Loading wallets...</p>
                </Container>
            </DashboardLayout>
        );
    }

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
                                <div className="text-center mb-4">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3 text-primary">
                                        <FaPaperPlane size={32} />
                                    </div>
                                    <h3 className="fw-bold mb-1">Send Money</h3>
                                    <p className="text-muted mb-0">Transfer funds to another user</p>
                                </div>

                                <Form>
                                    {/* Source Wallet Selection */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold text-muted small text-uppercase">Select Wallet</Form.Label>
                                        <Form.Select
                                            size="lg"
                                            className="shadow-none border-light bg-light fw-bold"
                                            value={sourceWallet.id}
                                            onChange={e => {
                                                const selected = wallets.find(w => w.id === parseInt(e.target.value));
                                                setSourceWallet(selected);
                                                setRecipientInfo(null);
                                            }}
                                        >
                                            {wallets.map(w => (
                                                <option key={w.id} value={w.id}>
                                                    {w.flag} {w.name || w.currency + ' Wallet'} • {w.symbol}{w.balance.toLocaleString()}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    {/* Recipient Email */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold text-muted small text-uppercase">Recipient Email</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                size="lg"
                                                type="email"
                                                placeholder="Enter recipient's email"
                                                className="bg-light border-0 shadow-none"
                                                value={recipientEmail}
                                                onChange={e => setRecipientEmail(e.target.value)}
                                            />
                                            {isCheckingRecipient && (
                                                <InputGroup.Text className="bg-light border-0">
                                                    <Spinner size="sm" />
                                                </InputGroup.Text>
                                            )}
                                        </InputGroup>

                                        {recipientError && (
                                            <Alert variant="danger" className="mt-2 py-2 mb-0 small d-flex align-items-center gap-2">
                                                <FaExclamationTriangle /> {recipientError}
                                            </Alert>
                                        )}

                                        {recipientInfo && (
                                            <div className="mt-2 p-3 bg-success-subtle rounded-3 border border-success border-opacity-25">
                                                <div className="d-flex align-items-center gap-2 text-success">
                                                    <FaUser />
                                                    <span className="fw-bold">{recipientInfo.recipientName}</span>
                                                </div>
                                                <small className="text-muted">
                                                    Will receive in {recipientInfo.recipientCurrency} wallet
                                                    {sourceWallet.currency !== recipientInfo.recipientCurrency && (
                                                        <span> (Rate: 1 {sourceWallet.currency} = {recipientInfo.exchangeRate.toFixed(4)} {recipientInfo.recipientCurrency})</span>
                                                    )}
                                                </small>
                                            </div>
                                        )}
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

                                        {/* Converted Amount Preview */}
                                        {recipientInfo && sourceWallet.currency !== recipientInfo.recipientCurrency && amount && parseFloat(amount) > 0 && (
                                            <div className="mt-2 p-2 bg-info-subtle rounded text-center">
                                                <small className="text-info-emphasis">
                                                    Recipient will receive approximately <strong>{recipientInfo.recipientSymbol}{getConvertedAmount()}</strong>
                                                </small>
                                            </div>
                                        )}
                                    </Form.Group>

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
                                            disabled={
                                                !amount ||
                                                parseFloat(amount) <= 0 ||
                                                parseFloat(amount) > sourceWallet.balance ||
                                                !recipientInfo ||
                                                isProcessing
                                            }
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Processing Transfer...
                                                </>
                                            ) : 'Send Money'}
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
                    <p className="text-muted mb-4">
                        You have successfully sent <span className="fw-bold text-dark">{sourceWallet.symbol}{parseFloat(amount || 0).toLocaleString()}</span> to <span className="fw-bold text-dark">{transferResult?.recipientName}</span>.
                    </p>

                    <div className="bg-light p-3 rounded-3 mb-4 text-start">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Transaction ID</span>
                            <span className="fw-mono small text-dark">TRX-{transferResult?.transactionId}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Date</span>
                            <span className="small text-dark">{new Date().toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Amount Sent</span>
                            <span className="fw-bold text-danger">-{sourceWallet.symbol}{transferResult?.amountSent?.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="text-muted small">Recipient Received</span>
                            <span className="fw-bold text-success">{recipientInfo?.recipientSymbol}{transferResult?.amountReceived?.toLocaleString()}</span>
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

export default TransferMoneyPage;
