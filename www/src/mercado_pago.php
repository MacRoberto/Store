<?php
function createMercadoPagoOrder(float $amount): array
{
    $terminalId = "NEWLAND_N950__SBX0000001";

    /*
     * Referencia única de tu sistema.
     * Después servirá para relacionar la orden
     * de Mercado Pago con tu venta.
     */
    $externalReference =
        'POS-' .
        date('YmdHis') .
        '-' .
        random_int(1000, 9999);

    $body = [
        'type' => 'point',

        'external_reference' => $externalReference,

        /*
         * La orden tendrá una vigencia de 16 minutos.
         */
        'expiration_time' => 'PT16M',

        'transactions' => [
            'payments' => [
                [
                    /*
                     * Mercado Pago espera el importe
                     * como texto con dos decimales.
                     */
                    'amount' => number_format(
                        $amount,
                        2,
                        '.',
                        ''
                    )
                ]
            ]
        ],

        'config' => [
            'point' => [
                'terminal_id' => $terminalId,

                /*
                 * Por ahora no imprimir comprobante.
                 */
                'print_on_terminal' => 'no_ticket'
            ]
        ],

        'description' => 'Point of Sale payment'
    ];

    /*
     * true indica que mercadoPagoRequest()
     * debe agregar X-Idempotency-Key.
     */
    $response = mercadoPagoRequest(
        'POST',
        '/v1/orders',
        $body,
        true
    );

    $order = $response['data'];

    return [
        'success' => true,

        'order_id' =>
        $order['id'] ?? null,

        /*
         * También conviene conservar el ID
         * de la transacción de pago.
         */
        'payment_id' =>
        $order['transactions']['payments'][0]['id']
            ?? null,

        'status' =>
        $order['status'] ?? null,

        'status_detail' =>
        $order['status_detail'] ?? null,

        'external_reference' =>
        $externalReference,

        'order' => $order
    ];
}

function simulateMercadoPagoOrder(
    string $orderId
): array {
    /*
     * Resultado aleatorio:
     *
     * 1 = aprobado
     * 2 = rechazado
     */
    $randomResult = random_int(1, 2);

    if ($randomResult === 1) {
        $simulatedStatus = 'processed';

        /*
         * También simulamos aleatoriamente
         * crédito o débito.
         */
        $paymentMethodType =
            random_int(1, 2) === 1
            ? 'credit_card'
            : 'debit_card';

        $body = [
            'status' => 'processed',
            'payment_method_type' =>
            $paymentMethodType,

            'payment_method_id' =>
            $paymentMethodType === 'credit_card'
                ? 'visa'
                : 'debvisa',

            'status_detail' => 'accredited'
        ];

        if (
            $paymentMethodType ===
            'credit_card'
        ) {
            $body['installments'] = 1;
        }
    } else {
        $simulatedStatus = 'failed';
        $paymentMethodType = 'credit_card';

        $body = [
            'status' => 'failed',
            'payment_method_type' =>
            $paymentMethodType,

            'installments' => 1,
            'payment_method_id' => 'visa',
            'status_detail' =>
            'insufficient_amount'
        ];
    }

    $response = mercadoPagoRequest(
        'POST',
        '/v1/orders/' .
            rawurlencode($orderId) .
            '/events',
        $body
    );

    if ($response['http_code'] !== 204) {
        throw new Exception(
            'Mercado Pago no aceptó la simulación.'
        );
    }

    return [
        'success' => true,
        'order_id' => $orderId,
        'simulated_status' =>
        $simulatedStatus,

        'payment_method_type' =>
        $paymentMethodType,

        'message' =>
        'Simulación enviada correctamente.'
    ];
}

function mercadoPagoRequest(
    string $method,
    string $endpoint,
    ?array $body = null,
    bool $useIdempotencyKey = false
): array {
    $accessToken = " ";

    $headers = [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ];

    if ($useIdempotencyKey) {
        $headers[] = 'X-Idempotency-Key: ' . bin2hex(
            random_bytes(16)
        );
    }

    $curl = curl_init(
        'https://api.mercadopago.com' . $endpoint
    );

    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers
    ]);

    if ($body !== null) {
        curl_setopt(
            $curl,
            CURLOPT_POSTFIELDS,
            json_encode($body)
        );
    }

    $response = curl_exec($curl);

    if ($response === false) {
        $error = curl_error($curl);

        curl_close($curl);

        throw new Exception(
            'Error de conexión con Mercado Pago: ' . $error
        );
    }

    $httpCode = curl_getinfo(
        $curl,
        CURLINFO_HTTP_CODE
    );

    curl_close($curl);

    $responseData = [];

    if ($response !== '') {
        $responseData = json_decode(
            $response,
            true
        ) ?? [];
    }

    if ($httpCode >= 400) {
        throw new Exception(
            $responseData['message']
                ?? 'Mercado Pago rechazó la solicitud'
        );
    }

    return [
        'http_code' => $httpCode,
        'data' => $responseData
    ];
}

function getMercadoPagoOrder(
    string $orderId
): array {
    $response = mercadoPagoRequest(
        'GET',
        '/v1/orders/' .
            rawurlencode($orderId)
    );

    $order = $response['data'];

    $payment =
        $order['transactions']['payments'][0]
        ?? [];

    return [
        'success' => true,
        'order_id' =>
        $order['id'] ?? $orderId,

        'status' =>
        $order['status'] ?? null,

        'status_detail' =>
        $order['status_detail']
            ?? $payment['status_detail']
            ?? null,

        'payment_method_type' =>
        $payment['payment_method']['type']
            ?? $payment['payment_method_type']
            ?? null,

        'payment_id' =>
        $payment['id'] ?? null
    ];
}
