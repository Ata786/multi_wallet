import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaArrowRight, FaSync, FaList, FaDownload, FaWallet, FaArrowUp, FaArrowDown, FaExchangeAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaCopy } from 'react-icons/fa';
import Select from 'react-select';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import DashboardLayout from '../components/DashboardLayout';
import authService from '../services/authService';

const stripePromise = loadStripe('pk_test_51SucMT3DK6vZKiCWB6UUuddjx8kpOr2K55E0EeRggijaFElQnr3JNvPeM0mwTf7upZ2Qp6lQzPXEOtYecmdVqbN400sleBedBG');

const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar 🇺🇸', symbol: '$', code: 'USD' },
    { value: 'EUR', label: 'EUR - Euro 🇪🇺', symbol: '€', code: 'EUR' },
    { value: 'GBP', label: 'GBP - British Pound 🇬🇧', symbol: '£', code: 'GBP' },
    { value: 'INR', label: 'INR - Indian Rupee 🇮🇳', symbol: '₹', code: 'INR' },
    { value: 'JPY', label: 'JPY - Japanese Yen 🇯🇵', symbol: '¥', code: 'JPY' },
    { value: 'AUD', label: 'AUD - Australian Dollar 🇦🇺', symbol: 'A$', code: 'AUD' },
    { value: 'CAD', label: 'CAD - Canadian Dollar 🇨🇦', symbol: 'C$', code: 'CAD' },
];

const CheckoutForm = ({ amount, wallet, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            console.error("Stripe or Elements not loaded");
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            console.log("Confirming payment...");
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href, // This won't successfully redirect in this modal flow easily without route handling, but needed for confirm
                },
                redirect: 'if_required'
            });

            console.log("Stripe result:", { error, paymentIntent });

            if (error) {
                setMessage(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log("Payment succeeded, verifying with backend...");
                await authService.confirmPayment(paymentIntent.id, wallet.id)
                    .then(updatedWallet => {
                        onSuccess(updatedWallet);
                    })
                    .catch(err => {
                        console.error("Backend confirmation failed:", err);
                        setMessage("Backend Error: " + err.message);
                    });
            } else {
                console.warn("Unexpected payment state:", paymentIntent);
                setMessage("Payment status: " + (paymentIntent ? paymentIntent.status : "Unknown"));
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setMessage("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <Button type="submit" disabled={isLoading || !stripe || !elements} id="submit" className="w-100 btn-gradient mt-3">
                <span id="button-text">
                    {isLoading ? <Spinner size="sm" /> : `Pay ${wallet.symbol}${amount}`}
                </span>
            </Button>
            {message && <div id="payment-message" className="text-danger mt-2 small">{message}</div>}
        </form>
    );
};

const DashboardPage = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);

    const [selectedWallet, setSelectedWallet] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [walletStats, setWalletStats] = useState({ totalSent: 0, totalReceived: 0, transactionCount: 0 });
    const [recentTransactions, setRecentTransactions] = useState([]);

    const [newWalletCurrency, setNewWalletCurrency] = useState(null);
    const [initialDeposit, setInitialDeposit] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [user, setUser] = useState(authService.getCurrentUser());

    // Payment state
    const [paymentAmount, setPaymentAmount] = useState('');
    const [clientSecret, setClientSecret] = useState(null);

    const fetchWallets = () => {
        if (user) {
            authService.getWallets(user.id).then(data => {
                setWallets(data);
                // Update selected wallet if open
                if (selectedWallet) {
                    const updated = data.find(w => w.id === selectedWallet.id);
                    if (updated) setSelectedWallet(updated);
                }
            }).catch(console.error);
        }
    };

    useEffect(() => {
        fetchWallets();
        // Fetch recent transactions for home page
        if (user) {
            authService.getUserTransactions(user.id).then(data => setRecentTransactions(data.slice(0, 5))).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        if (selectedWallet) {
            authService.getTransactions(selectedWallet.id).then(data => setTransactions(data)).catch(console.error);
            authService.getWalletStats(selectedWallet.id).then(data => setWalletStats(data)).catch(console.error);
        }
    }, [selectedWallet]);

    const handleCreateWallet = () => {
        if (!newWalletCurrency) return;
        setIsCreating(true);

        authService.createWallet(user.id, newWalletCurrency.code, parseFloat(initialDeposit) || 0)
            .then(wallet => {
                setWallets([...wallets, { ...wallet, change: wallet.dailyChange }]);
                setShowCreateModal(false);
                setNewWalletCurrency(null);
                setInitialDeposit('');
            })
            .catch(err => alert(err.message))
            .finally(() => setIsCreating(false));
    };

    const handleViewDetails = (wallet) => {
        setSelectedWallet(wallet);
        setShowWalletModal(true);
    };

    const handleOpenReceive = (wallet) => {
        setSelectedWallet(wallet);
        setShowReceiveModal(true);
        setPaymentAmount('');
        setClientSecret(null);
        // If modal was open, close it
        setShowWalletModal(false);
    }

    const initPayment = () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
        authService.createPaymentIntent(parseFloat(paymentAmount), selectedWallet.currency)
            .then(data => setClientSecret(data.clientSecret))
            .catch(err => alert(err.message));
    }

    const onPaymentSuccess = (updatedWallet) => {
        alert("Payment Successful! Funds added.");
        setShowReceiveModal(false);
        fetchWallets();
        // If details modal was open in bg, update it
        setSelectedWallet(updatedWallet);
        setShowWalletModal(true);
    }

    return (
        <DashboardLayout>
            <Container className="py-4">
                {/* Welcome Section */}
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Welcome back, {user?.name || 'User'}! 👋</h2>
                        <p className="text-muted mb-0">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Wallet Overview */}
                <h5 className="fw-bold text-muted mb-3">Your Wallets</h5>
                <Row className="g-4 mb-5">
                    {wallets.length === 0 && <p className="text-muted">No wallets found. Create one!</p>}
                    {wallets.map(wallet => (
                        <Col md={6} lg={4} key={wallet.id}>
                            <Card className="h-100 border-0 shadow-sm hover-scale transition-all">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fs-2">{wallet.flag}</span>
                                            <span className="fw-bold text-muted">{wallet.currency}</span>
                                        </div>
                                        <Badge bg={wallet.change >= 0 ? "success-subtle" : "danger-subtle"} className={wallet.change >= 0 ? "text-success" : "text-danger"}>
                                            {wallet.change > 0 ? '+' : ''}{wallet.change}%
                                        </Badge>
                                    </div>
                                    <h3 className="fw-bold mb-3">{wallet.symbol}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                                    <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={() => handleViewDetails(wallet)}>View Details</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                    <Col md={6} lg={4}>
                        <Card
                            className="h-100 border-2 border-dashed shadow-none bg-transparent d-flex align-items-center justify-content-center cursor-pointer text-muted new-wallet-card"
                            style={{ minHeight: '200px', borderStyle: 'dashed' }}
                            onClick={() => setShowCreateModal(true)}
                        >
                            <div className="text-center p-4">
                                <div className="bg-white rounded-circle shadow-sm d-inline-flex p-3 mb-3 text-primary">
                                    <FaPlus size={24} />
                                </div>
                                <h6 className="fw-bold">Create New Wallet</h6>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row className="mb-5">
                    <Col>
                        <Card className="border-0 shadow-sm p-3">
                            <Row className="g-3 text-center">
                                <Col xs={6} md={3}>
                                    <Link to="/transfer" className="text-decoration-none">
                                        <div className="action-btn p-3 rounded-3 bg-gradient-primary-light text-primary mb-2 mx-auto" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ff 0%, #d1d5db 100%)' }}>
                                            <FaArrowRight size={24} className="text-primary" />
                                        </div>
                                        <span className="fw-semibold text-dark small">Transfer Money</span>
                                    </Link>
                                </Col>
                                <Col xs={6} md={3}>
                                    <Link to="/convert" className="text-decoration-none">
                                        <div className="action-btn p-3 rounded-3 bg-gradient-info-light text-info mb-2 mx-auto" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0f2fe' }}>
                                            <FaSync size={24} className="text-info" />
                                        </div>
                                        <span className="fw-semibold text-dark small">Convert</span>
                                    </Link>
                                </Col>
                                <Col xs={6} md={3}>
                                    <Link to="/transactions" className="text-decoration-none">
                                        <div className="action-btn p-3 rounded-3 bg-gradient-success-light text-success mb-2 mx-auto" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dcfce7' }}>
                                            <FaList size={24} className="text-success" />
                                        </div>
                                        <span className="fw-semibold text-dark small">History</span>
                                    </Link>
                                </Col>
                                <Col xs={6} md={3}>
                                    <Link to="/reports" className="text-decoration-none">
                                        <div className="action-btn p-3 rounded-3 bg-gradient-warning-light text-warning mb-2 mx-auto" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef3c7' }}>
                                            <FaDownload size={24} className="text-warning" />
                                        </div>
                                        <span className="fw-semibold text-dark small">Reports</span>
                                    </Link>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* Recent Activity */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold mb-0">Recent Activity</h5>
                        <Link to="/transactions" className="text-decoration-none small fw-bold">View All</Link>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {recentTransactions.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <p className="mb-0">No recent transactions.</p>
                            </div>
                        ) : (
                            recentTransactions.map((tx, index) => (
                                <div key={tx.id} className={`d-flex align-items-center p-3 ${index !== recentTransactions.length - 1 ? 'border-bottom' : ''} hover-bg-light`}>
                                    <div className={`rounded-circle p-2 me-3 d-flex align-items-center justify-content-center ${tx.type === 'DEPOSIT' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} style={{ width: '40px', height: '40px' }}>
                                        {tx.type === 'DEPOSIT' ? <FaArrowDown /> : <FaArrowRight />}
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="mb-0 fw-semibold">{tx.description || tx.type}</h6>
                                        <small className="text-muted">{new Date(tx.timestamp).toLocaleString()}</small>
                                    </div>
                                    <div className={`fw-bold ${tx.type === 'DEPOSIT' ? 'text-success' : 'text-danger'}`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </Card.Body>
                </Card>

            </Container>

            {/* Create Wallet Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered contentClassName="border-0 shadow-lg" backdrop="static">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Create New Wallet</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pb-4">
                    <p className="text-muted mb-4">Choose a currency to get started</p>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Select Currency</Form.Label>
                            <Select
                                options={CURRENCIES}
                                value={newWalletCurrency}
                                onChange={setNewWalletCurrency}
                                placeholder="Search currency..."
                                autoFocus
                                menuPlacement="auto"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Initial Deposit <span className="text-muted fw-normal">(Optional)</span></Form.Label>
                            <div className="input-group">
                                <span className="input-group-text bg-light">{newWalletCurrency?.symbol || '$'}</span>
                                <Form.Control
                                    type="number"
                                    placeholder="0.00"
                                    value={initialDeposit}
                                    onChange={(e) => setInitialDeposit(e.target.value)}
                                />
                            </div>
                            <Form.Text className="text-muted">You can add funds later via bank transfer.</Form.Text>
                        </Form.Group>
                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                            <Button
                                variant="primary"
                                className="px-4 btn-gradient"
                                onClick={handleCreateWallet}
                                disabled={!newWalletCurrency || isCreating}
                            >
                                {isCreating ? 'Creating...' : 'Create Wallet'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Wallet Details Modal */}
            <Modal show={showWalletModal} onHide={() => setShowWalletModal(false)} centered size="lg" contentClassName="border-0 shadow-lg" backdrop="static">
                {selectedWallet && (
                    <>
                        <Modal.Header closeButton className="border-bottom-0 pb-0">
                            <div className="d-flex align-items-center gap-2">
                                <span className="fs-3">{selectedWallet.flag}</span>
                                <Modal.Title className="fw-bold">{selectedWallet.currency} Wallet</Modal.Title>
                            </div>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            {/* Balance Section */}
                            <div className="mb-4 text-center">
                                <span className="text-muted small fw-bold text-uppercase">Total Balance</span>
                                <h1 className="display-4 fw-bold">{selectedWallet.symbol}{selectedWallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
                                <div className="d-flex justify-content-center gap-3 mt-2 text-muted small">
                                    <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">
                                        <span>ID: {selectedWallet.id}</span>
                                        <FaCopy className="cursor-pointer" title="Copy ID" />
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        <FaCheckCircle className="text-success" />
                                        <span>Active</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <Row className="g-3 mb-4">
                                <Col md={4}>
                                    <div className="p-3 bg-danger-subtle rounded-3 h-100">
                                        <div className="d-flex justify-content-between mb-2 text-danger">
                                            <FaArrowUp />
                                            <span className="small fw-bold">Total Sent</span>
                                        </div>
                                        <h5 className="fw-bold mb-0">{selectedWallet.symbol}{walletStats.totalSent?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</h5>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="p-3 bg-success-subtle rounded-3 h-100">
                                        <div className="d-flex justify-content-between mb-2 text-success">
                                            <FaArrowDown />
                                            <span className="small fw-bold">Total Received</span>
                                        </div>
                                        <h5 className="fw-bold mb-0">{selectedWallet.symbol}{walletStats.totalReceived?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</h5>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="p-3 bg-primary-subtle rounded-3 h-100">
                                        <div className="d-flex justify-content-between mb-2 text-primary">
                                            <FaHistory />
                                            <span className="small fw-bold">Transactions</span>
                                        </div>
                                        <h5 className="fw-bold mb-0">{walletStats.transactionCount || 0}</h5>
                                    </div>
                                </Col>
                            </Row>

                            {/* Action Buttons */}
                            <div className="d-grid gap-2 d-md-flex justify-content-md-between mb-4">
                                <Button as={Link} to="/transfer" className="flex-grow-1 btn-lg btn-gradient border-0 d-flex align-items-center justify-content-center gap-2">
                                    <FaArrowRight /> Send
                                </Button>
                                <Button onClick={() => handleOpenReceive(selectedWallet)} className="flex-grow-1 btn-lg btn-light border d-flex align-items-center justify-content-center gap-2">
                                    <FaArrowDown /> Receive
                                </Button>
                                <Button as={Link} to="/convert" className="flex-grow-1 btn-lg btn-light border d-flex align-items-center justify-content-center gap-2">
                                    <FaSync /> Convert
                                </Button>
                            </div>

                            {/* Recent Transactions in Modal */}
                            <h6 className="fw-bold mb-3">Recent Transactions</h6>
                            <div className="mb-3">
                                {transactions.length === 0 ? <p className="text-muted small">No recent transactions.</p> :
                                    transactions.slice(0, 5).map(tx => (
                                        <div key={tx.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${tx.type === 'DEPOSIT' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`} style={{ width: '32px', height: '32px' }}>
                                                    {tx.type === 'DEPOSIT' ? <FaArrowDown size={12} /> : <FaArrowRight size={12} />}
                                                </div>
                                                <div>
                                                    <div className="small fw-bold">{tx.description}</div>
                                                    <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>{new Date(tx.timestamp).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className={`fw-bold small ${tx.type === 'DEPOSIT' ? 'text-success' : 'text-dark'}`}>
                                                {tx.type === 'DEPOSIT' ? '+' : '-'}{selectedWallet.symbol}{tx.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className="text-center">
                                <Link to="/transactions" className="text-decoration-none small fw-bold">View Full History</Link>
                            </div>

                        </Modal.Body>
                    </>
                )}
            </Modal>

            {/* Receive / Add Funds Modal */}
            <Modal show={showReceiveModal} onHide={() => setShowReceiveModal(false)} centered contentClassName="border-0 shadow-lg" backdrop="static">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Add Funds</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pb-4">
                    {!clientSecret ? (
                        <div className="text-center">
                            <p className="text-muted mb-4">Enter amount to add via Stripe Test</p>
                            <div className="input-group mb-3">
                                <span className="input-group-text">{selectedWallet?.symbol}</span>
                                <Form.Control
                                    type="number"
                                    placeholder="0.00"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                />
                            </div>
                            <Button className="w-100 btn-gradient" onClick={initPayment} disabled={!paymentAmount}>Proceed to Payment</Button>
                        </div>
                    ) : (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <CheckoutForm amount={paymentAmount} wallet={selectedWallet} onSuccess={onPaymentSuccess} />
                        </Elements>
                    )}
                </Modal.Body>
            </Modal>
        </DashboardLayout>
    );
};

export default DashboardPage;
