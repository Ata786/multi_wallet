import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaShieldAlt, FaCamera, FaCheck } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import authService from '../services/authService';

const COUNTRIES = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Japan', 'India', 'Pakistan', 'China', 'Brazil', 'Mexico'
];

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(authService.getCurrentUser());

    // Profile state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (user) {
            authService.getProfile(user.id).then(data => {
                setName(data.name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setCountry(data.country || '');
            }).catch(console.error);
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileSuccess('');
        setProfileError('');

        try {
            const result = await authService.updateProfile(user.id, { name, phone, country });
            setProfileSuccess(result.message || 'Profile updated successfully');
            setUser(authService.getCurrentUser()); // Refresh user data
        } catch (err) {
            setProfileError(err.message);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccess('');
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            setPasswordLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            setPasswordLoading(false);
            return;
        }

        try {
            const result = await authService.changePassword(user.id, currentPassword, newPassword);
            setPasswordSuccess(result.message || 'Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (!newPassword) return 0;
        let strength = 0;
        if (newPassword.length >= 6) strength += 25;
        if (newPassword.length >= 8) strength += 25;
        if (/[A-Z]/.test(newPassword)) strength += 25;
        if (/[0-9]/.test(newPassword)) strength += 25;
        return strength;
    };

    const renderProfileTab = () => (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5 position-relative d-inline-block start-50 translate-middle-x">
                    <div className="rounded-circle bg-primary bg-opacity-10 border d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '120px', height: '120px' }}>
                        <span className="display-4 text-primary fw-bold">{name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                    <Button variant="primary" size="sm" className="rounded-circle position-absolute bottom-0 end-0 border-2 border-white btn-icon shadow-sm">
                        <FaCamera />
                    </Button>
                </div>

                {profileSuccess && <Alert variant="success" className="d-flex align-items-center gap-2"><FaCheck /> {profileSuccess}</Alert>}
                {profileError && <Alert variant="danger">{profileError}</Alert>}

                <Form onSubmit={handleUpdateProfile}>
                    <Row className="g-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold small text-uppercase text-muted">Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="bg-light fw-bold border-0 py-2"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold small text-uppercase text-muted">Email Address</Form.Label>
                                <div className="input-group">
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        disabled
                                        className="bg-light border-0 py-2"
                                    />
                                    <span className="input-group-text bg-success-subtle text-success border-0 px-3 fw-bold small">Verified</span>
                                </div>
                                <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold small text-uppercase text-muted">Phone Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    className="bg-light border-0 py-2"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold small text-uppercase text-muted">Country</Form.Label>
                                <Form.Select
                                    value={country}
                                    onChange={e => setCountry(e.target.value)}
                                    className="bg-light border-0 py-2"
                                >
                                    <option value="">Select Country</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-5">
                        <Button
                            type="submit"
                            variant="primary"
                            className="btn-gradient px-4 py-2 fw-bold"
                            disabled={profileLoading}
                        >
                            {profileLoading ? <Spinner size="sm" /> : 'Save Changes'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    const renderSecurityTab = () => (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
                <h5 className="fw-bold mb-4">Change Password</h5>

                {passwordSuccess && <Alert variant="success" className="d-flex align-items-center gap-2"><FaCheck /> {passwordSuccess}</Alert>}
                {passwordError && <Alert variant="danger">{passwordError}</Alert>}

                <Form onSubmit={handleChangePassword}>
                    <Row className="g-3 mb-4">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Current Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                                <div className="progress mt-2" style={{ height: '4px' }}>
                                    <div
                                        className={`progress-bar ${getPasswordStrength() < 50 ? 'bg-danger' : getPasswordStrength() < 75 ? 'bg-warning' : 'bg-success'}`}
                                        style={{ width: `${getPasswordStrength()}%` }}
                                    />
                                </div>
                                <Form.Text className="text-muted small">
                                    {getPasswordStrength() < 50 ? 'Weak password' : getPasswordStrength() < 75 ? 'Medium strength' : 'Strong password'}
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Confirm New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <Form.Text className="text-danger">Passwords do not match</Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                        <Col xs={12} className="text-end">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                            >
                                {passwordLoading ? <Spinner size="sm" /> : 'Update Password'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );

    return (
        <DashboardLayout>
            <Container className="py-4">
                <Row className="gy-4">
                    <Col lg={3}>
                        <Card className="border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
                            <Card.Body className="p-0">
                                <div className="list-group list-group-flush rounded-3 overflow-hidden">
                                    <button
                                        className={`list-group-item list-group-item-action p-3 border-0 d-flex align-items-center gap-3 ${activeTab === 'profile' ? 'bg-primary text-white fw-bold' : 'text-muted'}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <FaUser /> Profile Information
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action p-3 border-0 d-flex align-items-center gap-3 ${activeTab === 'security' ? 'bg-primary text-white fw-bold' : 'text-muted'}`}
                                        onClick={() => setActiveTab('security')}
                                    >
                                        <FaShieldAlt /> Security
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={9}>
                        {activeTab === 'profile' && renderProfileTab()}
                        {activeTab === 'security' && renderSecurityTab()}
                    </Col>
                </Row>
            </Container>
        </DashboardLayout>
    );
};

export default SettingsPage;
