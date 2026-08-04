<?php

    return [
        
        'user_id' => [
            'label' => 'User',
            'required' => true,
            'type' => 'integer',
            'min' => 1,

            'messages' => [
                'required' => 'User is required.',
                'type' => 'User must be a valid number.',
                'min' => 'Please select a valid user.'
            ]
        ],

        'transaction_date' => [
            'label' => 'Transaction date',
            'required' => true,
            'type' => 'string',
            'minLength' => 10,
            'maxLength' => 19,

            'messages' => [
                'required' => 'Transaction date is required.',
                'minLength' => 'Transaction date format is invalid.',
                'maxLength' => 'Transaction date format is invalid.'
            ]
        ],

        'total_amount' => [
            'label' => 'Total amount',
            'required' => true,
            'type' => 'numeric',
            'min' => 0.01,

            'messages' => [
                'required' => 'Total amount is required.',
                'type' => 'Total amount must be a valid number.',
                'min' => 'Total amount must be greater than 0.'
            ]
        ],

        'payment_method' => [
            'label' => 'Payment method',
            'required' => true,
            'type' => 'string',
            'maxLength' => 20,

            'messages' => [
                'required' => 'Payment method is required.',
                'maxLength' => 'Payment method is too long.'
            ]
        ],

        'status' => [
            'label' => 'Status',
            'required' => true,
            'type' => 'string',
            'maxLength' => 20,

            'messages' => [
                'required' => 'Status is required.',
                'maxLength' => 'Status is too long.'
            ]
        ],
    ];

?>