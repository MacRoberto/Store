<?php

return [
    'name' => [
        'label' => 'action name',
        'required' => true,
        'type' => 'string',
        'minLength' => 2,
        'maxLength' => 100,

        'messages' => [
            'required' => 'Action name is required.',
            'type' => 'Action name must be a valid text string.',
            'minLength' => 'Action name must contain at least 2 characters.',
            'maxLength' => 'Action name must not exceed 100 characters.'
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

    'id_module' => [
        'label' => 'module',
        'required' => true,
        'type' => 'number',
        'min' => 1,

        'messages' => [
            'required' => 'Module is required.',
            'type' => 'Module must be a valid number.',
            'min' => 'You must select a valid module.'
        ]
    ],

    'permission_key' => [
        'label' => 'permission key',
        'required' => false,
        'type' => 'string',
        'maxLength' => 150,

        'messages' => [
            'type' => 'Permission key must be a valid text string.',
            'maxLength' => 'Permission key must not exceed 150 characters.'
        ]
    ]
];