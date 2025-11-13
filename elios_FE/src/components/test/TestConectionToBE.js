// elios_FE/src/components/test/TestConnectionToBE.js
import React, { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";

// const TESTAPI = "http://www.elios.com/api/users/me/profile";
 //const TESTAPI = "http://www.elios.com/api/code-practices";
//const TESTAPI = "http://www.elios.com/api/cvbuilder/UserCvs/0be7d2a8-cc77-4ffb-aa06-ba34ab0a4a0a";

const TestConnectionToBE = () => {
    const [result, setResult] = useState("Click the button to test the connection.");
    
    
    const challengeId = "a1b2c3d4-5678-90ab-cdef-1234567890ab";
    const postType = "Solution";
    const apiUrl = API_ENDPOINTS.GET_SOLUTION; 

    const handleTestConnection = async () => {
        try {
            const response = await axios.get(apiUrl, {
                params: {
                    PostType: postType,
                    ReferenceId: challengeId,
                },
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setResult(JSON.stringify(response.data, null, 2));
            console.log("✅ Backend connection successful:", response.data);

        } catch (error) {
            const errorMessage = `❌ API ${apiUrl} Error connecting to backend: ${error.message}`;
            setResult(errorMessage);
            console.error(errorMessage, error.response?.data);
        }
    };

    return (
        <div >
            <h2>Test Connection to Backend</h2>
            <button onClick={handleTestConnection}>Test Connection</button>
            <pre style={{ marginTop: "1rem", border: "1px solid #555", padding: "10px", borderRadius: "5px" }}>
                {result}
            </pre>
        </div>
    );
};

export default TestConnectionToBE;