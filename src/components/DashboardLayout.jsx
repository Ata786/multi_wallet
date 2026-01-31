import React from 'react';
import { Navbar, Container, Nav, Dropdown, Badge, Button } from 'react-bootstrap';
import { Link, useLocation, Outlet } from 'react-router-dom'; // Added Outlet
import { FaBell, FaUserCircle, FaWallet, FaExchangeAlt, FaChartBar, FaHome } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';

const DashboardLayout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <Navbar expand="lg" className="bg-white shadow-sm sticky-top">
                <Container>
                    <Navbar.Brand as={Link} to="/dashboard" className="fw-bold fs-4 text-primary-custom">
                        MultiWallet Bank
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="dashboard-nav" />
                    <Navbar.Collapse id="dashboard-nav">
                        <Nav className="mx-auto">
                            <Nav.Link as={Link} to="/dashboard" className={`d-flex align-items-center gap-2 ${location.pathname === '/dashboard' ? 'text-primary fw-bold' : 'text-muted'}`}>
                                <FaHome /> Home
                            </Nav.Link>
                            <Nav.Link as={Link} to="/transactions" className={`d-flex align-items-center gap-2 ${location.pathname === '/transactions' ? 'text-primary fw-bold' : 'text-muted'}`}>
                                <FaExchangeAlt /> Transactions
                            </Nav.Link>
                            <Nav.Link as={Link} to="/transfer" className={`d-flex align-items-center gap-2 ${location.pathname === '/transfer' ? 'text-primary fw-bold' : 'text-muted'}`}>
                                <FaExchangeAlt /> Transfer
                            </Nav.Link>
                            <Nav.Link as={Link} to="/reports" className={`d-flex align-items-center gap-2 ${location.pathname === '/reports' ? 'text-primary fw-bold' : 'text-muted'}`}>
                                <FaChartBar /> Reports
                            </Nav.Link>
                        </Nav>
                        <div className="d-flex align-items-center gap-3">
                            <NotificationDropdown />
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="link" className="p-0 text-decoration-none text-dark d-flex align-items-center gap-2" id="dropdown-user">
                                    <div className="bg-light rounded-circle p-1 border">
                                        <FaUserCircle size={24} className="text-secondary" />
                                    </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/settings">Profile & Settings</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item as={Link} to="/">Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="flex-grow-1">
                {children || <Outlet />}
            </div>
        </div>
    );
};

export default DashboardLayout;
