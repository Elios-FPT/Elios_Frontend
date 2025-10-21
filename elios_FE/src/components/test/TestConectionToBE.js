// elios_FE/src/components/test/TestConnectionToBE.js
import React from "react";
import axios from "axios";

const TestConnectionToBE = () => {
    const handleTestConnection = async () => {
        try {
            const response = await axios.get("http://whoami.elios.com", {
                headers: {
                    Authorization: `Bearer 1BYYfGYlACiEvr4Em1oeRra65ZVWyKOyQh6KlghyG77pz2Vu9MZRNggbbTAydtfZLcSJk2DGV9EwEr9NDs7YTf2XHyO1zVHWw4`,
                },
                withCredentials: true, // optional if you need cookies
            });

            console.log("✅ Backend connection successful:", response.data);
        } catch (error) {
            console.error("❌ Error connecting to backend:", error);
        }
    };

    return (
        <div style={{ color: "#eee" }}>
            <h2>Test Connection to Backend</h2>
            <button onClick={handleTestConnection}>Test Connection</button>
        </div>
    );
};

export default TestConnectionToBE;
