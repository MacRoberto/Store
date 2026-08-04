<?php

return [
    'name' => [
        'label' => 'module name',
        'required' => true,
        'type' => 'string',
        'minLength' => 2,
        'maxLength' => 100,

        'messages' => [
            'required' => 'Module name is required.',
            'type' => 'Module name must be a valid text string.',
            'minLength' => 'Module name must contain at least 2 characters.',
            'maxLength' => 'Module name must not exceed 100 characters.'
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
    ],

    'img' => [
        'label' => 'icon',
        'required' => true,
        'type' => 'string',
        'minLength' => 2,
        'maxLength' => 255,

        'messages' => [
            'required' => 'Icon is required.',
            'type' => 'Icon must be a valid text string.',
            'minLength' => 'Icon must contain at least 2 characters.',
            'maxLength' => 'Icon must not exceed 255 characters.'
        ]
    ],

    'url' => [
        'label' => 'URL',
        'required' => true,
        'type' => 'string',
        'minLength' => 1,
        'maxLength' => 255,

        'messages' => [
            'required' => 'URL is required.',
            'type' => 'URL must be a valid text string.',
            'minLength' => 'URL must contain at least 1 character.',
            'maxLength' => 'URL must not exceed 255 characters.'
        ]
    ]
];