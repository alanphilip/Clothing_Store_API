import React, { useState } from "react";
import Login from "./Login";
import ClothesList from "./ClothesList";

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("access_token")
    );

    return (
        <div>
            <h1>Clothing Store</h1>
            {isLoggedIn ? (
                <ClothesList />
            ) : (
                <Login onLogin={() => setIsLoggedIn(true)} />
            )}
        </div>
    );
};

export default App;
