import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Modal, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        if (user) {
            authService.getWallets(user.id).then(data => {
                setWallets(data);
                if (data.length > 0) setSourceWallet(data[0]);
            }).catch(console.error);
        }
    }, [user]);

    const handleMaxAmount = () => {
        if (sourceWallet) setAmount(sourceWallet.balance);
    };

    const handleTransfer = () => {
        if (!amount || parseFloat(amount) <= 0 || (sourceWallet && parseFloat(amount) > sourceWallet.balance) || !recipientEmail) return;

        setIsProcessing(true);
        // Simulate transfer
        setTimeout(() => {
            setIsProcessing(false);
            setTransactionId(`TRX-${Math.floor(Math.random() * 1000000)}`);
            setShowSuccessModal(true);
        }, 2000);
    };

    if (!sourceWallet) {
        return (
            <DashboardLayout>
                <Container className="py-5 text-center">
                    <p className="text-muted">Loading wallets...</p>
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
                                            onChange={e => setSourceWallet(wallets.find(w => w.id === parseInt(e.target.value)))}
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
                                        <Form.Control
                                            size="lg"
                                            type="email"
                                            placeholder="Enter recipient's email"
                                            className="bg-light border-0 shadow-none"
                                            value={recipientEmail}
                                            onChange={e => setRecipientEmail(e.target.value)}
                                        />
                                        <Form.Text className="text-muted">The recipient must have an account on our platform.</Form.Text>
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
                                            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > sourceWallet.balance || !recipientEmail || isProcessing}
                                        >
                                            {isProcessing ? 'Processing Transfer...' : 'Send Money'}
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
                    <p className="text-muted mb-4">You have successfully sent <span className="fw-bold text-dark">{sourceWallet.symbol}{parseFloat(amount || 0).toLocaleString()}</span> to <span className="fw-bold text-dark">{recipientEmail}</span>.</p>

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
                            <span className="text-muted small">Amount Sent</span>
                            <span className="fw-bold text-success">{sourceWallet.symbol}{parseFloat(amount || 0).toLocaleString()}</span>
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
