<?php
return [
    'name' => [
        'label' => 'product name',
        'required' => true,
        'type' => 'string',
        'minLength' => 2,
        'maxLength' => 100,

        'messages' => [
            'required' => 'Product name is required.',
            'minLength' => 'Product name must contain at least 2 characters.',
            'maxLength' => 'Product name must not exceed 100 characters.'
        ]
    ],

    'barcode' => [
        'label' => 'barcode',
        'required' => true,
        'type' => 'string',
        'minLength' => 3,
        'maxLength' => 50,
        'pattern' => '/^[a-zA-Z0-9\-]+$/',

        'messages' => [
            'required' => 'Barcode is required.',
            'pattern' => 'Barcode may only contain letters, numbers and hyphens.'
        ]
    ],

    'category' => [
        'label' => 'category',
        'required' => true,
        'type' => 'integer',
        'min' => 1,

        'messages' => [
            'required' => 'Category is required.',
            'type' => 'Category must be valid.',
            'min' => 'Category must be valid.'
        ]
    ],

    'reorder_level' => [
        'label' => 'reorder level',
        'required' => true,
        'type' => 'integer',
        'min' => 0,

        'messages' => [
            'required' => 'Reorder level is required.',
            'type' => 'Reorder level must be an integer.',
            'min' => 'Reorder level cannot be negative.'
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