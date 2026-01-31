import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, ProgressBar, Table, Badge } from 'react-bootstrap';
import { FaFileAlt, FaChartBar, FaChartLine, FaCalendarAlt, FaDownload, FaFilePdf, FaFileCsv, FaFileExcel, FaTimes, FaCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import DashboardLayout from '../components/DashboardLayout';

const REPORTS_HISTORY = [
    { id: 1, name: 'Monthly Statement - Jan 2026', type: 'PDF', range: 'Jan 1 - Jan 31', date: 'Jan 31, 2026', size: '1.2 MB', status: 'Ready' },
    { id: 2, name: 'Annual Tax Report 2025', type: 'CSV', range: 'Jan 1 2025 - Dec 31 2025', date: 'Jan 15, 2026', size: '450 KB', status: 'Ready' },
    { id: 3, name: 'Weekly Summary', type: 'PDF', range: 'Jan 20 - Jan 27', date: 'Jan 27, 2026', size: '800 KB', status: 'Failed' },
];

const ReportsPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [generatedReports, setGeneratedReports] = useState(REPORTS_HISTORY);

    const handleGenerate = () => {
        setIsGenerating(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsGenerating(false);
                    setShowModal(false);
                    const newReport = {
                        id: Date.now(),
                        name: 'Custom Report',
                        type: 'PDF',
                        range: 'Selected Range',
                        date: 'Just now',
                        size: '1.5 MB',
                        status: 'Ready'
                    };
                    setGeneratedReports([newReport, ...generatedReports]);
                    return 0;
                }
                return prev + 10;
            });
        }, 300);
    };

    return (
        <DashboardLayout>
            <Container className="py-4">
                <div className="mb-4">
                    <h2 className="fw-bold mb-1">Reports & Documents</h2>
                    <p className="text-muted mb-0">Generate and download transaction reports</p>
                </div>

                <Row className="g-4 mb-5">
                    {[
                        { title: 'Daily Summary', desc: "Complete breakdown of today's activity", icon: <FaFileAlt />, color: 'primary' },
                        { title: 'Weekly Report', desc: "Last 7 days transaction overview", icon: <FaChartBar />, color: 'success' },
                        { title: 'Monthly Report', desc: "Comprehensive monthly analysis", icon: <FaChartLine />, color: 'info' },
                        { title: 'Custom Range', desc: "Select your own date range", icon: <FaCalendarAlt />, color: 'warning', action: () => setShowModal(true) }
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
                                        onClick={item.action || handleGenerate}
                                        disabled={isGenerating && !item.action}
                                    >
                                        {item.action ? 'Configure' : 'Generate'}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom py-3">
                        <h5 className="fw-bold mb-0">Generated Reports</h5>
                    </Card.Header>
                    {isGenerating && (
                        <div className="p-4 border-bottom bg-light">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="fw-bold text-primary">Generating Report...</span>
                                <span className="text-muted">{progress}%</span>
                            </div>
                            <ProgressBar now={progress} animated variant="primary" style={{ height: '10px' }} />
                        </div>
                    )}
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-3 ps-4 text-muted small fw-bold">Report Name</th>
                                <th className="py-3 text-muted small fw-bold">Date Range</th>
                                <th className="py-3 text-muted small fw-bold">Generated On</th>
                                <th className="py-3 text-muted small fw-bold">Size</th>
                                <th className="py-3 text-muted small fw-bold">Status</th>
                                <th className="py-3 pe-4 text-end text-muted small fw-bold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generatedReports.map(report => (
                                <tr key={report.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="text-danger fs-5"><FaFilePdf /></div>
                                            <div>
                                                <div className="fw-semibold text-dark">{report.name}</div>
                                                <small className="text-muted">{report.type}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-muted small fw-semibold">{report.range}</td>
                                    <td className="text-muted small">{report.date}</td>
                                    <td className="text-muted small">{report.size}</td>
                                    <td>
                                        <Badge bg={report.status === 'Ready' ? 'success' : report.status === 'Processing' ? 'primary' : 'danger'}>
                                            {report.status}
                                        </Badge>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <Button variant="light" size="sm" className="btn-icon text-muted" disabled={report.status !== 'Ready'}>
                                            <FaDownload />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
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
                            <Form.Label className="fw-semibold">Include Data</Form.Label>
                            <div className="d-flex flex-column gap-2 border p-3 rounded bg-light">
                                <Form.Check type="checkbox" label="Transaction Details" defaultChecked />
                                <Form.Check type="checkbox" label="Fraud Alerts & Flags" />
                                <Form.Check type="checkbox" label="Daily Balance Summary" />
                                <Form.Check type="checkbox" label="Exchange Rate History" />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Format</Form.Label>
                            <div className="d-flex gap-3">
                                <Form.Check type="radio" name="format" label="PDF Document" defaultChecked />
                                <Form.Check type="radio" name="format" label="CSV (Excel)" />
                                <Form.Check type="radio" name="format" label="JSON Data" />
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 pb-4 pe-4">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" className="btn-gradient px-4" onClick={handleGenerate}>Generate Report</Button>
                </Modal.Footer>
            </Modal>
        </DashboardLayout>
    );
};

export default ReportsPage;
