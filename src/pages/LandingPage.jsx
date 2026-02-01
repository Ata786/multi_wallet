import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaWallet, FaChartLine, FaShieldAlt, FaUserShield } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/NavBar';

const LandingPage = () => {
    return (
        <div className="bg-gradient-landing">
            <AppNavbar />
            <Container className="py-4 py-md-5 text-center text-white px-3 px-md-4">
                <Row className="justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <Col lg={8} className="px-2 px-md-3">
                        <h1 className="display-5 display-md-3 fw-bold mb-3 mb-md-4 landing-title">Manage Multiple Currencies in One Place</h1>
                        <p className="lead mb-4 mb-md-5 fs-6 fs-md-4 landing-subtitle" style={{ opacity: 0.9 }}>
                            Real-time exchange rates, instant transfers, and fraud protection.
                            The smarter way to bank globally.
                        </p>
                        <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 justify-content-center mb-4 mb-md-5 px-3 px-sm-0">
                            <Button as={Link} to="/login" variant="outline-light" size="lg" className="px-4 px-sm-5 py-2 rounded-pill landing-btn">Login</Button>
                            <Button as={Link} to="/register" variant="light" size="lg" className="px-4 px-sm-5 py-2 rounded-pill text-primary fw-bold landing-btn">Get Started</Button>
                        </div>
                    </Col>
                </Row>

                <Row className="g-4 pb-5 justify-content-center">
                    <Col md={6} lg={3}>
                        <Card className="h-100 glass-card text-dark border-0">
                            <Card.Body className="p-4">
                                <div className="mb-3 text-primary-custom fs-1"><FaWallet /></div>
                                <h5 className="fw-bold">Multi-currency wallets</h5>
                                <p className="text-muted small">Hold and exchange 30+ currencies in seconds with your own IBAN.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="h-100 glass-card text-dark border-0">
                            <Card.Body className="p-4">
                                <div className="mb-3 text-primary-custom fs-1"><FaChartLine /></div>
                                <h5 className="fw-bold">Real-time Rates</h5>
                                <p className="text-muted small">Get the real exchange rate without hidden markups or fees.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="h-100 glass-card text-dark border-0">
                            <Card.Body className="p-4">
                                <div className="mb-3 text-primary-custom fs-1"><FaShieldAlt /></div>
                                <h5 className="fw-bold">Secure Transactions</h5>
                                <p className="text-muted small">Your money is safeguarded by leading banks and regulatory bodies.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="h-100 glass-card text-dark border-0">
                            <Card.Body className="p-4">
                                <div className="mb-3 text-primary-custom fs-1"><FaUserShield /></div>
                                <h5 className="fw-bold">24/7 Fraud Detect</h5>
                                <p className="text-muted small">AI-powered security monitoring keeps your account safe around the clock.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};
export default LandingPage;
