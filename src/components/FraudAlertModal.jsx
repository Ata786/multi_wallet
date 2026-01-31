import React, { useState } from 'react';
import { Modal, Button, ProgressBar, Card, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, MapPin, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const FraudAlertModal = ({ show, onHide, transaction }) => {
    const [actionStep, setActionStep] = useState('initial'); // initial, confirm, report, details
    const [riskScore, setRiskScore] = useState(85);

    const handleConfirm = () => {
        setActionStep('authorized');
        setTimeout(() => {
            onHide();
            setActionStep('initial');
        }, 2000);
    };

    const handleReject = () => {
        setActionStep('report');
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" contentClassName="border-0 overflow-hidden" backdrop="static">
            <div className="bg-danger p-2"></div>
            <Modal.Body className="p-0">
                <AnimatePresence mode="wait">
                    {actionStep === 'initial' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 p-md-5"
                        >
                            <div className="text-center mb-4">
                                <div className="bg-danger bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                                    <AlertTriangle size={48} className="text-danger" />
                                </div>
                                <h3 className="fw-bold text-danger">Suspicious Activity Detected</h3>
                                <p className="text-muted">Transaction requires your verification</p>
                            </div>

                            <Card className="border-0 shadow-sm bg-light mb-4">
                                <Card.Body>
                                    <h6 className="fw-bold text-uppercase text-muted small mb-3">Flagged Transaction</h6>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">Transaction ID</span>
                                        <span className="font-monospace user-select-all">{transaction?.id || 'TRX-99887766'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">Amount</span>
                                        <span className="fw-bold fs-4 text-danger">{transaction?.amount || '$6,000.00'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">Recipient</span>
                                        <span className="fw-semibold">{transaction?.recipient || 'Unknown Wallet (GB...889)'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">Location</span>
                                        <div className="d-flex align-items-center gap-1">
                                            <MapPin size={14} />
                                            <span>{transaction?.location || 'Lagos, Nigeria'}</span>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">Why was this flagged?</h6>
                                <div className="d-flex flex-column gap-2">
                                    <div className="d-flex align-items-center gap-2 text-danger">
                                        <ShieldAlert size={18} />
                                        <span>Amount exceeds daily limit ($5,000)</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 text-danger">
                                        <Clock size={18} />
                                        <span>Unusual transaction time (3:00 AM)</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 text-warning">
                                        <MapPin size={18} />
                                        <span>Different location than usual</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-end mb-1">
                                    <span className="fw-bold">Risk Score</span>
                                    <span className="text-danger fw-bold fs-5">{riskScore}/100</span>
                                </div>
                                <ProgressBar variant="danger" now={riskScore} style={{ height: '8px' }} />
                                <small className="text-danger fw-bold mt-1 d-block">High Risk</small>
                            </div>

                            <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                                <Button variant="outline-danger" size="lg" className="flex-grow-1" onClick={handleReject}>
                                    I Don't Recognize This
                                </Button>
                                <Button variant="success" size="lg" className="flex-grow-1" onClick={handleConfirm}>
                                    This Was Me
                                </Button>
                            </div>
                            <div className="text-center mt-3">
                                <Button variant="link" className="text-muted text-decoration-none" onClick={onHide}>Review Later</Button>
                            </div>
                        </motion.div>
                    )}

                    {actionStep === 'authorized' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-5 text-center"
                        >
                            <div className="text-success mb-4">
                                <CheckCircle size={80} />
                            </div>
                            <h3 className="fw-bold mb-2">Transaction Authorized</h3>
                            <p className="text-muted">Thank you for verifying your identity. The transaction has been processed.</p>
                        </motion.div>
                    )}

                    {actionStep === 'report' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 p-md-5"
                        >
                            <h4 className="fw-bold mb-4 text-danger">Report Suspicious Activity</h4>
                            <Form>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">What acts best describes this situation?</Form.Label>
                                    <Form.Check type="radio" name="fraudReason" label="I card/details were stolen" className="mb-2" />
                                    <Form.Check type="radio" name="fraudReason" label="I noticed this transaction later" className="mb-2" />
                                    <Form.Check type="radio" name="fraudReason" label="Other reason" className="mb-2" />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Immediate Actions</Form.Label>
                                    <div className="d-flex flex-column gap-2">
                                        <Button variant="danger-subtle" className="text-danger text-start fw-bold border-danger">
                                            🔒 Freeze Account Immediately
                                        </Button>
                                        <Button variant="outline-secondary" className="text-start">
                                            📞 Contact Support Team
                                        </Button>
                                    </div>
                                </Form.Group>
                                <div className="d-flex justify-content-between mt-5">
                                    <Button variant="ghost" onClick={() => setActionStep('initial')}>Back</Button>
                                    <Button variant="danger" onClick={() => { onHide(); alert('Report Submitted') }}>Submit Report</Button>
                                </div>
                            </Form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Modal.Body>
        </Modal>
    );
};

export default FraudAlertModal;
