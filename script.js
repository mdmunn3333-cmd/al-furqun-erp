body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8fafc;
    margin: 0;
    padding: 20px;
    color: #1e293b;
}

.dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.admin-btn {
    background-color: #e2e8f0;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.card {
    background: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-left: 5px solid #0284c7;
}

.card h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #64748b;
}

.card p {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
}

.table-section {
    background: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.table-responsive {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    text-align: left;
}

th, td {
    padding: 12px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 14px;
}

th {
    background-color: #f1f5f9;
    color: #475569;
}

.delete-btn {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}
