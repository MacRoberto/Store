<?php

return [
    'username' => [
        'label' => 'username',
        'required' => true,
        'type' => 'string',
        'minLength' => 3,
        'maxLength' => 50,

        'messages' => [
            'required' => 'Username is required.',
            'minLength' => 'Username must contain at least 3 characters.',
            'maxLength' => 'Username must not exceed 50 characters.'
        ]
    ],

    'password' => [
        'label' => 'password',
        'required' => true,
        'type' => 'string',
        'minLength' => 5,
        'maxLength' => 255,

        'messages' => [
            'required' => 'Password is required.',
            'minLength' => 'Password must contain at least 5 characters.',
            'maxLength' => 'Password must not exceed 255 characters.'
        ]
    ],

    'id_rol' => [
        'label' => 'Role',
        'required' => true,
        'type' => 'integer',
        'min' => 1,

        'messages' => [
            'required' => 'Role is required.',
            'type' => 'Role must be a valid number.',
            'min' => 'Please select a valid role.'
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
]

?>
