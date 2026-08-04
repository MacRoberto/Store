<?php

return [
    'name' => [
        'label' => 'role name',
        'required' => true,
        'type' => 'string',
        'minLength' => 2,
        'maxLength' => 100,

        'messages' => [
            'required' => 'Role name is required.',
            'type' => 'Role name must be a valid text string.',
            'minLength' => 'Role name must contain at least 2 characters.',
            'maxLength' => 'Role name must not exceed 100 characters.'
        ]
    ],

    'description' => [
        'label' => 'description',
        'required' => true,
        'type' => 'string',
        'minLength' => 2,
        'maxLength' => 65535,

        'messages' => [
            'required' => 'Description is required.',
            'type' => 'Description must be a valid text string.',
            'minLength' => 'Description must contain at least 2 characters.',
            'maxLength' => 'Description must not exceed 65535 characters.'
        ]
    ]
];