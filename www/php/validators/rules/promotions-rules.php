<?php

return [
    'name' => [
        'label' => 'promotion name',
        'required' => true,
        'type' => 'string',
        'minLength' => 2,
        'maxLength' => 150,

        'messages' => [
            'required' => 'Promotion name is required.',
            'type' => 'Promotion name must be a valid text string.',
            'minLength' => 'Promotion name must contain at least 2 characters.',
            'maxLength' => 'Promotion name must not exceed 150 characters.'
        ]
    ],

    'description' => [
        'label' => 'description',
        'required' => false,
        'type' => 'string',
        'maxLength' => 65535,

        'messages' => [
            'type' => 'Description must be a valid text string.',
            'maxLength' => 'Description must not exceed 65535 characters.'
        ]
    ],

    'date_start' => [
        'label' => 'start date',
        'required' => true,
        'type' => 'date',

        'messages' => [
            'required' => 'Start date is required.',
            'type' => 'Start date must be a valid date.'
        ]
    ],

    'date_end' => [
        'label' => 'end date',
        'required' => true,
        'type' => 'date',

        'messages' => [
            'required' => 'End date is required.',
            'type' => 'End date must be a valid date.'
        ]
    ],

    'percent_off' => [
        'label' => 'discount percentage',
        'required' => true,
        'type' => 'number',
        'min' => 1,
        'max' => 100,

        'messages' => [
            'required' => 'Discount percentage is required.',
            'type' => 'Discount percentage must be a valid number.',
            'min' => 'Discount percentage must be at least 1.',
            'max' => 'Discount percentage must not exceed 100.'
        ]
    ],

    'status' => [
        'label' => 'status',
        'required' => true,
        'allowedValues' => [
            'Active',
            'Inactive'
        ],

        'messages' => [
            'required' => 'Status is required.',
            'allowedValues' => 'Status must be Active or Inactive.'
        ]
    ]
];