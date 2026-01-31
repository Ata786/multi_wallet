import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Form, ProgressBar } from 'react-bootstrap';
import { FaUser, FaShieldAlt, FaBell, FaCog, FaCamera, FaQrcode, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const renderProfileTab = () => (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5 position-relative d-inline-block start-50 translate-middle-x">
                    <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '120px', height: '120px' }}>
                        <FaUser size={50} className="text-secondary" />
                    </div>
                    <Button variant="primary" size="sm" className="rounded-circle position-absolute bottom-0 end-0 border-2 border-white btn-icon shadow-sm">
                        <FaCamera />
                    </Button>
                </div>

                <Row className="g-4">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-uppercase text-muted">Full Name</Form.Label>
                            <Form.Control type="text" defaultValue="Arslan" className="bg-light fw-bold border-0 py-2" />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-uppercase text-muted">Email Address</Form.Label>
                            <div className="input-group">
                                <Form.Control type="email" defaultValue="arslan@example.com" disabled className="bg-light border-0 py-2" />
                                <span className="input-group-text bg-success-subtle text-success border-0 px-3 fw-bold small">Verified</span>
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-uppercase text-muted">Phone Number</Form.Label>
                            <div className="input-group">
                                <Form.Control type="tel" defaultValue="+1 (555) 123-4567" className="bg-light border-0 py-2" />
                                <Button variant="outline-primary" size="sm" className="px-3">Verify</Button>
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-uppercase text-muted">Country</Form.Label>
                            <Form.Select className="bg-light border-0 py-2">
                                <option>United States</option>
                                <option>United Kingdom</option>
                                <option>Canada</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end mt-5">
                    <Button variant="primary" className="btn-gradient px-4 py-2 fw-bold">Save Changes</Button>
                </div>
            </Card.Body>
        </Card>
    );

    const renderSecurityTab = () => (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
                <h5 className="fw-bold mb-4">Change Password</h5>
                <Row className="g-3 mb-5">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Current Password</Form.Label>
                            <Form.Control type="password" />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-bold">New Password</Form.Label>
                            <Form.Control type="password" />
                            <ProgressBar now={60} variant="warning" className="mt-2" style={{ height: '4px' }} />
                            <Form.Text className="text-muted small">Strong password required.</Form.Text>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Confirm New Password</Form.Label>
                            <Form.Control type="password" />
                        </Form.Group>
                    </Col>
                    <Col xs={12} className="text-end">
                        <Button variant="outline-primary">Update Password</Button>
                    </Col>
                </Row>

                <hr className="my-5" />

                <h5 className="fw-bold mb-4">Two-Factor Authentication</h5>
                <div className="d-flex align-items-center justify-content-between p-4 bg-light rounded-3 mb-4">
                    <div>
                        <h6 className="fw-bold mb-1">Two-Factor Authentication (2FA)</h6>
                        <p className="text-muted small mb-0">Secure your account with an extra layer of protection.</p>
                    </div>
                    <Form.Check type="switch" id="2fa-switch" className="fs-4" />
                </div>

                <hr className="my-5" />

                <h5 className="fw-bold mb-4">Active Sessions</h5>
                <div className="border rounded bg-white">
                    {[1, 2].map((i) => (
                        <div key={i} className={`p-3 d-flex justify-content-between align-items-center ${i === 1 ? 'border-bottom' : ''}`}>
                            <div>
                                <h6 className="fw-bold small mb-1">{i === 1 ? 'Chrome on Windows' : 'Safari on iPhone'}</h6>
                                <p className="text-muted small mb-0">{i === 1 ? 'Lagos, Nigeria • Current Session' : 'London, UK • 2 hours ago'}</p>
                            </div>
                            <Button variant="light" size="sm" className="text-danger border-0">Logout</Button>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );

    const renderNotificationsTab = () => (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
                <div className="mb-5">
                    <h5 className="fw-bold mb-3">Email Notifications</h5>
                    <div className="d-flex flex-column gap-3">
                        {['Transaction confirmations', 'Fraud alerts', 'Weekly summaries', 'Marketing emails'].map((item, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center border-bottom pb-3">
                                <span className="text-dark">{item}</span>
                                <Form.Check type="switch" defaultChecked={i < 2} />
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h5 className="fw-bold mb-3">Push Notifications</h5>
                    <div className="d-flex flex-column gap-3">
                        {['Real-time transaction alerts', 'Fraud detection alerts', 'Exchange rate changes'].map((item, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center border-bottom pb-3">
                                <span className="text-dark">{item}</span>
                                <Form.Check type="switch" defaultChecked />
                            </div>
                        ))}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    const renderPreferencesTab = () => (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
                <Row className="g-4 mb-5">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold small">Default Currency</Form.Label>
                            <Form.Select><option>USD ($)</option><option>EUR (€)</option></Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold small">Language</Form.Label>
                            <Form.Select><option>English (US)</option><option>Spanish</option></Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold small">Time Zone</Form.Label>
                            <Form.Select><option>(GMT-05:00) Eastern Time</option></Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold small">Theme</Form.Label>
                            <Form.Select><option>Light</option><option>Dark</option><option>System</option></Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end">
                    <Button variant="primary" className="btn-gradient px-4">Save Preferences</Button>
                </div>

                <hr className="my-5" />

                <div className="border border-danger border-opacity-25 rounded-3 p-4 bg-danger bg-opacity-10">
                    <h5 className="text-danger fw-bold">Danger Zone</h5>
                    <p className="text-muted small">Once you delete your account, there is no going back. Please be certain.</p>
                    <Button variant="danger" className="d-flex align-items-center gap-2"><FaTrash /> Close Account</Button>
                </div>
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
                                    <button
                                        className={`list-group-item list-group-item-action p-3 border-0 d-flex align-items-center gap-3 ${activeTab === 'notifications' ? 'bg-primary text-white fw-bold' : 'text-muted'}`}
                                        onClick={() => setActiveTab('notifications')}
                                    >
                                        <FaBell /> Notifications
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action p-3 border-0 d-flex align-items-center gap-3 ${activeTab === 'preferences' ? 'bg-primary text-white fw-bold' : 'text-muted'}`}
                                        onClick={() => setActiveTab('preferences')}
                                    >
                                        <FaCog /> Preferences
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={9}>
                        {activeTab === 'profile' && renderProfileTab()}
                        {activeTab === 'security' && renderSecurityTab()}
                        {activeTab === 'notifications' && renderNotificationsTab()}
                        {activeTab === 'preferences' && renderPreferencesTab()}
                    </Col>
                </Row>
            </Container>
        </DashboardLayout>
    );
};

export default SettingsPage;
