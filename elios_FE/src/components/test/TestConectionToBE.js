// elios_FE/src/components/test/TestConnectionToBE.js
import React, { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";

const TestConnectionToBE = () => {
    // Initialize state with a helpful message
    const [result, setResult] = useState("Click the button to test the connection.");

    const handleTestConnection = async () => {
        try {
            // Await the response from the GET request
            const response = await axios.get(API_ENDPOINTS.GET_POSTS_FORUM, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // On success, update the state with the data from the response
            // Axios puts the response body in the `data` property
            // JSON.stringify formats the object nicely for display
            setResult(JSON.stringify(response.data, null, 2));
            console.log("✅ Backend connection successful:", response.data);

        } catch (error) {
            // If axios throws an error (e.g., 404, 500), it will be caught here
            const errorMessage = `❌ API ${API_ENDPOINTS.GET_POSTS_FORUM}  Error connecting to backend: ${error.message}`;
            setResult(errorMessage);
            console.error(errorMessage, error.response?.data); // Log more details if available
        }
    };

    return (
        <div >
            <h2>Test Connection to Backend</h2>
            <button onClick={handleTestConnection}>Test Connection</button>
            {/* Use a <pre> tag to preserve the formatting of the JSON string */}
            <pre style={{ marginTop: "1rem", border: "1px solid #555", padding: "10px", borderRadius: "5px" }}>
                {result}
            </pre>
        </div>
    );
};

export default TestConnectionToBE;