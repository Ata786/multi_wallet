import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AppNavbar = () => {
    const location = useLocation();
    const isLanding = location.pathname === '/';

    return (
        <Navbar expand="lg" variant={isLanding ? 'dark' : 'light'} className={isLanding ? 'bg-transparent' : 'bg-white shadow-sm'}>
            <Container>
                <Navbar.Brand as={Link} to="/" className={`fw-bold fs-4 ${isLanding ? 'text-white' : 'text-primary-custom'}`}>
                    MultiWallet Bank
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto gap-2">
                        <Button as={Link} to="/login" variant={isLanding ? "outline-light" : "outline-primary"}>
                            Login
                        </Button>
                        <Button as={Link} to="/register" variant={isLanding ? "light" : "primary"} className={isLanding ? "text-primary fw-bold" : "text-white"}>
                            Get Started
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;
