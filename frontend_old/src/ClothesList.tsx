import React, { useEffect, useState } from "react";
import { getClothes } from "./api";

const ClothesList: React.FC = () => {
    const [clothes, setClothes] = useState<any[]>([]);

    useEffect(() => {
        getClothes().then(setClothes).catch(() => alert("Failed to fetch clothes"));
    }, []);

    return (
        <div>
            <h2>Clothes</h2>
            <ul>
                {clothes.map((c) => (
                    <li key={c.cloth_id}>
                        {c.name} — ${c.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClothesList;
