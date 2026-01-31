import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaArrowRight, FaSync, FaList, FaDownload, FaWallet, FaArrowUp, FaArrowDown, FaExchangeAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaCopy } from 'react-icons/fa';
import Select from 'react-select';
import DashboardLayout from '../components/DashboardLayout';

const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar 🇺🇸', symbol: '$', code: 'USD' },
    { value: 'EUR', label: 'EUR - Euro 🇪🇺', symbol: '€', code: 'EUR' },
    { value: 'GBP', label: 'GBP - British Pound 🇬🇧', symbol: '£', code: 'GBP' },
    { value: 'INR', label: 'INR - Indian Rupee 🇮🇳', symbol: '₹', code: 'INR' },
    { value: 'JPY', label: 'JPY - Japanese Yen 🇯🇵', symbol: '¥', code: 'JPY' },
    { value: 'AUD', label: 'AUD - Australian Dollar 🇦🇺', symbol: 'A$', code: 'AUD' },
    { value: 'CAD', label: 'CAD - Canadian Dollar 🇨🇦', symbol: 'C$', code: 'CAD' },
];

const DashboardPage = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [wallets, setWallets] = useState([
        { id: 1, currency: 'USD', symbol: '$', balance: 1250.50, change: 2.5, flag: '🇺🇸', name: 'US Dollar Wallet' },
        { id: 2, currency: 'EUR', symbol: '€', balance: 800.00, change: -1.2, flag: '🇪🇺', name: 'Euro Wallet' },
        { id: 3, currency: 'INR', symbol: '₹', balance: 5000.00, change: 0.8, flag: '🇮🇳', name: 'Indian Rupee Wallet' },
    ]);
    const [newWalletCurrency, setNewWalletCurrency] = useState(null);
    const [initialDeposit, setInitialDeposit] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateWallet = () => {
        if (!newWalletCurrency) return;
        setIsCreating(true);
        setTimeout(() => {
            const newWallet = {
                id: wallets.length + 1,
                currency: newWalletCurrency.code,
                symbol: newWalletCurrency.symbol,
                balance: parseFloat(initialDeposit) || 0,
                change: 0,
                flag: newWalletCurrency.label.split(' ').pop(),
                name: newWalletCurrency.label.split('-')[1].trim() + ' Wallet'
            };
            setWallets([...wallets, newWallet]);
            setIsCreating(false);
            setShowCreateModal(false);
            setNewWalletCurrency(null);
            setInitialDeposit('');
        }, 1500);
    };

    const handleViewDetails = (wallet) => {
        setSelectedWallet(wallet);
        setShowWalletModal(true);
    };

    return (
        <DashboardLayout>
            <Container className="py-4">
                {/* Welcome Section */}
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Welcome back, Arslan! 👋</h2>
                        <p className="text-muted mb-0">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Wallet Overview */}
                <h5 className="fw-bold text-muted mb-3">Your Wallets</h5>
                <Row className="g-4 mb-5">
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

                {/* Recent Transactions */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold mb-0">Recent Activity</h5>
                        <Link to="/transactions" className="text-decoration-none small fw-bold">View All</Link>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {[
                            { id: 1, desc: 'Converted USD to EUR', amount: '-$100.00', date: 'Today, 10:23 AM', icon: <FaSync />, color: 'bg-primary-subtle text-primary', amountColor: 'text-dark' },
                            { id: 2, desc: 'Received from John Doe', amount: '+$500.00', date: 'Yesterday, 4:15 PM', icon: <FaArrowDown />, color: 'bg-success-subtle text-success', amountColor: 'text-success' },
                            { id: 3, desc: 'Netflix Subscription', amount: '-$15.99', date: 'Jan 28, 2026', icon: <FaWallet />, color: 'bg-danger-subtle text-danger', amountColor: 'text-danger' },
                            { id: 4, desc: 'Transfer to Savings', amount: '-$200.00', date: 'Jan 25, 2026', icon: <FaArrowRight />, color: 'bg-warning-subtle text-warning', amountColor: 'text-dark' },
                            { id: 5, desc: 'Freelance Payment', amount: '+$1,200.00', date: 'Jan 20, 2026', icon: <FaArrowDown />, color: 'bg-success-subtle text-success', amountColor: 'text-success' },
                        ].map((tx, index) => (
                            <div key={tx.id} className={`d-flex align-items-center p-3 ${index !== 4 ? 'border-bottom' : ''} hover-bg-light`}>
                                <div className={`rounded-circle p-2 me-3 d-flex align-items-center justify-content-center ${tx.color}`} style={{ width: '40px', height: '40px' }}>
                                    {tx.icon}
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-0 fw-semibold">{tx.desc}</h6>
                                    <small className="text-muted">{tx.date}</small>
                                </div>
                                <div className={`fw-bold ${tx.amountColor}`}>
                                    {tx.amount}
                                </div>
                            </div>
                        ))}
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
                                        <span>ID: {Math.floor(Math.random() * 10000000)}</span>
                                        <FaCopy className="cursor-pointer" title="Copy ID" />
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        <FaCheckCircle className="text-success" />
                                        <span>Active</span>
                                    </div>
                                    <span>Created: Jan 2026</span>
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
                                        <h5 className="fw-bold mb-0">{selectedWallet.symbol}1,234.00</h5>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="p-3 bg-success-subtle rounded-3 h-100">
                                        <div className="d-flex justify-content-between mb-2 text-success">
                                            <FaArrowDown />
                                            <span className="small fw-bold">Total Received</span>
                                        </div>
                                        <h5 className="fw-bold mb-0">{selectedWallet.symbol}5,678.00</h5>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="p-3 bg-primary-subtle rounded-3 h-100">
                                        <div className="d-flex justify-content-between mb-2 text-primary">
                                            <FaHistory />
                                            <span className="small fw-bold">Transactions</span>
                                        </div>
                                        <h5 className="fw-bold mb-0">145</h5>
                                    </div>
                                </Col>
                            </Row>

                            {/* Action Buttons */}
                            <div className="d-grid gap-2 d-md-flex justify-content-md-between mb-4">
                                <Button as={Link} to="/transfer" className="flex-grow-1 btn-lg btn-gradient border-0 d-flex align-items-center justify-content-center gap-2">
                                    <FaArrowRight /> Send
                                </Button>
                                <Button className="flex-grow-1 btn-lg btn-light border d-flex align-items-center justify-content-center gap-2">
                                    <FaArrowDown /> Receive
                                </Button>
                                <Button as={Link} to="/convert" className="flex-grow-1 btn-lg btn-light border d-flex align-items-center justify-content-center gap-2">
                                    <FaSync /> Convert
                                </Button>
                            </div>

                            {/* Recent Transactions in Modal */}
                            <h6 className="fw-bold mb-3">Recent Transactions</h6>
                            <div className="mb-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${i % 2 === 0 ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`} style={{ width: '32px', height: '32px' }}>
                                                {i % 2 === 0 ? <FaArrowDown size={12} /> : <FaArrowRight size={12} />}
                                            </div>
                                            <div>
                                                <div className="small fw-bold">{i % 2 === 0 ? 'Received Funds' : 'Sent Payment'}</div>
                                                <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Jan {10 + i}, 10:30 AM</div>
                                            </div>
                                        </div>
                                        <div className={`fw-bold small ${i % 2 === 0 ? 'text-success' : 'text-dark'}`}>
                                            {i % 2 === 0 ? '+' : '-'}{selectedWallet.symbol}{100 * i}.00
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
        </DashboardLayout>
    );
};

export default DashboardPage;
