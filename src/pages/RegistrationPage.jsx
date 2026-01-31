import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import registrationImg from '../assets/registration.png';
import authService from '../services/authService';

const RegistrationPage = () => {
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
    const [showPassword, setShowPassword] = React.useState(false);
    const password = watch('password', '');

    const navigate = useNavigate();
    const onSubmit = async (data) => {
        try {
            await authService.register(data.fullName, data.email, data.password, data.phone, data.country);
            alert('Registration Successful! Please login.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert('Registration failed: ' + error.message);
        }
    };

    const getPasswordStrength = (pass) => {
        if (!pass) return '';
        if (pass.length < 6) return <span className="text-danger small">Weak</span>;
        if (pass.length < 10) return <span className="text-warning small">Medium</span>;
        return <span className="text-success small">Strong</span>;
    };

    return (
        <div className="d-flex align-items-center min-vh-100 bg-light py-5">
            <Container>
                <Card className="shadow-lg border-0 overflow-hidden mx-auto" style={{ borderRadius: '20px', maxWidth: '1000px' }}>
                    <Row className="g-0">
                        <Col md={6} className="d-none d-md-flex bg-primary align-items-center justify-content-center p-0">
                            <img src={registrationImg} alt="Register" className="img-fluid w-100 h-100" style={{ objectFit: 'cover' }} />
                        </Col>
                        <Col md={6} className="p-5 bg-white">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary-custom">Create Your Account</h2>
                                <p className="text-muted">Start managing your multi-currency wallet</p>
                            </div>
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Form.Group className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 text-muted"><FaUser /></span>
                                        <Form.Control
                                            type="text"
                                            placeholder="Full Name"
                                            className="border-start-0 ps-0 shadow-none"
                                            {...register("fullName", { required: "Full name is required" })}
                                            isInvalid={!!errors.fullName}
                                        />
                                    </div>
                                    <div className="text-danger small mt-1">{errors.fullName?.message}</div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 text-muted"><FaEnvelope /></span>
                                        <Form.Control
                                            type="email"
                                            placeholder="Email Address"
                                            className="border-start-0 ps-0 shadow-none"
                                            {...register("email", {
                                                required: "Email is required",
                                                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                            })}
                                            isInvalid={!!errors.email}
                                        />
                                    </div>
                                    <div className="text-danger small mt-1">{errors.email?.message}</div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 text-muted"><FaPhone /></span>
                                        <Form.Control
                                            type="tel"
                                            placeholder="Phone Number"
                                            className="border-start-0 ps-0 shadow-none"
                                            {...register("phone", { required: "Phone is required" })}
                                            isInvalid={!!errors.phone}
                                        />
                                    </div>
                                    <div className="text-danger small mt-1">{errors.phone?.message}</div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Select
                                        {...register("country", { required: "Select country" })}
                                        isInvalid={!!errors.country}
                                        className="shadow-none"
                                    >
                                        <option value="">Select Country</option>
                                        <option value="USA">USA 🇺🇸</option>
                                        <option value="UK">UK 🇬🇧</option>
                                        <option value="India">India 🇮🇳</option>
                                        <option value="Germany">Germany 🇩🇪</option>
                                        <option value="Japan">Japan 🇯🇵</option>
                                    </Form.Select>
                                    <div className="text-danger small mt-1">{errors.country?.message}</div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 text-muted"><FaLock /></span>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            className="border-start-0 ps-0 border-end-0 shadow-none"
                                            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                                            isInvalid={!!errors.password}
                                        />
                                        <span className="input-group-text bg-white border-start-0 cursor-pointer text-muted" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-1">
                                        <div className="text-danger small">{errors.password?.message}</div>
                                        <div>{getPasswordStrength(password)}</div>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 text-muted"><FaLock /></span>
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="border-start-0 ps-0 shadow-none"
                                            {...register("confirmPassword", {
                                                validate: value => value === password || "Passwords do not match"
                                            })}
                                            isInvalid={!!errors.confirmPassword}
                                        />
                                    </div>
                                    <div className="text-danger small mt-1">{errors.confirmPassword?.message}</div>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Check
                                        type="checkbox"
                                        label="I agree to Terms & Conditions"
                                        {...register("terms", { required: "You must agree" })}
                                        isInvalid={!!errors.terms}
                                        feedback={errors.terms?.message}
                                        feedbackType="invalid"
                                    />
                                </Form.Group>

                                <Button type="submit" className="w-100 btn-gradient py-2 fw-bold text-uppercase" disabled={!isValid}>
                                    Create Account
                                </Button>

                                <div className="text-center mt-4">
                                    <small className="text-muted">Already have an account? <Link to="/login" className="text-primary-custom fw-bold text-decoration-none">Login</Link></small>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            </Container>
        </div>
    );
};
export default RegistrationPage;
