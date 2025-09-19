// FRONT-END: elios_FE/src/pages/pivotPages/UserPage.js
import React from "react";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


import UserNavbar from "../../components/navbars/UserNavbar";

const UserPage = () => {

    return (
        <>
            <header>
                <UserNavbar />
            </header>
           


            <footer>

            </footer>
        </>
    )
}

export default UserPage