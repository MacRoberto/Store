<?php

return [
    'username' => [
        'label' => 'username',
        'required' => true,
        'type' => 'string',
        'minLength' => 3,
        'maxLength' => 100,

        'messages' => [
            'required' => 'Username is required.',
            'type' => 'Username must be a valid text string.',
            'minLength' => 'Username must contain at least 3 characters.',
            'maxLength' => 'Username must not exceed 100 characters.'
        ]
    ],

    'password' => [
        'label' => 'password',
        'required' => true,
        'type' => 'string',
        'minLength' => 8,
        'maxLength' => 255,

        'messages' => [
            'required' => 'Password is required.',
            'type' => 'Password must be a valid text string.',
            'minLength' => 'Password must contain at least 8 characters.',
            'maxLength' => 'Password must not exceed 255 characters.'
        ]
    ],

    'id_rol' => [
        'label' => 'role',
        'required' => true,
        'type' => 'number',
        'min' => 1,

        'messages' => [
            'required' => 'Role is required.',
            'type' => 'Role must be a valid number.',
            'min' => 'You must select a valid role.'
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