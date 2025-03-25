flowchart TD
    A[🖥️ <b style="color:black">Interfaţa Utilizator-Frontend</b>]
    B[(💾 <b style="color:black">Baza de Date</b>)]
    C[🔗 <b style="color:black">Blockchain - Ganache</b>]
    D[🔧 <b style="color:black">Backend - Flask API</b>]

    A --> D
    D -->|📥 Stocare| B
    B -->|📤 Preluare| D
    A -->|⚡ Solidity Smart Contract| C
    C -->|✅ Răspuns| A

    %% Stilizare
    style A fill:#87CEEB,stroke:#333,stroke-width:2px;
    style B fill:#98FB98,stroke:#333,stroke-width:2px;
    style C fill:#FF6347,stroke:#333,stroke-width:2px;
    style D fill:#FFDD44,stroke:#333,stroke-width:2px;
