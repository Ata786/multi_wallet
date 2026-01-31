import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import loginImg from '../assets/login.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            if (email === 'test@example.com' && password === 'password') {
                navigate('/dashboard'); // Redirect to dashboard
            } else {
                setError('Invalid email or password.');
            }
        }, 2000);
    };

    return (
        <div className="d-flex align-items-center min-vh-100 bg-light py-5">
            <Container>
                <Card className="shadow-lg border-0 overflow-hidden mx-auto" style={{ borderRadius: '20px', maxWidth: '1000px' }}>
                    <Row className="g-0">
                        <Col md={6} className="d-none d-md-flex bg-dark align-items-center justify-content-center p-0 position-relative">
                            <div className="position-absolute w-100 h-100 bg-gradient-landing opacity-75" style={{ zIndex: 1 }}></div>
                            <img src={loginImg} alt="Login" className="img-fluid w-100 h-100 position-relative" style={{ objectFit: 'cover', zIndex: 0 }} />
                            <div className="position-absolute text-white text-center p-4" style={{ zIndex: 2 }}>
                                <h3 className="fw-bold">Global Banking</h3>
                                <p>Secure. Fast. Reliable.</p>
                            </div>
                        </Col>
                        <Col md={6} className="p-5 bg-white">
                            <div className="text-center mb-4">
                                <h3 className="fw-bold text-primary-custom">Welcome Back</h3>
                                <p className="text-muted">Login to manage your wallets</p>
                            </div>

                            {error && <Alert variant="danger" className="py-2 text-center small">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted fw-bold">Email Address</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 text-muted"><FaEnvelope /></span>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            className="border-start-0 ps-0 shadow-none bg-light"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted fw-bold">Password</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 text-muted"><FaLock /></span>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="border-start-0 ps-0 border-end-0 shadow-none bg-light"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <span className="input-group-text bg-light border-start-0 cursor-pointer text-muted" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                </Form.Group>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Form.Check type="checkbox" label="Remember me" className="small text-muted" />
                                    <Link to="/forgot-password" className="small text-decoration-none text-primary-custom fw-bold">Forgot Password?</Link>
                                </div>

                                <Button type="submit" className="w-100 btn-gradient py-2 fw-bold text-uppercase mb-3" disabled={isLoading}>
                                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Login'}
                                </Button>

                                <div className="d-flex align-items-center mb-3">
                                    <hr className="flex-grow-1" />
                                    <span className="px-3 text-muted small">OR</span>
                                    <hr className="flex-grow-1" />
                                </div>

                                <Button variant="light" className="w-100 border py-2 d-flex align-items-center justify-content-center gap-2 mb-4">
                                    <FaGoogle className="text-danger" />
                                    <span className="fw-semibold text-muted">Sign up with Google</span>
                                </Button>

                                <div className="text-center">
                                    <span className="text-muted small">Don't have an account? <Link to="/register" className="text-primary-custom fw-bold text-decoration-none">Sign Up</Link></span>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            </Container>
        </div>
    );
};
export default LoginPage;
