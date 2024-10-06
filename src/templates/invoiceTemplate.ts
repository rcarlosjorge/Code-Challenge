export const InvoiceTemplate = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Factura de Viaje en Taxi</title>
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .invoice-box {
        background-color: #ffffff;
        padding: 30px;
        border: 1px solid #ddd;
        max-width: 800px;
        margin: 40px auto;
        border-radius: 8px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo img {
        max-width: 120px;
      }
      .company-details h2 {
        margin: 10px 0;
        font-size: 24px;
        color: #004080;
      }
      .company-details p {
        margin: 2px 0;
        font-size: 14px;
        color: #555;
      }
      .invoice-info {
        margin-bottom: 20px;
        font-size: 16px;
        color: #333;
      }
      .invoice-info p {
        margin: 6px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        font-size: 16px;
        color: #333;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      table th,
      table td {
        padding: 15px;
        text-align: left;
        border-bottom: 2px solid #ddd;
      }
      table th {
        background-color: #e3f2fd;
        color: #1e88e5;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: bold;
      }
      table tbody tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      table tbody tr:nth-child(odd) {
        background-color: #ffffff;
      }
      table tbody td {
        padding: 15px;
        font-size: 15px;
        color: #555;
      }
      table tbody tr:hover {
        background-color: #f1f1f1;
        transition: background-color 0.3s ease;
      }
      .summary {
        text-align: right;
        margin-top: 20px;
        font-size: 18px;
      }
      .summary strong {
        font-size: 20px;
        color: #333;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        font-size: 13px;
        color: #777;
      }
      .footer p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="invoice-box">
      <div class="header">
        <div class="logo">
          <img src="{{company_logo}}" alt="Logo" />
        </div>
        <div class="company-details">
          <h2>{{company_name}}</h2>
          <p>{{company_address}}</p>
          <p>Teléfono: {{company_phone}}</p>
        </div>
      </div>

      <div class="invoice-info">
        <p><strong>Número de Factura:</strong> {{invoice_number}}</p>
        <p><strong>Fecha del Viaje:</strong> {{created_date}}</p>
        <p><strong>Cliente:</strong> {{customer_name}}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Viaje desde {{trip_origin}} hasta {{trip_destination}}
              ({{trip_distance}} km)
            </td>
            <td>1</td>
            <td>RD$ {{price_per_km}}/km</td>
            <td>RD$ {{trip_total}}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary">
        <p><strong>Subtotal RD$:</strong> {{trip_total}}</p>
        <p><strong>Impuestos RD$:</strong> {{tax}}</p>
        <p><strong>Total RD$:</strong> {{total}}</p>
      </div>

      <div class="footer">
        <p>Gracias por viajar con nosotros.</p>
        <p>Para cualquier consulta o reclamación, por favor contáctenos.</p>
      </div>
    </div>
  </body>
</html>
`;
