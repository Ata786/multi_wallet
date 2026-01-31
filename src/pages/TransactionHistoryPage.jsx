import React, { useState } from 'react';
import { Container, Card, Table, Form, Row, Col, Button, Pagination, Badge, Modal, InputGroup } from 'react-bootstrap';
import { FaSearch, FaFileCsv, FaFilePdf, FaEye, FaArrowLeft, FaFilter } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import DashboardLayout from '../components/DashboardLayout';

const MOCK_TRANSACTIONS = Array.from({ length: 45 }).map((_, i) => ({
    id: `TRX-${10000 + i}`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i % 10)),
    type: i % 4 === 0 ? 'Transfer' : i % 4 === 1 ? 'Conversion' : i % 4 === 2 ? 'Deposit' : 'Withdrawal',
    from: i % 2 === 0 ? 'USD Wallet' : 'EUR Wallet',
    to: i % 4 === 0 ? 'John Doe' : i % 4 === 1 ? 'USD Wallet' : 'External Bank',
    amount: (Math.random() * 1000).toFixed(2),
    currency: i % 2 === 0 ? 'USD' : 'EUR',
    symbol: i % 2 === 0 ? '$' : '€',
    status: i % 10 === 0 ? 'Failed' : i % 10 === 1 ? 'Pending' : 'Success',
    note: 'Payment for services'
}));

const TransactionHistoryPage = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
    const [showModal, setShowModal] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [search, setSearch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleTxClick = (tx) => {
        setSelectedTx(tx);
        setShowModal(true);
    };

    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        setFilterType('All');
        setSearch('');
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesType = filterType === 'All' || tx.type === filterType;
        const matchesSearch = tx.id.toLowerCase().includes(search.toLowerCase()) || tx.note.toLowerCase().includes(search.toLowerCase());
        const matchesDate = (!startDate || tx.date >= startDate) && (!endDate || tx.date <= endDate);
        return matchesType && matchesSearch && matchesDate;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Success': return <Badge bg="success">Success</Badge>;
            case 'Pending': return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'Failed': return <Badge bg="danger">Failed</Badge>;
            default: return <Badge bg="secondary">Unknown</Badge>;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Transfer': return 'text-primary';
            case 'Conversion': return 'text-info';
            case 'Deposit': return 'text-success';
            case 'Withdrawal': return 'text-danger';
            default: return 'text-dark';
        }
    };

    return (
        <DashboardLayout>
            <Container className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Transaction History</h2>
                        <p className="text-muted mb-0">View and manage all your transactions</p>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-3 shadow-sm mb-4">
                    <Row className="g-3 align-items-center">
                        <Col lg={3} md={6}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                <Form.Control
                                    className="border-start-0 bg-light shadow-none"
                                    placeholder="Search ID or note..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col lg={2} md={3}>
                            <div className="d-flex align-items-center gap-2 border bg-light rounded px-2">
                                <span className="text-muted small px-1">From</span>
                                <DatePicker
                                    selected={startDate}
                                    onChange={date => setStartDate(date)}
                                    className="form-control border-0 bg-transparent shadow-none p-1 sm-date-input"
                                    placeholderText="Start Date"
                                    calendarClassName="shadow-lg border-0"
                                />
                            </div>
                        </Col>
                        <Col lg={2} md={3}>
                            <div className="d-flex align-items-center gap-2 border bg-light rounded px-2">
                                <span className="text-muted small px-1">To</span>
                                <DatePicker
                                    selected={endDate}
                                    onChange={date => setEndDate(date)}
                                    className="form-control border-0 bg-transparent shadow-none p-1 sm-date-input"
                                    placeholderText="End Date"
                                    calendarClassName="shadow-lg border-0"
                                />
                            </div>
                        </Col>
                        <Col lg={2} md={6}>
                            <Form.Select className="bg-light shadow-none cursor-pointer" value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="All">All Types</option>
                                <option value="Transfer">Transfers</option>
                                <option value="Conversion">Conversions</option>
                                <option value="Deposit">Deposits</option>
                                <option value="Withdrawal">Withdrawals</option>
                            </Form.Select>
                        </Col>
                        <Col lg={3} md={6} className="d-flex gap-2 justify-content-end">
                            <Button variant="outline-secondary" onClick={handleReset} title="Reset Filters"><FaFilter /></Button>
                            <Button variant="outline-success" title="Export CSV"><FaFileCsv /></Button>
                            <Button variant="outline-danger" title="Export PDF"><FaFilePdf /></Button>
                        </Col>
                    </Row>
                </div>

                <Card className="border-0 shadow-sm overflow-hidden">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 py-3 ps-4 text-muted small fw-bold text-uppercase">Date & Time</th>
                                <th className="border-0 py-3 text-muted small fw-bold text-uppercase">Transaction ID</th>
                                <th className="border-0 py-3 text-muted small fw-bold text-uppercase">Type</th>
                                <th className="border-0 py-3 text-muted small fw-bold text-uppercase">From / To</th>
                                <th className="border-0 py-3 text-muted small fw-bold text-uppercase">Amount</th>
                                <th className="border-0 py-3 text-muted small fw-bold text-uppercase text-center">Status</th>
                                <th className="border-0 py-3 pe-4 text-end text-muted small fw-bold text-uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map(tx => (
                                    <tr
                                        key={tx.id}
                                        className="cursor-pointer transition-all"
                                        style={{ borderLeft: `4px solid ${tx.status === 'Success' ? '#198754' : tx.status === 'Failed' ? '#dc3545' : '#ffc107'}` }}
                                        onClick={() => handleTxClick(tx)}
                                    >
                                        <td className="ps-4">
                                            <div className="fw-semibold text-dark">{tx.date.toLocaleDateString()}</div>
                                            <small className="text-muted">{tx.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                        </td>
                                        <td>
                                            <span className="font-monospace bg-light rounded px-2 py-1 small text-dark">{tx.id}</span>
                                        </td>
                                        <td>
                                            <span className={`fw-semibold ${getTypeColor(tx.type)}`}>{tx.type}</span>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column small">
                                                <span className="text-muted">From: <strong className="text-dark">{tx.from}</strong></span>
                                                <span className="text-muted">To: <strong className="text-dark">{tx.to}</strong></span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`fw-bold ${['Withdrawal', 'Transfer'].includes(tx.type) ? 'text-danger' : 'text-success'}`}>
                                                {['Withdrawal', 'Transfer'].includes(tx.type) ? '-' : '+'}{tx.symbol}{tx.amount}
                                            </span>
                                        </td>
                                        <td className="text-center">{getStatusBadge(tx.status)}</td>
                                        <td className="pe-4 text-end">
                                            <Button variant="light" size="sm" className="rounded-circle btn-icon"><FaEye className="text-secondary" /></Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="text-muted">
                                            <h5 className="mt-3">No transactions found</h5>
                                            <p>Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                        <span className="text-muted small">Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transactions</span>
                        <div>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>
            </Container>

            {/* Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg">
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fw-bold fs-5">Transaction Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedTx && (
                        <div>
                            <div className="text-center mb-4">
                                <h2 className={`fw-bold mb-1 ${['Withdrawal', 'Transfer'].includes(selectedTx.type) ? 'text-danger' : 'text-success'}`}>
                                    {['Withdrawal', 'Transfer'].includes(selectedTx.type) ? '-' : '+'}{selectedTx.symbol}{selectedTx.amount}
                                </h2>
                                <span className="text-muted">{selectedTx.type} • {selectedTx.date.toLocaleString()}</span>
                            </div>

                            <Card className="bg-light border-0 mb-4">
                                <Card.Body>
                                    <Row className="mb-2">
                                        <Col xs={5} className="text-muted">Status</Col>
                                        <Col xs={7} className="fw-bold text-end">{getStatusBadge(selectedTx.status)}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col xs={5} className="text-muted">Transaction ID</Col>
                                        <Col xs={7} className="text-end font-monospace small bg-white rounded px-2 user-select-all border">{selectedTx.id}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col xs={5} className="text-muted">From</Col>
                                        <Col xs={7} className="text-end fw-semibold">{selectedTx.from}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col xs={5} className="text-muted">To</Col>
                                        <Col xs={7} className="text-end fw-semibold">{selectedTx.to}</Col>
                                    </Row>
                                    <hr className="my-2" />
                                    <Row>
                                        <Col xs={5} className="text-muted">Note</Col>
                                        <Col xs={7} className="text-end small">{selectedTx.note}</Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <div className="d-grid gap-2">
                                <Button variant="primary" className="btn-gradient">Download Receipt</Button>
                                <Button variant="link" className="text-danger text-decoration-none">Report an Issue</Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </DashboardLayout>
    );
};

export default TransactionHistoryPage;
