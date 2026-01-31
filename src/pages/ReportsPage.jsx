import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, ProgressBar, Table, Badge, Spinner } from 'react-bootstrap';
import { FaFileAlt, FaChartBar, FaChartLine, FaCalendarAlt, FaDownload, FaFilePdf, FaFileCsv, FaArrowUp, FaArrowDown, FaExchangeAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import DashboardLayout from '../components/DashboardLayout';
import authService from '../services/authService';

const ReportsPage = () => {
    const [user] = useState(authService.getCurrentUser());
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    // Summary data
    const [summary, setSummary] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [exportedData, setExportedData] = useState([]);

    useEffect(() => {
        if (user) {
            loadReports();
        }
    }, [user]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [summaryData, monthlyData] = await Promise.all([
                authService.getReportSummary(user.id),
                authService.getMonthlyReport(user.id)
            ]);
            setSummary(summaryData);
            setMonthlyReport(monthlyData);
        } catch (err) {
            console.error('Failed to load reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateDaily = async () => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        await generateReport(dateStr, dateStr, 'Daily Summary');
    };

    const handleGenerateWeekly = async () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        await generateReport(start.toISOString().split('T')[0], end.toISOString().split('T')[0], 'Weekly Report');
    };

    const handleGenerateMonthly = async () => {
        const end = new Date();
        const start = new Date();
        start.setDate(1);
        await generateReport(start.toISOString().split('T')[0], end.toISOString().split('T')[0], 'Monthly Report');
    };

    const handleGenerateCustom = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        await generateReport(startStr, endStr, 'Custom Report');
        setShowModal(false);
    };

    const generateReport = async (start, end, name) => {
        setIsGenerating(true);
        setProgress(0);

        // Simulate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        try {
            const data = await authService.exportTransactions(user.id, start, end);
            setExportedData(data);
            setProgress(100);

            // Download as CSV
            downloadCSV(data, name);

        } catch (err) {
            alert('Failed to generate report');
        } finally {
            setTimeout(() => {
                setIsGenerating(false);
                setProgress(0);
            }, 1000);
        }
    };

    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert('No transactions found for this date range');
            return;
        }

        const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Description', 'Status'];
        const csvContent = [
            headers.join(','),
            ...data.map(t => [
                t.id,
                `"${t.date}"`,
                t.type,
                t.amount,
                t.currency || '',
                `"${t.description || ''}"`,
                t.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Container className="py-5 text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-3">Loading reports...</p>
                </Container>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Container className="py-4">
                <div className="mb-4">
                    <h2 className="fw-bold mb-1">Reports & Analytics</h2>
                    <p className="text-muted mb-0">Generate and download transaction reports</p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <Row className="g-4 mb-4">
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="text-center p-4">
                                    <div className="rounded-circle bg-success-subtle text-success d-inline-flex p-3 mb-3">
                                        <FaArrowDown size={24} />
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1">Total Received</h6>
                                    <h4 className="fw-bold text-success mb-0">${summary.totalReceived?.toLocaleString() || 0}</h4>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="text-center p-4">
                                    <div className="rounded-circle bg-danger-subtle text-danger d-inline-flex p-3 mb-3">
                                        <FaArrowUp size={24} />
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1">Total Sent</h6>
                                    <h4 className="fw-bold text-danger mb-0">${summary.totalSent?.toLocaleString() || 0}</h4>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="text-center p-4">
                                    <div className="rounded-circle bg-info-subtle text-info d-inline-flex p-3 mb-3">
                                        <FaExchangeAlt size={24} />
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1">Converted</h6>
                                    <h4 className="fw-bold text-info mb-0">${summary.totalConverted?.toLocaleString() || 0}</h4>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="text-center p-4">
                                    <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex p-3 mb-3">
                                        <FaChartBar size={24} />
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1">Total Transactions</h6>
                                    <h4 className="fw-bold text-primary mb-0">{summary.totalTransactions || 0}</h4>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Monthly Report */}
                {monthlyReport && (
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4">
                                {monthlyReport.monthName} {monthlyReport.year} Summary
                            </h5>
                            <Row className="g-4">
                                <Col md={4}>
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="text-muted small mb-1">Monthly Inflow</div>
                                        <div className="h5 fw-bold text-success mb-0">+${monthlyReport.totalReceived?.toLocaleString() || 0}</div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="text-muted small mb-1">Monthly Outflow</div>
                                        <div className="h5 fw-bold text-danger mb-0">-${monthlyReport.totalSent?.toLocaleString() || 0}</div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="text-muted small mb-1">Net Flow</div>
                                        <div className={`h5 fw-bold mb-0 ${monthlyReport.netFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {monthlyReport.netFlow >= 0 ? '+' : ''}${monthlyReport.netFlow?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}

                {/* Report Generation Cards */}
                <Row className="g-4 mb-5">
                    {[
                        { title: 'Daily Summary', desc: "Complete breakdown of today's activity", icon: <FaFileAlt />, color: 'primary', action: handleGenerateDaily },
                        { title: 'Weekly Report', desc: "Last 7 days transaction overview", icon: <FaChartBar />, color: 'success', action: handleGenerateWeekly },
                        { title: 'Monthly Report', desc: "Comprehensive monthly analysis", icon: <FaChartLine />, color: 'info', action: handleGenerateMonthly },
                        { title: 'Custom Range', desc: "Select your own date range", icon: <FaCalendarAlt />, color: 'warning', action: () => setShowModal(true), isConfig: true }
                    ].map((item, idx) => (
                        <Col md={6} lg={3} key={idx}>
                            <Card className="h-100 border-0 shadow-sm text-center hover-scale transition-all">
                                <Card.Body className="p-4 d-flex flex-column align-items-center">
                                    <div className={`rounded-circle p-3 mb-3 bg-${item.color}-subtle text-${item.color}`}>
                                        <div className="fs-2">{item.icon}</div>
                                    </div>
                                    <h5 className="fw-bold">{item.title}</h5>
                                    <p className="text-muted small mb-4">{item.desc}</p>
                                    <Button
                                        variant={`outline-${item.color}`}
                                        className="mt-auto px-4 rounded-pill fw-bold"
                                        onClick={item.action}
                                        disabled={isGenerating && !item.isConfig}
                                    >
                                        {item.isConfig ? 'Configure' : (isGenerating ? <Spinner size="sm" /> : 'Generate')}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Progress Bar */}
                {isGenerating && (
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="fw-bold text-primary">Generating Report...</span>
                                <span className="text-muted">{progress}%</span>
                            </div>
                            <ProgressBar now={progress} animated variant="primary" style={{ height: '10px' }} />
                        </Card.Body>
                    </Card>
                )}

                {/* Wallet Breakdown */}
                {summary?.wallets && summary.wallets.length > 0 && (
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h5 className="fw-bold mb-0">Wallet Breakdown</h5>
                        </Card.Header>
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="py-3 ps-4 text-muted small fw-bold">Wallet</th>
                                    <th className="py-3 text-muted small fw-bold">Currency</th>
                                    <th className="py-3 text-end pe-4 text-muted small fw-bold">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.wallets.map(wallet => (
                                    <tr key={wallet.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <span className="fs-4">{wallet.flag}</span>
                                                <span className="fw-semibold">{wallet.currency} Wallet</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="light" text="dark">{wallet.currency}</Badge>
                                        </td>
                                        <td className="pe-4 text-end fw-bold">
                                            {wallet.symbol}{wallet.balance?.toLocaleString() || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                )}
            </Container>

            {/* Custom Report Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Generate Custom Report</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Select Date Range</Form.Label>
                            <div className="d-flex gap-2">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    className="form-control"
                                    placeholderText="From"
                                />
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    className="form-control"
                                    placeholderText="To"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Export Format</Form.Label>
                            <div className="d-flex gap-3">
                                <Button variant="outline-success" className="d-flex align-items-center gap-2 flex-fill justify-content-center" disabled>
                                    <FaFileCsv /> CSV
                                </Button>
                            </div>
                            <Form.Text className="text-muted">Transactions will be exported as CSV file</Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 pb-4 pe-4">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" className="btn-gradient px-4" onClick={handleGenerateCustom}>Generate Report</Button>
                </Modal.Footer>
            </Modal>
        </DashboardLayout>
    );
};

export default ReportsPage;
