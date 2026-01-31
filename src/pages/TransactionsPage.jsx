import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Dropdown } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp, FaSync, FaFilter, FaFileDownload, FaFilePdf, FaFileCsv } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import authService from '../services/authService';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [user] = useState(authService.getCurrentUser());

    // Filters
    const [filterType, setFilterType] = useState('ALL');
    const [filterWallet, setFilterWallet] = useState('ALL');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            authService.getUserTransactions(user.id).then(data => {
                setTransactions(data);
                setFilteredTransactions(data);
            }).catch(console.error);

            authService.getWallets(user.id).then(data => setWallets(data)).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        let result = [...transactions];

        // Type filter
        if (filterType !== 'ALL') {
            result = result.filter(tx => tx.type === filterType);
        }

        // Wallet filter
        if (filterWallet !== 'ALL') {
            result = result.filter(tx => tx.walletId === parseInt(filterWallet));
        }

        // Date filters
        if (filterDateFrom) {
            result = result.filter(tx => new Date(tx.timestamp) >= new Date(filterDateFrom));
        }
        if (filterDateTo) {
            result = result.filter(tx => new Date(tx.timestamp) <= new Date(filterDateTo + 'T23:59:59'));
        }

        // Search
        if (searchQuery) {
            result = result.filter(tx =>
                tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.type?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredTransactions(result);
    }, [transactions, filterType, filterWallet, filterDateFrom, filterDateTo, searchQuery]);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'DEPOSIT': return <FaArrowDown className="text-success" />;
            case 'WITHDRAWAL': case 'TRANSFER': return <FaArrowUp className="text-danger" />;
            case 'CONVERSION': return <FaSync className="text-primary" />;
            default: return <FaSync />;
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'DEPOSIT': return <Badge bg="success-subtle" className="text-success">{type}</Badge>;
            case 'WITHDRAWAL': case 'TRANSFER': return <Badge bg="danger-subtle" className="text-danger">{type}</Badge>;
            case 'CONVERSION': return <Badge bg="primary-subtle" className="text-primary">{type}</Badge>;
            default: return <Badge bg="secondary">{type}</Badge>;
        }
    };

    const exportCSV = () => {
        const headers = ['ID', 'Type', 'Amount', 'Description', 'Date', 'Status', 'Wallet'];
        const rows = filteredTransactions.map(tx => [
            tx.id,
            tx.type,
            tx.amount,
            tx.description,
            new Date(tx.timestamp).toLocaleString(),
            tx.status,
            tx.walletCurrency
        ]);

        let csvContent = headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportPDF = () => {
        // Create a simple printable HTML for PDF
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Transaction Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background: #f5f5f5; }
                        .deposit { color: green; }
                        .withdrawal { color: red; }
                    </style>
                </head>
                <body>
                    <h1>Transaction History</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                    <p>Total Transactions: ${filteredTransactions.length}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredTransactions.map(tx => `
                                <tr>
                                    <td>${tx.id}</td>
                                    <td class="${tx.type === 'DEPOSIT' ? 'deposit' : 'withdrawal'}">${tx.type}</td>
                                    <td>${tx.amount.toFixed(2)}</td>
                                    <td>${tx.description || '-'}</td>
                                    <td>${new Date(tx.timestamp).toLocaleString()}</td>
                                    <td>${tx.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const resetFilters = () => {
        setFilterType('ALL');
        setFilterWallet('ALL');
        setFilterDateFrom('');
        setFilterDateTo('');
        setSearchQuery('');
    };

    return (
        <DashboardLayout>
            <Container className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0">Transaction History</h2>
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center gap-2">
                            <FaFileDownload /> Export
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={exportCSV} className="d-flex align-items-center gap-2">
                                <FaFileCsv /> Export as CSV
                            </Dropdown.Item>
                            <Dropdown.Item onClick={exportPDF} className="d-flex align-items-center gap-2">
                                <FaFilePdf /> Export as PDF
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <FaFilter className="text-muted" />
                            <span className="fw-bold">Filters</span>
                            <Button variant="link" size="sm" onClick={resetFilters}>Reset</Button>
                        </div>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Label className="small fw-semibold">Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search description..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </Col>
                            <Col md={2}>
                                <Form.Label className="small fw-semibold">Type</Form.Label>
                                <Form.Select value={filterType} onChange={e => setFilterType(e.target.value)}>
                                    <option value="ALL">All Types</option>
                                    <option value="DEPOSIT">Deposit</option>
                                    <option value="WITHDRAWAL">Withdrawal</option>
                                    <option value="TRANSFER">Transfer</option>
                                    <option value="CONVERSION">Conversion</option>
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Form.Label className="small fw-semibold">Wallet</Form.Label>
                                <Form.Select value={filterWallet} onChange={e => setFilterWallet(e.target.value)}>
                                    <option value="ALL">All Wallets</option>
                                    {wallets.map(w => (
                                        <option key={w.id} value={w.id}>{w.currency}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Form.Label className="small fw-semibold">From Date</Form.Label>
                                <Form.Control type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
                            </Col>
                            <Col md={2}>
                                <Form.Label className="small fw-semibold">To Date</Form.Label>
                                <Form.Control type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Transactions Table */}
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No transactions found.</p>
                            </div>
                        ) : (
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-4">Type</th>
                                        <th className="border-0">Description</th>
                                        <th className="border-0">Wallet</th>
                                        <th className="border-0">Amount</th>
                                        <th className="border-0">Date</th>
                                        <th className="border-0 pe-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${tx.type === 'DEPOSIT' ? 'bg-success-subtle' : 'bg-danger-subtle'}`} style={{ width: '36px', height: '36px' }}>
                                                        {getTypeIcon(tx.type)}
                                                    </div>
                                                    {getTypeBadge(tx.type)}
                                                </div>
                                            </td>
                                            <td className="align-middle">
                                                <span className="fw-semibold">{tx.description || '-'}</span>
                                            </td>
                                            <td className="align-middle">
                                                <Badge bg="light" className="text-dark">{tx.walletCurrency || '-'}</Badge>
                                            </td>
                                            <td className="align-middle">
                                                <span className={`fw-bold ${tx.type === 'DEPOSIT' ? 'text-success' : 'text-danger'}`}>
                                                    {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="align-middle text-muted small">
                                                {new Date(tx.timestamp).toLocaleString()}
                                            </td>
                                            <td className="align-middle pe-4">
                                                <Badge bg={tx.status === 'SUCCESS' ? 'success' : 'warning'}>{tx.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                <div className="text-muted small mt-3">
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
            </Container>
        </DashboardLayout>
    );
};

export default TransactionsPage;
